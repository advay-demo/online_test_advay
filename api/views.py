# ----------------------------
# IMPORTS
# ----------------------------
from django.http import Http404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db import IntegrityError

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import (
    api_view, authentication_classes, permission_classes
)

from yaksh.models import (
    Question, Quiz, QuestionPaper, QuestionSet,
    AnswerPaper, Course, Answer, Profile, CourseStatus,
    Badge, UserBadge, BadgeProgress, UserStats, UserActivity,
    DailyActivity, Lesson, LearningModule, LearningUnit, LessonFile,
    TestCase, McqTestCase, StdIOBasedTestCase, StandardTestCase,
    HookTestCase, IntegerTestCase, StringTestCase, FloatTestCase,
    ArrangeTestCase
)
from yaksh.models import get_model_class
from yaksh.views import is_moderator, get_html_text
from django.db.models import Q, Count, Avg, Sum, F, FloatField
from django.utils import timezone
from datetime import datetime, timedelta
import json
from collections import defaultdict

from yaksh.code_server import get_result as get_result_from_code_server
from yaksh.settings import SERVER_POOL_PORT, SERVER_HOST_NAME

from api.serializers import (
    QuestionSerializer, QuizSerializer, QuestionPaperSerializer,
    AnswerPaperSerializer, CourseSerializer, BadgeSerializer,
    UserBadgeSerializer, BadgeProgressSerializer, UserStatsSerializer,
    UserActivitySerializer, CourseProgressSerializer, CourseCatalogSerializer,
    LessonDetailSerializer, LearningModuleDetailSerializer, LearningUnitDetailSerializer
)

import json


# ============================================================
#  OLD LOGIN ENDPOINT — COMMENTED OUT AS REQUESTED
# ============================================================
# @api_view(['POST'])
# @authentication_classes(())
# @permission_classes(())
# def login(request):
#     data = {}
#     if request.method == "POST":
#         username = request.data.get('username')
#         password = request.data.get('password')
#         user = authenticate(username=username, password=password)
#         if user is not None and user.is_authenticated:
#             token, created = Token.objects.get_or_create(user=user)
#             data = {'token': token.key}
#     return Response(data, status=status.HTTP_201_CREATED)


# ============================================================
#  NEW AUTH SYSTEM (REGISTER / LOGIN / LOGOUT / PROFILE)
# ============================================================

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def register_user(request):
    """Register a new user"""
    try:
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        roll_number = request.data.get('roll_number', '')
        institute = request.data.get('institute', '')
        department = request.data.get('department', '')
        position = request.data.get('position', '')
        timezone = request.data.get('timezone', 'Asia/Kolkata')

        # Required validation
        if not username or not email or not password or not first_name or not last_name:
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)

        # Create user
        user = User.objects.create_user(
            username=username, email=email, password=password,
            first_name=first_name, last_name=last_name
        )

        # Create profile
        profile, created = Profile.objects.get_or_create(user=user)
        profile.roll_number = roll_number
        profile.institute = institute
        profile.department = department
        profile.position = position
        profile.timezone = timezone
        profile.save()

        token, created = Token.objects.get_or_create(user=user)
        login(request, user, backend='django.contrib.auth.backends.ModelBackend')

        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_moderator': profile.is_moderator,
                'roll_number': profile.roll_number,
                'institute': profile.institute,
                'department': profile.department,
                'position': profile.position,
                'timezone': profile.timezone,
                'bio': profile.bio,
                'phone': profile.phone,
                'city': profile.city,
                'country': profile.country,
                'linkedin': profile.linkedin,
                'github': profile.github,
                'display_name': profile.display_name,
            },
            'token': token.key,
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': 'Registration failed', 'details': str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def login_user(request):
    """User login endpoint"""
    try:
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'error': 'Username and password required'},
                            status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response({'error': 'Invalid credentials'},
                            status=status.HTTP_401_UNAUTHORIZED)

        token, created = Token.objects.get_or_create(user=user)
        login(request, user, backend='django.contrib.auth.backends.ModelBackend')

        profile, created = Profile.objects.get_or_create(user=user)

        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_moderator': profile.is_moderator,
                'roll_number': profile.roll_number,
                'institute': profile.institute,
                'department': profile.department,
                'position': profile.position,
                'timezone': profile.timezone,
                'bio': profile.bio,
                'phone': profile.phone,
                'city': profile.city,
                'country': profile.country,
                'linkedin': profile.linkedin,
                'github': profile.github,
                'display_name': profile.display_name,
            },
            'token': token.key,
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': 'Login failed', 'details': str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_user(request):
    """Logout endpoint"""
    request.user.auth_token.delete()
    logout(request)
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def get_user_profile(request):
    """Fetch user profile"""
    try:
        username = request.GET.get('username')
        if not username:
            return Response({'error': 'Username required'},
                            status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.get(username=username)
        profile, created = Profile.objects.get_or_create(user=user)

        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_moderator': profile.is_moderator,
                'roll_number': profile.roll_number,
                'institute': profile.institute,
                'department': profile.department,
                'position': profile.position,
                'timezone': profile.timezone,
                'bio': profile.bio,
                'phone': profile.phone,
                'city': profile.city,
                'country': profile.country,
                'linkedin': profile.linkedin,
                'github': profile.github,
                'display_name': profile.display_name,
            }
        }, status=status.HTTP_200_OK)

    except User.DoesNotExist:
        return Response({'error': 'User not found'},
                        status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def update_user_profile(request):
    """Update user profile"""
    try:
        username = request.data.get('username')
        if not username:
            return Response({'error': 'Username required'},
                            status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.get(username=username)
        profile, created = Profile.objects.get_or_create(user=user)

        email = request.data.get('email')
        if email and email != user.email:
            if User.objects.filter(email=email).exclude(id=user.id).exists():
                return Response({'error': 'Email already exists'},
                                status=status.HTTP_400_BAD_REQUEST)
            user.email = email

        # Update base user info
        user.first_name = request.data.get('first_name', user.first_name)
        user.last_name = request.data.get('last_name', user.last_name)
        user.save()

        # Update profile fields
        profile.roll_number = request.data.get('roll_number', profile.roll_number)
        profile.institute = request.data.get('institute', profile.institute)
        profile.department = request.data.get('department', profile.department)
        profile.position = request.data.get('position', profile.position)
        profile.timezone = request.data.get('timezone', profile.timezone)
        profile.bio = request.data.get('bio', profile.bio)
        profile.phone = request.data.get('phone', profile.phone)
        profile.city = request.data.get('city', profile.city)
        profile.country = request.data.get('country', profile.country)
        profile.linkedin = request.data.get('linkedin', profile.linkedin)
        profile.github = request.data.get('github', profile.github)
        profile.display_name = request.data.get('display_name', profile.display_name)
        profile.save()

        return Response({'message': 'Profile updated'}, status=status.HTTP_200_OK)

    except User.DoesNotExist:
        return Response({'error': 'User not found'},
                        status=status.HTTP_404_NOT_FOUND)


# ============================================================
#  ORIGINAL FOSSEE API VIEWS (UNCHANGED)
# ============================================================

class QuestionList(APIView):
    def get(self, request, format=None):
        questions = Question.objects.filter(user=request.user)
        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        serializer = QuestionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class QuestionDetail(APIView):
    def get_question(self, pk, user):
        try:
            return Question.objects.get(pk=pk, user=user)
        except Question.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        question = self.get_question(pk, request.user)
        serializer = QuestionSerializer(question)
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        question = self.get_question(pk, request.user)
        serializer = QuestionSerializer(question, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        question = self.get_question(pk, request.user)
        question.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CourseList(APIView):
    def get(self, request, format=None):
        courses = Course.objects.filter(students=request.user)
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)


class StartQuiz(APIView):
    def get_quiz(self, pk, user):
        try:
            return Quiz.objects.get(pk=pk)
        except Quiz.DoesNotExist:
            raise Http404

    def get(self, request, course_id, quiz_id, format=None):
        context = {}
        user = request.user
        quiz = self.get_quiz(quiz_id, user)
        questionpaper = quiz.questionpaper_set.first()

        last_attempt = AnswerPaper.objects.get_user_last_attempt(
            questionpaper, user, course_id)

        if last_attempt and last_attempt.is_attempt_inprogress():
            serializer = AnswerPaperSerializer(last_attempt)
            context["time_left"] = last_attempt.time_left()
            context["answerpaper"] = serializer.data
            return Response(context)

        can_attempt, msg = questionpaper.can_attempt_now(user, course_id)
        if not can_attempt:
            return Response({'message': msg})

        attempt_number = 1 if not last_attempt else last_attempt.attempt_number + 1
        ip = request.META['REMOTE_ADDR']

        answerpaper = questionpaper.make_answerpaper(
            user, ip, attempt_number, course_id
        )

        serializer = AnswerPaperSerializer(answerpaper)
        context["time_left"] = answerpaper.time_left()
        context["answerpaper"] = serializer.data
        return Response(context, status=status.HTTP_201_CREATED)


class QuizList(APIView):
    def get(self, request, format=None):
        quizzes = Quiz.objects.filter(creator=request.user)
        serializer = QuizSerializer(quizzes, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        serializer = QuizSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class QuizDetail(APIView):
    def get_quiz(self, pk, user):
        try:
            return Quiz.objects.get(pk=pk, creator=user)
        except Quiz.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        quiz = self.get_quiz(pk, request.user)
        serializer = QuizSerializer(quiz)
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        quiz = self.get_quiz(pk, request.user)
        serializer = QuizSerializer(quiz, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        quiz = self.get_quiz(pk, request.user)
        quiz.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class QuestionPaperList(APIView):
    def get(self, request, format=None):
        questionpapers = QuestionPaper.objects.filter(quiz__creator=request.user)
        serializer = QuestionPaperSerializer(questionpapers, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        serializer = QuestionPaperSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            quiz_id = request.data.get('quiz')
            question_ids = request.data.get('fixed_questions', [])
            questionset_ids = request.data.get('random_questions', [])

            if QuestionPaper.objects.filter(quiz=quiz_id).exists():
                return Response({'error': 'Already exists'},
                                status=status.HTTP_409_CONFLICT)

            # validate ownership
            if not Quiz.objects.filter(pk=quiz_id, creator=user).exists():
                raise Http404

            for qid in question_ids:
                if not Question.objects.filter(pk=qid, user=user).exists():
                    raise Http404

            for qset_id in questionset_ids:
                qset = QuestionSet.objects.get(pk=qset_id)
                for q in qset.questions.all():
                    if q.user != user:
                        raise Http404

            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)


class QuestionPaperDetail(APIView):
    def get_questionpaper(self, pk, user):
        try:
            return QuestionPaper.objects.get(pk=pk, quiz__creator=user)
        except QuestionPaper.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        questionpaper = self.get_questionpaper(pk, request.user)
        serializer = QuestionPaperSerializer(questionpaper)
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        questionpaper = self.get_questionpaper(pk, request.user)
        serializer = QuestionPaperSerializer(questionpaper, data=request.data)
        if serializer.is_valid():
            user = request.user
            quiz_id = request.data.get('quiz')
            question_ids = request.data.get('fixed_questions', [])
            questionset_ids = request.data.get('random_questions', [])

            if not Quiz.objects.filter(pk=quiz_id, creator=user).exists():
                raise Http404

            for qid in question_ids:
                if not Question.objects.filter(pk=qid, user=user).exists():
                    raise Http404

            for qset_id in questionset_ids:
                qset = QuestionSet.objects.get(pk=qset_id)
                for q in qset.questions.all():
                    if q.user != user:
                        raise Http404

            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        questionpaper = self.get_questionpaper(pk, request.user)
        questionpaper.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AnswerPaperList(APIView):
    def get(self, request, format=None):
        answerpapers = AnswerPaper.objects.filter(
            question_paper__quiz__creator=request.user
        )
        serializer = AnswerPaperSerializer(answerpapers, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        try:
            qp_id = request.data['question_paper']
            attempt_number = request.data['attempt_number']
            course_id = request.data['course']
        except KeyError:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        ip = request.META['REMOTE_ADDR']

        questionpaper = QuestionPaper.objects.get(pk=qp_id)
        course = Course.objects.get(pk=course_id)

        if not (
            user in course.students.all() or
            user in course.teachers.all() or
            user == course.creator
        ):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        answerpaper = questionpaper.make_answerpaper(
            user, ip, attempt_number, course_id
        )

        serializer = AnswerPaperSerializer(answerpaper)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AnswerValidator(APIView):
    def post(self, request, answerpaper_id, question_id, format=None):
        user = request.user
        answerpaper = AnswerPaper.objects.get(pk=answerpaper_id, user=user)
        question = Question.objects.get(pk=question_id)

        if question not in answerpaper.questions.all():
            raise Http404

        try:
            if question.type in ['mcq', 'mcc']:
                user_answer = request.data['answer']
            elif question.type == 'integer':
                user_answer = int(request.data['answer'][0])
            elif question.type == 'float':
                user_answer = float(request.data['answer'][0])
            else:
                user_answer = request.data['answer']
        except KeyError:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        ans = Answer.objects.create(question=question, answer=user_answer)
        answerpaper.answers.add(ans)
        answerpaper.save()

        json_data = None
        if question.type in ['code', 'upload']:
            json_data = question.consolidate_answer_data(user_answer, user)

        result = answerpaper.validate_answer(user_answer, question, json_data, ans.id)

        if question.type not in ['code', 'upload']:
            if result.get('success'):
                ans.correct = True
                ans.marks = question.points
            ans.error = json.dumps(result.get('error'))
            ans.save()
            answerpaper.update_marks(state='inprogress')

        return Response(result)

    def get(self, request, uid):
        ans = Answer.objects.get(pk=uid)
        url = f"{SERVER_HOST_NAME}:{SERVER_POOL_PORT}"

        result = get_result_from_code_server(url, uid)

        if result['status'] == 'done':
            final = json.loads(result['result'])
            ans.error = json.dumps(final.get('error'))
            if final.get('success'):
                ans.correct = True
                ans.marks = ans.question.points
            ans.save()

            answerpaper = ans.answerpaper_set.get()
            answerpaper.update_marks(state='inprogress')

        return Response(result)


class GetCourse(APIView):
    def get(self, request, pk, format=None):
        course = Course.objects.get(id=pk)
        serializer = CourseSerializer(course)
        return Response(serializer.data)


class QuitQuiz(APIView):
    def get(self, request, answerpaper_id, format=None):
        answerpaper = AnswerPaper.objects.get(id=answerpaper_id)
        answerpaper.status = 'completed'
        answerpaper.save()
        serializer = AnswerPaperSerializer(answerpaper)
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def quiz_submission_status(request, answerpaper_id):
    """Get quiz submission status with all questions"""
    user = request.user
    
    try:
        answerpaper = AnswerPaper.objects.get(id=answerpaper_id, user=user)
    except AnswerPaper.DoesNotExist:
        return Response(
            {'error': 'Answer paper not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get course ID from answerpaper
    course_id = None
    if hasattr(answerpaper, 'course_id'):
        course_id = answerpaper.course_id
    
    # Get all questions and their attempt status
    questions_data = []
    for question in answerpaper.questions.all():
        # Check if question has been answered
        answered = answerpaper.answers.filter(question=question).exists()
        question_title = question.summary if hasattr(question, 'summary') and question.summary else (
            question.description[:50] + '...' if question.description else f'Question {question.id}'
        )
        questions_data.append({
            'id': question.id,
            'title': question_title,
            'attempted': answered,
            'type': question.type
        })
    
    attempted_count = len([q for q in questions_data if q['attempted']])
    not_attempted_count = len(questions_data) - attempted_count
    
    quiz_name = answerpaper.question_paper.quiz.description if answerpaper.question_paper and answerpaper.question_paper.quiz else 'Quiz'
    
    return Response({
        'answerpaper_id': answerpaper.id,
        'quiz_name': quiz_name,
        'course_id': course_id,
        'status': answerpaper.status,
        'questions': questions_data,
        'attempted_count': attempted_count,
        'not_attempted_count': not_attempted_count,
        'total_questions': len(questions_data),
        'percent': getattr(answerpaper, 'percent', 0)
    }, status=status.HTTP_200_OK)


# ============================================================
#  STUDENT DASHBOARD & STATS APIs
# ============================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_dashboard(request):
    """Get student dashboard data with stats, active courses, and recent activities"""
    user = request.user
    
    # Get or create user stats
    user_stats, created = UserStats.objects.get_or_create(user=user)
    if created:
        # Initialize stats for new user
        user_stats.save()
    
    # Reset weekly/monthly stats if needed
    user_stats.reset_weekly_stats()
    user_stats.reset_monthly_stats()
    
    # Serialize stats
    stats_serializer = UserStatsSerializer(user_stats)
    stats_data = stats_serializer.data
    
    # Add courses enrolled count
    enrolled_courses = Course.objects.filter(students=user, active=True).count()
    in_progress_courses = CourseStatus.objects.filter(
        user=user, 
        grade__isnull=True
    ).count()
    
    stats_data['coursesEnrolled'] = enrolled_courses
    stats_data['inProgress'] = in_progress_courses
    
    # Get active courses (enrolled and in progress)
    active_courses = Course.objects.filter(
        students=user, 
        active=True
    ).prefetch_related('learning_module', 'learning_module__learning_unit', 'creator').order_by('-created_on')[:3]
    
    courses_serializer = CourseProgressSerializer(
        active_courses, many=True, context={'user': user}
    )
    
    # Get recent activities
    recent_activities = UserActivity.objects.filter(user=user).order_by('-timestamp')[:10]
    activities_serializer = UserActivitySerializer(recent_activities, many=True)
    
    return Response({
        'stats': stats_data,
        'activeCourses': courses_serializer.data,
        'recentActivities': activities_serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_stats(request):
    """Get detailed student statistics"""
    user = request.user
    
    user_stats, created = UserStats.objects.get_or_create(user=user)
    serializer = UserStatsSerializer(user_stats)
    
    return Response(serializer.data, status=status.HTTP_200_OK)


# ============================================================
#  COURSE CATALOG & ENROLLMENT APIs
# ============================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def course_catalog(request):
    """Get course catalog with optional filtering"""
    user = request.user
    
    # Get query parameters
    level = request.GET.get('level')
    category = request.GET.get('category')
    enrollment_status = request.GET.get('enrollment_status', 'all')
    
    # Base query - active courses only
    courses = Course.objects.filter(active=True, hidden=False).prefetch_related(
        'learning_module', 'learning_module__learning_unit', 'creator', 'students'
    )
    
    # Filter by enrollment status
    if enrollment_status == 'enrolled':
        courses = courses.filter(students=user)
    elif enrollment_status == 'completed':
        completed_course_ids = CourseStatus.objects.filter(
            user=user, grade__isnull=False
        ).values_list('course_id', flat=True)
        courses = courses.filter(id__in=completed_course_ids)
    
    # Order by creation date (newest first)
    courses = courses.order_by('-created_on')
    
    # Serialize
    serializer = CourseCatalogSerializer(
        courses, many=True, context={'user': user}
    )
    
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def enrolled_courses(request):
    """Get list of enrolled courses"""
    user = request.user
    
    courses = Course.objects.filter(students=user, active=True).order_by('-created_on')
    serializer = CourseProgressSerializer(courses, many=True, context={'user': user})
    
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enroll_course(request, course_id):
    """Enroll user in a course"""
    user = request.user
    
    try:
        course = Course.objects.get(id=course_id, active=True)
    except Course.DoesNotExist:
        return Response(
            {'error': 'Course not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if already enrolled
    if course.students.filter(id=user.id).exists():
        return Response(
            {'message': 'Already enrolled in this course'},
            status=status.HTTP_200_OK
        )
    
    # Enroll user
    course.students.add(user)
    
    # Create or get course status
    CourseStatus.objects.get_or_create(user=user, course=course)
    
    # Log activity
    UserActivity.create_activity(
        user=user,
        activity_type='course_enrolled',
        title=f'Enrolled in {course.name}',
        description='Started learning journey',
        icon='check',
        color='green',
        course_id=course.id
    )
    
    return Response(
        {'message': 'Successfully enrolled in course'},
        status=status.HTTP_201_CREATED
    )


# ============================================================
#  COURSE MODULES & LESSONS APIs
# ============================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def course_modules(request, course_id):
    """Get all modules for a course"""
    user = request.user
    
    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response(
            {'error': 'Course not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if user is enrolled
    if not course.students.filter(id=user.id).exists():
        return Response(
            {'error': 'Not enrolled in this course'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    modules = course.learning_module.filter(active=True).order_by('order')
    serializer = LearningModuleDetailSerializer(
        modules, many=True, context={'user': user, 'course_id': course_id}
    )
    
    # Get overall course progress
    try:
        course_status = CourseStatus.objects.get(user=user, course=course)
        total_units = sum(module.learning_unit.count() for module in modules)
        completed_units = course_status.completed_units.count()
        progress = int((completed_units / total_units) * 100) if total_units > 0 else 0
    except CourseStatus.DoesNotExist:
        progress = 0
    
    return Response({
        'course': {
            'id': course.id,
            'name': course.name,
            'code': course.code,
            'progress': progress
        },
        'modules': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def module_detail(request, module_id):
    """Get detailed module information with units"""
    user = request.user
    
    try:
        module = LearningModule.objects.get(id=module_id)
    except LearningModule.DoesNotExist:
        return Response(
            {'error': 'Module not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Find course that contains this module
    course = Course.objects.filter(learning_module=module).first()
    if not course:
        return Response(
            {'error': 'Course not found for this module'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check enrollment
    if not course.students.filter(id=user.id).exists():
        return Response(
            {'error': 'Not enrolled in this course'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = LearningModuleDetailSerializer(
        module, context={'user': user, 'course_id': course.id}
    )
    
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lesson_detail(request, lesson_id):
    """Get detailed lesson information"""
    user = request.user
    
    try:
        lesson = Lesson.objects.get(id=lesson_id)
    except Lesson.DoesNotExist:
        return Response(
            {'error': 'Lesson not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Find course containing this lesson
    learning_unit = LearningUnit.objects.filter(lesson=lesson).first()
    if not learning_unit:
        return Response(
            {'error': 'Learning unit not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    course = Course.objects.filter(
        learning_module__learning_unit=learning_unit
    ).first()
    
    if not course:
        return Response(
            {'error': 'Course not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check enrollment
    if not course.students.filter(id=user.id).exists():
        return Response(
            {'error': 'Not enrolled in this course'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = LessonDetailSerializer(
        lesson, context={'user': user, 'course_id': course.id}
    )
    
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_lesson(request, lesson_id):
    """Mark a lesson as completed"""
    user = request.user
    
    try:
        lesson = Lesson.objects.get(id=lesson_id)
    except Lesson.DoesNotExist:
        return Response(
            {'error': 'Lesson not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Find the learning unit and course
    learning_unit = LearningUnit.objects.filter(lesson=lesson).first()
    if not learning_unit:
        return Response(
            {'error': 'Learning unit not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    course = Course.objects.filter(
        learning_module__learning_unit=learning_unit
    ).first()
    
    if not course:
        return Response(
            {'error': 'Course not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get or create course status
    course_status, created = CourseStatus.objects.get_or_create(
        user=user, course=course
    )
    
    # Mark unit as completed
    if not course_status.completed_units.filter(id=learning_unit.id).exists():
        course_status.completed_units.add(learning_unit)
        
        # Update current unit to next unit
        module = learning_unit.learning_unit.first()
        if module:
            next_unit = module.get_next_unit(learning_unit.id)
            if next_unit:
                course_status.current_unit = next_unit
                course_status.save()
        
        # Log activity
        UserActivity.create_activity(
            user=user,
            activity_type='lesson_completed',
            title='Completed lesson',
            description=lesson.name,
            icon='check',
            color='green',
            course_id=course.id,
            lesson_id=lesson.id
        )
        
        # Update user stats
        user_stats, created = UserStats.objects.get_or_create(user=user)
        user_stats.update_streak()
        user_stats.add_learning_time(0.5)  # Assume 30 minutes per lesson
        
        # Check and update badge progress
        _check_and_award_badges(user)
    
    return Response(
        {'message': 'Lesson marked as completed'},
        status=status.HTTP_200_OK
    )


# ============================================================
#  BADGES & INSIGHTS APIs
# ============================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_badges(request):
    """Get user's earned and in-progress badges"""
    user = request.user
    
    # Get unlocked badges
    unlocked_badges = UserBadge.objects.filter(user=user).select_related('badge')
    unlocked_serializer = UserBadgeSerializer(unlocked_badges, many=True)
    
    # Get in-progress badges
    in_progress_badges = BadgeProgress.objects.filter(
        user=user
    ).exclude(
        badge__in=unlocked_badges.values_list('badge', flat=True)
    ).select_related('badge')
    
    # Update progress for all badges
    for badge_progress in in_progress_badges:
        badge_progress.update_progress()
    
    in_progress_serializer = BadgeProgressSerializer(in_progress_badges, many=True)
    
    return Response({
        'unlocked': unlocked_serializer.data,
        'inProgress': in_progress_serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_achievements(request):
    """Get user achievements and milestones"""
    user = request.user
    
    user_stats, created = UserStats.objects.get_or_create(user=user)
    
    achievements = {
        'total_badges': UserBadge.objects.filter(user=user).count(),
        'total_challenges': user_stats.total_challenges_solved,
        'current_streak': user_stats.current_streak,
        'longest_streak': user_stats.longest_streak,
        'courses_completed': CourseStatus.objects.filter(
            user=user, grade__isnull=False
        ).count(),
        'perfect_scores': AnswerPaper.objects.filter(
            user=user, status='completed', percent=100
        ).count()
    }
    
    return Response(achievements, status=status.HTTP_200_OK)


# ============================================================
#  HELPER FUNCTIONS
# ============================================================

def _check_and_award_badges(user):
    """Check and award badges to user based on criteria"""
    active_badges = Badge.objects.filter(active=True)
    
    for badge in active_badges:
        # Skip if already earned
        if UserBadge.objects.filter(user=user, badge=badge).exists():
            continue
        
        # Check criteria
        if badge.check_criteria(user):
            # Award badge
            UserBadge.objects.create(user=user, badge=badge)
            
            # Log activity
            UserActivity.create_activity(
                user=user,
                activity_type='badge_earned',
                title='Earned badge',
                badge_name=badge.name,
                icon='award',
                color='amber'
            )
        else:
            # Update or create progress
            badge_progress, created = BadgeProgress.objects.get_or_create(
                user=user, badge=badge
            )
            badge_progress.update_progress()


# ============================================================
#  TEACHER APIs - Content Creation
# ============================================================

def _check_teacher_permission(user):
    """Check if user is a moderator/teacher"""
    try:
        return is_moderator(user)
    except:
        return False


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def teacher_dashboard(request):
    """Get teacher dashboard statistics"""
    user = request.user
    
    if not _check_teacher_permission(user):
        return Response(
            {'error': 'You are not authorized to access this page'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get courses created by teacher
    courses = Course.objects.filter(
        Q(creator=user) | Q(teachers=user),
        is_trial=False
    ).distinct()
    
    # Calculate statistics
    total_courses = courses.count()
    active_courses = courses.filter(active=True).count()
    
    # Total students enrolled across all courses
    total_students = User.objects.filter(
        students__in=courses
    ).distinct().count()
    
    # Recent courses (last 5)
    recent_courses = courses.order_by('-created_on')[:5]
    
    # Calculate average completion rate
    completion_rates = []
    for course in courses:
        enrolled_count = course.students.count()
        if enrolled_count > 0:
            completed_count = CourseStatus.objects.filter(
                course=course, grade__isnull=False
            ).count()
            if completed_count > 0:
                completion_rates.append((completed_count / enrolled_count) * 100)
    
    avg_completion = sum(completion_rates) / len(completion_rates) if completion_rates else 0
    
    # Recent events (upcoming quizzes)
    upcoming_quizzes = []
    for course in courses[:10]:  # Check first 10 courses
        for module in course.learning_module.all():
            for unit in module.learning_unit.filter(type='quiz'):
                quiz = unit.quiz
                if quiz and quiz.active:
                    upcoming_quizzes.append({
                        'id': quiz.id,
                        'name': quiz.description,
                        'course_name': course.name,
                        'module_name': module.name
                    })
    
    return Response({
        'total_courses': total_courses,
        'active_courses': active_courses,
        'total_students': total_students,
        'avg_completion': round(avg_completion, 1),
        'recent_courses': [
            {
                'id': course.id,
                'name': course.name,
                'active': course.active,
                'students_count': course.students.count(),
                'modules_count': course.learning_module.count()
            }
            for course in recent_courses
        ],
        'upcoming_quizzes': upcoming_quizzes[:5]
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def teacher_courses_list(request):
    """Get list of courses created/managed by teacher"""
    user = request.user
    
    if not _check_teacher_permission(user):
        return Response(
            {'error': 'You are not authorized to access this page'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get query parameters
    status_filter = request.GET.get('status', 'all')
    search_query = request.GET.get('search', '')
    
    # Base query - courses created or taught by user
    courses = Course.objects.filter(
        Q(creator=user) | Q(teachers=user),
        is_trial=False
    ).distinct()
    
    # Apply search filter
    if search_query:
        courses = courses.filter(name__icontains=search_query)
    
    # Apply status filter
    if status_filter == 'active':
        courses = courses.filter(active=True)
    elif status_filter == 'inactive':
        courses = courses.filter(active=False)
    elif status_filter == 'draft':
        # Draft courses could be those without modules or inactive
        courses = courses.filter(
            Q(active=False) | Q(learning_module__isnull=True)
        ).distinct()
    
    # Order by creation date
    courses = courses.order_by('-created_on')
    
    # Serialize courses with additional stats
    courses_data = []
    for course in courses:
        enrolled_count = course.students.count()
        completed_count = CourseStatus.objects.filter(
            course=course, grade__isnull=False
        ).count()
        completion_rate = (completed_count / enrolled_count * 100) if enrolled_count > 0 else 0
        
        courses_data.append({
            'id': course.id,
            'name': course.name,
            'code': course.code,
            'active': course.active,
            'enrollment': course.enrollment,
            'students_count': enrolled_count,
            'completions': completed_count,
            'completion_rate': round(completion_rate, 1),
            'modules_count': course.learning_module.count(),
            'created_on': course.created_on.isoformat() if course.created_on else None,
            'status': 'Active' if course.active else 'Inactive'
        })
    
    return Response(courses_data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def teacher_create_course(request):
    """Create a new course"""
    user = request.user
    
    if not _check_teacher_permission(user):
        return Response(
            {'error': 'You are not authorized to create courses'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        # Get form data
        name = request.data.get('name')
        enrollment = request.data.get('enrollment', 'default')
        code = request.data.get('code', '')
        instructions = request.data.get('instructions', '')
        start_enroll_time = request.data.get('start_enroll_time')
        end_enroll_time = request.data.get('end_enroll_time')
        grading_system_id = request.data.get('grading_system_id')
        view_grade = request.data.get('view_grade', False)
        active = request.data.get('active', True)
        
        if not name:
            return Response(
                {'error': 'Course name is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create course
        course = Course.objects.create(
            name=name,
            enrollment=enrollment,
            code=code,
            instructions=instructions,
            view_grade=view_grade,
            active=active,
            hidden=False,  # Make courses visible by default for students
            creator=user
        )
        
        # Set enrollment times if provided
        if start_enroll_time:
            try:
                course.start_enroll_time = datetime.fromisoformat(start_enroll_time.replace('Z', '+00:00'))
            except:
                pass
        
        if end_enroll_time:
            try:
                course.end_enroll_time = datetime.fromisoformat(end_enroll_time.replace('Z', '+00:00'))
            except:
                pass
        
        # Set grading system if provided
        if grading_system_id:
            try:
                from grades.models import GradingSystem
                grading_system = GradingSystem.objects.get(id=grading_system_id, creator=user)
                course.grading_system = grading_system
            except:
                pass
        
        # Set hidden based on code
        if code:
            course.hidden = True
        else:
            course.hidden = False
        
        course.save()
        
        return Response({
            'id': course.id,
            'name': course.name,
            'code': course.code,
            'active': course.active,
            'message': 'Course created successfully'
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': 'Failed to create course', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def teacher_get_course(request, course_id):
    """Get course details for teacher"""
    user = request.user
    
    if not _check_teacher_permission(user):
        return Response(
            {'error': 'You are not authorized'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        course = Course.objects.get(id=course_id)
        
        # Verify ownership
        if not course.is_creator(user) and not course.is_teacher(user):
            return Response(
                {'error': 'You do not have permission to access this course'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get modules
        modules = course.learning_module.order_by('order')
        modules_data = []
        for module in modules:
            units = module.learning_unit.order_by('order')
            modules_data.append({
                'id': module.id,
                'name': module.name,
                'description': module.description,
                'order': module.order,
                'active': module.active,
                'units_count': units.count(),
                'units': [
                    {
                        'id': unit.id,
                        'type': unit.type,
                        'order': unit.order,
                        'lesson_id': unit.lesson.id if unit.lesson else None,
                        'quiz_id': unit.quiz.id if unit.quiz else None,
                        'name': unit.lesson.name if unit.lesson else (unit.quiz.description if unit.quiz else '')
                    }
                    for unit in units
                ]
            })
        
        enrolled_count = course.students.count()
        completed_count = CourseStatus.objects.filter(
            course=course, grade__isnull=False
        ).count()
        
        return Response({
            'id': course.id,
            'name': course.name,
            'code': course.code,
            'enrollment': course.enrollment,
            'instructions': course.instructions,
            'active': course.active,
            'view_grade': course.view_grade,
            'start_enroll_time': course.start_enroll_time.isoformat() if course.start_enroll_time else None,
            'end_enroll_time': course.end_enroll_time.isoformat() if course.end_enroll_time else None,
            'grading_system_id': course.grading_system.id if course.grading_system else None,
            'modules': modules_data,
            'students_count': enrolled_count,
            'completions': completed_count,
            'created_on': course.created_on.isoformat() if course.created_on else None
        }, status=status.HTTP_200_OK)
        
    except Course.DoesNotExist:
        return Response(
            {'error': 'Course not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def teacher_update_course(request, course_id):
    """Update an existing course"""
    user = request.user
    
    if not _check_teacher_permission(user):
        return Response(
            {'error': 'You are not authorized'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        course = Course.objects.get(id=course_id)
        
        # Verify ownership
        if not course.is_creator(user) and not course.is_teacher(user):
            return Response(
                {'error': 'You do not have permission to update this course'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Update fields
        if 'name' in request.data:
            course.name = request.data['name']
        if 'enrollment' in request.data:
            course.enrollment = request.data['enrollment']
        if 'code' in request.data:
            course.code = request.data['code']
            course.hidden = bool(request.data['code'])
        if 'instructions' in request.data:
            course.instructions = request.data['instructions']
        if 'view_grade' in request.data:
            course.view_grade = request.data['view_grade']
        if 'active' in request.data:
            course.active = request.data['active']
        
        # Update enrollment times
        if 'start_enroll_time' in request.data:
            try:
                start_time = request.data['start_enroll_time']
                course.start_enroll_time = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
            except:
                pass
        
        if 'end_enroll_time' in request.data:
            try:
                end_time = request.data['end_enroll_time']
                course.end_enroll_time = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
            except:
                pass
        
        # Update grading system
        if 'grading_system_id' in request.data:
            grading_system_id = request.data['grading_system_id']
            if grading_system_id:
                try:
                    from grades.models import GradingSystem
                    grading_system = GradingSystem.objects.get(id=grading_system_id, creator=user)
                    course.grading_system = grading_system
                except:
                    pass
            else:
                course.grading_system = None
        
        course.save()
        
        return Response({
            'id': course.id,
            'name': course.name,
            'message': 'Course updated successfully'
        }, status=status.HTTP_200_OK)
        
    except Course.DoesNotExist:
        return Response(
            {'error': 'Course not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': 'Failed to update course', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ============================================================
#  MODULE MANAGEMENT APIs
# ============================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def teacher_get_course_modules(request, course_id):
    """Get all modules for a course"""
    user = request.user
    
    if not _check_teacher_permission(user):
        return Response(
            {'error': 'You are not authorized'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        course = Course.objects.get(id=course_id)
        
        # Verify ownership
        if course.creator != user and user not in course.teachers.all():
            return Response(
                {'error': 'You do not have permission to access this course'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get modules ordered by order
        modules = course.learning_module.order_by('order')
        modules_data = []
        
        for module in modules:
            units = module.learning_unit.order_by('order')
            units_data = []
            for unit in units:
                unit_data = {
                    'id': unit.id,
                    'type': unit.type,
                    'order': unit.order,
                }
                if unit.type == 'lesson' and unit.lesson:
                    unit_data['lesson_id'] = unit.lesson.id
                    unit_data['name'] = unit.lesson.name
                elif unit.type == 'quiz' and unit.quiz:
                    unit_data['quiz_id'] = unit.quiz.id
                    unit_data['name'] = unit.quiz.description
                units_data.append(unit_data)
            
            modules_data.append({
                'id': module.id,
                'name': module.name,
                'description': module.description,
                'order': module.order,
                'active': module.active,
                'check_prerequisite': module.check_prerequisite,
                'units_count': units.count(),
                'units': units_data
            })
        
        return Response(modules_data, status=status.HTTP_200_OK)
        
    except Course.DoesNotExist:
        return Response(
            {'error': 'Course not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def teacher_create_module(request, course_id):
    """Create a new module for a course"""
    user = request.user
    
    if not _check_teacher_permission(user):
        return Response(
            {'error': 'You are not authorized'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        course = Course.objects.get(id=course_id)
        
        # Verify ownership
        if not course.is_creator(user) and not course.is_teacher(user):
            return Response(
                {'error': 'You do not have permission to modify this course'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get form data
        name = request.data.get('name')
        description = request.data.get('description', '')
        order = request.data.get('order')
        check_prerequisite = request.data.get('check_prerequisite', False)
        active = request.data.get('active', True)
        
        if not name:
            return Response(
                {'error': 'Module name is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Auto-calculate order if not provided
        if order is None:
            last_module = course.learning_module.order_by('-order').first()
            order = (last_module.order + 1) if last_module else 1
        
        # Convert markdown to HTML
        html_data = get_html_text(description) if description else ''
        
        # Create module
        module = LearningModule.objects.create(
            name=name,
            description=description,
            html_data=html_data,
            order=order,
            check_prerequisite=check_prerequisite,
            active=active,
            creator=user
        )
        
        # Add module to course
        course.learning_module.add(module)
        
        return Response({
            'id': module.id,
            'name': module.name,
            'description': module.description,
            'order': module.order,
            'active': module.active,
            'message': 'Module created successfully'
        }, status=status.HTTP_201_CREATED)
        
    except Course.DoesNotExist:
        return Response(
            {'error': 'Course not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': 'Failed to create module', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def teacher_update_module(request, course_id, module_id):
    """Update an existing module"""
    user = request.user
    
    if not _check_teacher_permission(user):
        return Response(
            {'error': 'You are not authorized'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        course = Course.objects.get(id=course_id)
        module = LearningModule.objects.get(id=module_id)
        
        # Verify ownership
        if not course.is_creator(user) and not course.is_teacher(user):
            return Response(
                {'error': 'You do not have permission to modify this course'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if module.creator != user and not course.is_creator(user) and not course.is_teacher(user):
            return Response(
                {'error': 'You do not have permission to modify this module'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verify module belongs to course
        if module not in course.learning_module.all():
            return Response(
                {'error': 'Module does not belong to this course'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update fields
        if 'name' in request.data:
            module.name = request.data['name']
        if 'description' in request.data:
            module.description = request.data['description']
            module.html_data = get_html_text(request.data['description']) if request.data['description'] else ''
        if 'order' in request.data:
            module.order = request.data['order']
        if 'check_prerequisite' in request.data:
            module.check_prerequisite = request.data['check_prerequisite']
        if 'active' in request.data:
            module.active = request.data['active']
        
        module.save()
        
        return Response({
            'id': module.id,
            'name': module.name,
            'description': module.description,
            'order': module.order,
            'active': module.active,
            'message': 'Module updated successfully'
        }, status=status.HTTP_200_OK)
        
    except Course.DoesNotExist:
        return Response(
            {'error': 'Course not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except LearningModule.DoesNotExist:
        return Response(
            {'error': 'Module not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': 'Failed to update module', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def teacher_delete_module(request, course_id, module_id):
    """Delete a module from a course"""
    user = request.user
    
    if not _check_teacher_permission(user):
        return Response(
            {'error': 'You are not authorized'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        course = Course.objects.get(id=course_id)
        module = LearningModule.objects.get(id=module_id)
        
        # Verify ownership
        if not course.is_creator(user) and not course.is_teacher(user):
            return Response(
                {'error': 'You do not have permission to modify this course'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if module.creator != user and not course.is_creator(user) and not course.is_teacher(user):
            return Response(
                {'error': 'You do not have permission to delete this module'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verify module belongs to course
        if module not in course.learning_module.all():
            return Response(
                {'error': 'Module does not belong to this course'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Remove module from course
        course.learning_module.remove(module)
        
        # Delete module (cascade will delete learning units)
        module.delete()
        
        return Response({
            'message': 'Module deleted successfully'
        }, status=status.HTTP_200_OK)
        
    except Course.DoesNotExist:
        return Response(
            {'error': 'Course not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except LearningModule.DoesNotExist:
        return Response(
            {'error': 'Module not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': 'Failed to delete module', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ============================================================
#  LESSON MANAGEMENT APIs
# ============================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def teacher_create_lesson(request, module_id):
    """Create a new lesson in a module"""
    user = request.user
    
    if not _check_teacher_permission(user):
        return Response(
            {'error': 'You are not authorized'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        module = LearningModule.objects.get(id=module_id)
        
        # Verify ownership
        if module.creator != user:
            return Response(
                {'error': 'You do not have permission to modify this module'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get form data
        name = request.data.get('name')
        description = request.data.get('description', '')
        video_path = request.data.get('video_path', '')
        active = request.data.get('active', True)
        order = request.data.get('order')
        
        if not name:
            return Response(
                {'error': 'Lesson name is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Auto-calculate order if not provided
        if order is None:
            last_unit = module.get_learning_units().last()
            order = (last_unit.order + 1) if last_unit else 1
        
        # Convert markdown to HTML
        html_data = get_html_text(description) if description else ''
        
        # Create lesson
        lesson = Lesson.objects.create(
            name=name,
            description=description,
            html_data=html_data,
            video_path=video_path,
            active=active,
            creator=user
        )
        
        # Create learning unit and add to module
        unit = LearningUnit.objects.create(
            type='lesson',
            lesson=lesson,
            order=order
        )
        module.learning_unit.add(unit)
        
        return Response({
            'id': lesson.id,
            'name': lesson.name,
            'description': lesson.description,
            'video_path': lesson.video_path,
            'active': lesson.active,
            'unit_id': unit.id,
            'order': order,
            'message': 'Lesson created successfully'
        }, status=status.HTTP_201_CREATED)
        
    except LearningModule.DoesNotExist:
        return Response(
            {'error': 'Module not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': 'Failed to create lesson', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def teacher_update_lesson(request, module_id, lesson_id):
    """Update an existing lesson"""
    user = request.user
    
    if not _check_teacher_permission(user):
        return Response(
            {'error': 'You are not authorized'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        module = LearningModule.objects.get(id=module_id)
        lesson = Lesson.objects.get(id=lesson_id)
        
        # Verify ownership
        if module.creator != user or lesson.creator != user:
            return Response(
                {'error': 'You do not have permission to modify this lesson'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verify lesson belongs to module
        unit = module.learning_unit.filter(type='lesson', lesson=lesson).first()
        if not unit:
            return Response(
                {'error': 'Lesson does not belong to this module'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update fields
        if 'name' in request.data:
            lesson.name = request.data['name']
        if 'description' in request.data:
            lesson.description = request.data['description']
            lesson.html_data = get_html_text(request.data['description']) if request.data['description'] else ''
        if 'video_path' in request.data:
            lesson.video_path = request.data['video_path']
        if 'active' in request.data:
            lesson.active = request.data['active']
        if 'order' in request.data:
            unit.order = request.data['order']
            unit.save()
        
        lesson.save()
        
        return Response({
            'id': lesson.id,
            'name': lesson.name,
            'description': lesson.description,
            'video_path': lesson.video_path,
            'active': lesson.active,
            'order': unit.order,
            'message': 'Lesson updated successfully'
        }, status=status.HTTP_200_OK)
        
    except LearningModule.DoesNotExist:
        return Response(
            {'error': 'Module not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Lesson.DoesNotExist:
        return Response(
            {'error': 'Lesson not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': 'Failed to update lesson', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def teacher_delete_lesson(request, module_id, lesson_id):
    """Delete a lesson from a module"""
    user = request.user
    
    if not _check_teacher_permission(user):
        return Response(
            {'error': 'You are not authorized'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        module = LearningModule.objects.get(id=module_id)
        lesson = Lesson.objects.get(id=lesson_id)
        
        # Verify ownership
        if module.creator != user or lesson.creator != user:
            return Response(
                {'error': 'You do not have permission to delete this lesson'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Find and remove learning unit
        unit = module.learning_unit.filter(type='lesson', lesson=lesson).first()
        if unit:
            module.learning_unit.remove(unit)
            unit.delete()
        
        # Delete lesson (cascade will delete files)
        lesson.delete()
        
        return Response({
            'message': 'Lesson deleted successfully'
        }, status=status.HTTP_200_OK)
        
    except LearningModule.DoesNotExist:
        return Response(
            {'error': 'Module not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Lesson.DoesNotExist:
        return Response(
            {'error': 'Lesson not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': 'Failed to delete lesson', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def teacher_get_lesson(request, module_id, lesson_id):
    """Get lesson details for editing"""
    user = request.user
    
    if not _check_teacher_permission(user):
        return Response(
            {'error': 'You are not authorized'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        module = LearningModule.objects.get(id=module_id)
        lesson = Lesson.objects.get(id=lesson_id)
        
        # Verify ownership
        if module.creator != user or lesson.creator != user:
            return Response(
                {'error': 'You do not have permission to access this lesson'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verify lesson belongs to module
        unit = module.learning_unit.filter(type='lesson', lesson=lesson).first()
        if not unit:
            return Response(
                {'error': 'Lesson does not belong to this module'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({
            'id': lesson.id,
            'name': lesson.name,
            'description': lesson.description or '',
            'video_path': lesson.video_path or '',
            'active': lesson.active,
            'order': unit.order
        }, status=status.HTTP_200_OK)
        
    except LearningModule.DoesNotExist:
        return Response(
            {'error': 'Module not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Lesson.DoesNotExist:
        return Response(
            {'error': 'Lesson not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': 'Failed to get lesson', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def teacher_upload_lesson_files(request, lesson_id):
    """Upload files for a lesson"""
    user = request.user
    
    if not _check_teacher_permission(user):
        return Response(
            {'error': 'You are not authorized'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        lesson = Lesson.objects.get(id=lesson_id)
        
        # Verify ownership
        if lesson.creator != user:
            return Response(
                {'error': 'You do not have permission to upload files for this lesson'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Handle file uploads
        files = request.FILES.getlist('files')
        uploaded_files = []
        
        for file in files:
            lesson_file = LessonFile.objects.create(
                lesson_id=lesson.id,
                file=file
            )
            uploaded_files.append({
                'id': lesson_file.id,
                'name': lesson_file.file.name,
                'url': lesson_file.file.url if hasattr(lesson_file.file, 'url') else ''
            })
        
        return Response({
            'files': uploaded_files,
            'message': f'{len(uploaded_files)} file(s) uploaded successfully'
        }, status=status.HTTP_201_CREATED)
        
    except Lesson.DoesNotExist:
        return Response(
            {'error': 'Lesson not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': 'Failed to upload files', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ============================================================
#  QUIZ MANAGEMENT APIs
# ============================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def teacher_create_quiz(request, module_id):
    """Create a new quiz in a module"""
    user = request.user
    
    if not _check_teacher_permission(user):
        return Response(
            {'error': 'You are not authorized'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        module = LearningModule.objects.get(id=module_id)
        
        # Verify ownership
        if module.creator != user:
            return Response(
                {'error': 'You do not have permission to modify this module'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get form data
        description = request.data.get('description')
        instructions = request.data.get('instructions', '')
        duration = request.data.get('duration', 20)  # in minutes
        attempts_allowed = request.data.get('attempts_allowed', 1)
        time_between_attempts = request.data.get('time_between_attempts', 0.0)  # in hours
        pass_criteria = request.data.get('pass_criteria', 40.0)  # percentage
        weightage = request.data.get('weightage', 100.0)
        allow_skip = request.data.get('allow_skip', True)
        is_exercise = request.data.get('is_exercise', False)
        active = request.data.get('active', True)
        order = request.data.get('order')
        
        if not description:
            return Response(
                {'error': 'Quiz description/name is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Auto-calculate order if not provided
        if order is None:
            last_unit = module.get_learning_units().last()
            order = (last_unit.order + 1) if last_unit else 1
        
        # Create quiz
        quiz = Quiz.objects.create(
            description=description,
            instructions=instructions,
            duration=duration,
            attempts_allowed=attempts_allowed,
            time_between_attempts=time_between_attempts,
            pass_criteria=pass_criteria,
            weightage=weightage,
            allow_skip=allow_skip,
            is_exercise=is_exercise,
            active=active,
            creator=user
        )
        
        # Create learning unit and add to module
        unit = LearningUnit.objects.create(
            type='quiz',
            quiz=quiz,
            order=order
        )
        module.learning_unit.add(unit)
        
        return Response({
            'id': quiz.id,
            'description': quiz.description,
            'instructions': quiz.instructions,
            'duration': quiz.duration,
            'attempts_allowed': quiz.attempts_allowed,
            'pass_criteria': quiz.pass_criteria,
            'active': quiz.active,
            'unit_id': unit.id,
            'order': order,
            'message': 'Quiz created successfully'
        }, status=status.HTTP_201_CREATED)
        
    except LearningModule.DoesNotExist:
        return Response(
            {'error': 'Module not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': 'Failed to create quiz', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def teacher_update_quiz(request, module_id, quiz_id):
    """Update an existing quiz"""
    user = request.user
    
    if not _check_teacher_permission(user):
        return Response(
            {'error': 'You are not authorized'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        module = LearningModule.objects.get(id=module_id)
        quiz = Quiz.objects.get(id=quiz_id)
        
        # Verify ownership
        if module.creator != user or quiz.creator != user:
            return Response(
                {'error': 'You do not have permission to modify this quiz'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verify quiz belongs to module
        unit = module.learning_unit.filter(type='quiz', quiz=quiz).first()
        if not unit:
            return Response(
                {'error': 'Quiz does not belong to this module'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update fields
        if 'description' in request.data:
            quiz.description = request.data['description']
        if 'instructions' in request.data:
            quiz.instructions = request.data['instructions']
        if 'duration' in request.data:
            quiz.duration = request.data['duration']
        if 'attempts_allowed' in request.data:
            quiz.attempts_allowed = request.data['attempts_allowed']
        if 'time_between_attempts' in request.data:
            quiz.time_between_attempts = request.data['time_between_attempts']
        if 'pass_criteria' in request.data:
            quiz.pass_criteria = request.data['pass_criteria']
        if 'weightage' in request.data:
            quiz.weightage = request.data['weightage']
        if 'allow_skip' in request.data:
            quiz.allow_skip = request.data['allow_skip']
        if 'is_exercise' in request.data:
            quiz.is_exercise = request.data['is_exercise']
        if 'active' in request.data:
            quiz.active = request.data['active']
        if 'order' in request.data:
            unit.order = request.data['order']
            unit.save()
        
        quiz.save()
        
        return Response({
            'id': quiz.id,
            'description': quiz.description,
            'instructions': quiz.instructions,
            'duration': quiz.duration,
            'attempts_allowed': quiz.attempts_allowed,
            'pass_criteria': quiz.pass_criteria,
            'active': quiz.active,
            'order': unit.order,
            'message': 'Quiz updated successfully'
        }, status=status.HTTP_200_OK)
        
    except LearningModule.DoesNotExist:
        return Response(
            {'error': 'Module not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Quiz.DoesNotExist:
        return Response(
            {'error': 'Quiz not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': 'Failed to update quiz', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def teacher_delete_quiz(request, module_id, quiz_id):
    """Delete a quiz from a module"""
    user = request.user
    
    if not _check_teacher_permission(user):
        return Response(
            {'error': 'You are not authorized'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        module = LearningModule.objects.get(id=module_id)
        quiz = Quiz.objects.get(id=quiz_id)
        
        # Verify ownership
        if module.creator != user or quiz.creator != user:
            return Response(
                {'error': 'You do not have permission to delete this quiz'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Find and remove learning unit
        unit = module.learning_unit.filter(type='quiz', quiz=quiz).first()
        if unit:
            module.learning_unit.remove(unit)
            unit.delete()
        
        # Delete quiz (cascade will delete question papers, etc.)
        quiz.delete()
        
        return Response({
            'message': 'Quiz deleted successfully'
        }, status=status.HTTP_200_OK)
        
    except LearningModule.DoesNotExist:
        return Response(
            {'error': 'Module not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Quiz.DoesNotExist:
        return Response(
            {'error': 'Quiz not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': 'Failed to delete quiz', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def teacher_get_quiz(request, module_id, quiz_id):
    """Get quiz details for editing"""
    user = request.user
    
    if not _check_teacher_permission(user):
        return Response(
            {'error': 'You are not authorized'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        module = LearningModule.objects.get(id=module_id)
        quiz = Quiz.objects.get(id=quiz_id)
        
        # Verify ownership
        if module.creator != user or quiz.creator != user:
            return Response(
                {'error': 'You do not have permission to access this quiz'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verify quiz belongs to module
        unit = module.learning_unit.filter(type='quiz', quiz=quiz).first()
        if not unit:
            return Response(
                {'error': 'Quiz does not belong to this module'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({
            'id': quiz.id,
            'description': quiz.description,
            'instructions': quiz.instructions or '',
            'duration': quiz.duration,
            'attempts_allowed': quiz.attempts_allowed,
            'time_between_attempts': quiz.time_between_attempts,
            'pass_criteria': quiz.pass_criteria,
            'weightage': quiz.weightage,
            'allow_skip': quiz.allow_skip,
            'is_exercise': quiz.is_exercise,
            'active': quiz.active,
            'order': unit.order
        }, status=status.HTTP_200_OK)
        
    except LearningModule.DoesNotExist:
        return Response(
            {'error': 'Module not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Quiz.DoesNotExist:
        return Response(
            {'error': 'Quiz not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': 'Failed to get quiz', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ============================================================
#  QUESTION MANAGEMENT APIs
# ============================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def teacher_questions_list(request):
    """Get list of questions created by teacher"""
    user = request.user
    
    if not _check_teacher_permission(user):
        return Response(
            {'error': 'You are not authorized'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get query parameters
    question_type = request.GET.get('type', '')
    language = request.GET.get('language', '')
    search = request.GET.get('search', '')
    active = request.GET.get('active', None)
    
    # Base query - questions created by user
    questions = Question.objects.filter(user=user, is_trial=False)
    
    # Apply filters
    if question_type:
        questions = questions.filter(type=question_type)
    if language:
        questions = questions.filter(language=language)
    if search:
        questions = questions.filter(
            Q(summary__icontains=search) | Q(description__icontains=search)
        )
    if active is not None:
        questions = questions.filter(active=active.lower() == 'true')
    
    # Order by creation
    questions = questions.order_by('-id')
    
    # Serialize questions
    questions_data = []
    for question in questions:
        test_cases = question.get_test_cases_as_dict()
        questions_data.append({
            'id': question.id,
            'summary': question.summary,
            'description': question.description,
            'type': question.type,
            'language': question.language,
            'points': question.points,
            'active': question.active,
            'topic': question.topic,
            'test_cases_count': len(test_cases),
            'created': question.id  # Using ID as proxy for creation order
        })
    
    return Response(questions_data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def teacher_get_question(request, question_id):
    """Get question details with test cases"""
    user = request.user
    
    if not _check_teacher_permission(user):
        return Response(
            {'error': 'You are not authorized'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        question = Question.objects.get(id=question_id)
        
        # Verify ownership
        if question.user != user:
            return Response(
                {'error': 'You do not have permission to access this question'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get test cases
        test_cases = question.get_test_cases_as_dict()
        
        return Response({
            'id': question.id,
            'summary': question.summary,
            'description': question.description,
            'type': question.type,
            'language': question.language,
            'points': question.points,
            'active': question.active,
            'topic': question.topic,
            'snippet': question.snippet,
            'solution': question.solution,
            'partial_grading': question.partial_grading,
            'min_time': question.min_time,
            'test_cases': test_cases
        }, status=status.HTTP_200_OK)
        
    except Question.DoesNotExist:
        return Response(
            {'error': 'Question not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def teacher_create_question(request):
    """Create a new question with test cases"""
    user = request.user
    
    if not _check_teacher_permission(user):
        return Response(
            {'error': 'You are not authorized'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        # Get question data
        summary = request.data.get('summary')
        description = request.data.get('description', '')
        question_type = request.data.get('type')
        language = request.data.get('language', 'python')
        points = request.data.get('points', 1.0)
        active = request.data.get('active', True)
        topic = request.data.get('topic', '')
        snippet = request.data.get('snippet', '')
        solution = request.data.get('solution', '')
        partial_grading = request.data.get('partial_grading', False)
        min_time = request.data.get('min_time', 0)
        test_cases_data = request.data.get('test_cases', [])
        
        if not summary or not question_type:
            return Response(
                {'error': 'Question summary and type are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create question
        question = Question.objects.create(
            summary=summary,
            description=description,
            type=question_type,
            language=language,
            points=points,
            active=active,
            topic=topic,
            snippet=snippet,
            solution=solution,
            partial_grading=partial_grading,
            min_time=min_time,
            user=user
        )
        
        # Create test cases based on question type
        for tc_data in test_cases_data:
            tc_type = tc_data.get('type') or tc_data.get('test_case_type')
            if not tc_type:
                continue
            
            try:
                model_class = get_model_class(tc_type)
                
                # Handle different test case types
                if tc_type == 'mcqtestcase':
                    options = tc_data.get('options', '')
                    if isinstance(options, list):
                        options = json.dumps(options)
                    model_class.objects.create(
                        question=question,
                        options=options,
                        correct=tc_data.get('correct', False),
                        type=tc_type
                    )
                elif tc_type == 'mcc' or tc_type == 'mcqtestcase':
                    # For MCC, we need multiple McqTestCase entries
                    options = tc_data.get('options', [])
                    if isinstance(options, str):
                        options = json.loads(options)
                    correct_indices = tc_data.get('correct', [])
                    for idx, option in enumerate(options):
                        model_class.objects.create(
                            question=question,
                            options=json.dumps([option]),
                            correct=(idx in correct_indices) if isinstance(correct_indices, list) else (idx == correct_indices),
                            type=tc_type
                        )
                elif tc_type == 'stdiobasedtestcase':
                    model_class.objects.create(
                        question=question,
                        expected_input=tc_data.get('expected_input', ''),
                        expected_output=tc_data.get('expected_output', ''),
                        weight=tc_data.get('weight', 1.0),
                        hidden=tc_data.get('hidden', False),
                        type=tc_type
                    )
                elif tc_type == 'standardtestcase':
                    model_class.objects.create(
                        question=question,
                        test_case=tc_data.get('test_case', ''),
                        weight=tc_data.get('weight', 1.0),
                        hidden=tc_data.get('hidden', False),
                        test_case_args=tc_data.get('test_case_args', ''),
                        type=tc_type
                    )
                elif tc_type == 'hooktestcase':
                    model_class.objects.create(
                        question=question,
                        hook_code=tc_data.get('hook_code', ''),
                        weight=tc_data.get('weight', 1.0),
                        hidden=tc_data.get('hidden', False),
                        type=tc_type
                    )
                elif tc_type == 'integertestcase':
                    model_class.objects.create(
                        question=question,
                        correct=tc_data.get('correct'),
                        type=tc_type
                    )
                elif tc_type == 'stringtestcase':
                    model_class.objects.create(
                        question=question,
                        correct=tc_data.get('correct', ''),
                        string_check=tc_data.get('string_check', 'lower'),
                        type=tc_type
                    )
                elif tc_type == 'floattestcase':
                    model_class.objects.create(
                        question=question,
                        correct=tc_data.get('correct'),
                        error_margin=tc_data.get('error_margin', 0.0),
                        type=tc_type
                    )
                elif tc_type == 'arrangetestcase':
                    options = tc_data.get('options', '')
                    if isinstance(options, list):
                        options = json.dumps(options)
                    model_class.objects.create(
                        question=question,
                        options=options,
                        type=tc_type
                    )
            except Exception as e:
                # Log error but continue with other test cases
                print(f"Error creating test case: {e}")
                continue
        
        return Response({
            'id': question.id,
            'summary': question.summary,
            'type': question.type,
            'message': 'Question created successfully'
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': 'Failed to create question', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def teacher_update_question(request, question_id):
    """Update an existing question"""
    user = request.user
    
    if not _check_teacher_permission(user):
        return Response(
            {'error': 'You are not authorized'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        question = Question.objects.get(id=question_id)
        
        # Verify ownership
        if question.user != user:
            return Response(
                {'error': 'You do not have permission to update this question'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Update question fields
        if 'summary' in request.data:
            question.summary = request.data['summary']
        if 'description' in request.data:
            question.description = request.data['description']
        if 'type' in request.data:
            question.type = request.data['type']
        if 'language' in request.data:
            question.language = request.data['language']
        if 'points' in request.data:
            question.points = request.data['points']
        if 'active' in request.data:
            question.active = request.data['active']
        if 'topic' in request.data:
            question.topic = request.data['topic']
        if 'snippet' in request.data:
            question.snippet = request.data['snippet']
        if 'solution' in request.data:
            question.solution = request.data['solution']
        if 'partial_grading' in request.data:
            question.partial_grading = request.data['partial_grading']
        if 'min_time' in request.data:
            question.min_time = request.data['min_time']
        
        question.save()
        
        # Update test cases if provided
        if 'test_cases' in request.data:
            # Delete existing test cases
            question.testcase_set.all().delete()
            
            # Create new test cases (same logic as create)
            test_cases_data = request.data['test_cases']
            for tc_data in test_cases_data:
                tc_type = tc_data.get('type') or tc_data.get('test_case_type')
                if not tc_type:
                    continue
                
                try:
                    model_class = get_model_class(tc_type)
                    
                    if tc_type == 'mcqtestcase':
                        options = tc_data.get('options', '')
                        if isinstance(options, list):
                            options = json.dumps(options)
                        model_class.objects.create(
                            question=question,
                            options=options,
                            correct=tc_data.get('correct', False),
                            type=tc_type
                        )
                    elif tc_type == 'stdiobasedtestcase':
                        model_class.objects.create(
                            question=question,
                            expected_input=tc_data.get('expected_input', ''),
                            expected_output=tc_data.get('expected_output', ''),
                            weight=tc_data.get('weight', 1.0),
                            hidden=tc_data.get('hidden', False),
                            type=tc_type
                        )
                    elif tc_type == 'standardtestcase':
                        model_class.objects.create(
                            question=question,
                            test_case=tc_data.get('test_case', ''),
                            weight=tc_data.get('weight', 1.0),
                            hidden=tc_data.get('hidden', False),
                            test_case_args=tc_data.get('test_case_args', ''),
                            type=tc_type
                        )
                    elif tc_type == 'integertestcase':
                        model_class.objects.create(
                            question=question,
                            correct=tc_data.get('correct'),
                            type=tc_type
                        )
                    elif tc_type == 'stringtestcase':
                        model_class.objects.create(
                            question=question,
                            correct=tc_data.get('correct', ''),
                            string_check=tc_data.get('string_check', 'lower'),
                            type=tc_type
                        )
                    elif tc_type == 'floattestcase':
                        model_class.objects.create(
                            question=question,
                            correct=tc_data.get('correct'),
                            error_margin=tc_data.get('error_margin', 0.0),
                            type=tc_type
                        )
                    elif tc_type == 'arrangetestcase':
                        options = tc_data.get('options', '')
                        if isinstance(options, list):
                            options = json.dumps(options)
                        model_class.objects.create(
                            question=question,
                            options=options,
                            type=tc_type
                        )
                except Exception as e:
                    print(f"Error updating test case: {e}")
                    continue
        
        return Response({
            'id': question.id,
            'summary': question.summary,
            'message': 'Question updated successfully'
        }, status=status.HTTP_200_OK)
        
    except Question.DoesNotExist:
        return Response(
            {'error': 'Question not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': 'Failed to update question', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def teacher_delete_question(request, question_id):
    """Delete a question"""
    user = request.user
    
    if not _check_teacher_permission(user):
        return Response(
            {'error': 'You are not authorized'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        question = Question.objects.get(id=question_id)
        
        # Verify ownership
        if question.user != user:
            return Response(
                {'error': 'You do not have permission to delete this question'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Delete question (cascade will delete test cases)
        question.delete()
        
        return Response({
            'message': 'Question deleted successfully'
        }, status=status.HTTP_200_OK)
        
    except Question.DoesNotExist:
        return Response(
            {'error': 'Question not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': 'Failed to delete question', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ============================================================
#  QUESTION-TO-QUIZ MANAGEMENT APIs
# ============================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def teacher_get_quiz_questions(request, quiz_id):
    """Get all questions in a quiz"""
    user = request.user
    
    if not _check_teacher_permission(user):
        return Response(
            {'error': 'You are not authorized'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        quiz = Quiz.objects.get(id=quiz_id)
        
        # Verify ownership
        if quiz.creator != user:
            return Response(
                {'error': 'You do not have permission to access this quiz'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get or create question paper
        question_paper, created = QuestionPaper.objects.get_or_create(quiz=quiz)
        
        # Get fixed questions in order
        fixed_questions = []
        all_fixed_questions = list(question_paper.fixed_questions.all())
        
        if question_paper.fixed_question_order:
            # Use order if available
            question_ids = [qid.strip() for qid in question_paper.fixed_question_order.split(',') if qid.strip()]
            question_map = {str(q.id): q for q in all_fixed_questions}
            
            # Add questions in order
            for qid in question_ids:
                if qid in question_map:
                    q = question_map[qid]
                    fixed_questions.append({
                        'id': q.id,
                        'summary': q.summary,
                        'type': q.type,
                        'points': q.points,
                        'order': len(fixed_questions) + 1
                    })
            
            # Add any questions not in the order string (shouldn't happen, but safety check)
            ordered_ids = set(question_ids)
            for q in all_fixed_questions:
                if str(q.id) not in ordered_ids:
                    fixed_questions.append({
                        'id': q.id,
                        'summary': q.summary,
                        'type': q.type,
                        'points': q.points,
                        'order': len(fixed_questions) + 1
                    })
        else:
            # No order specified, use all questions in their current order
            for q in all_fixed_questions:
                fixed_questions.append({
                    'id': q.id,
                    'summary': q.summary,
                    'type': q.type,
                    'points': q.points,
                    'order': len(fixed_questions) + 1
                })
        
        # Get random question sets
        random_sets = []
        for qset in question_paper.random_questions.all():
            random_sets.append({
                'id': qset.id,
                'marks': qset.marks,
                'num_questions': qset.num_questions,
                'questions_count': qset.questions.count()
            })
        
        return Response({
            'quiz_id': quiz.id,
            'question_paper_id': question_paper.id,
            'fixed_questions': fixed_questions,
            'random_questions': random_sets,
            'total_marks': question_paper.total_marks,
            'shuffle_questions': question_paper.shuffle_questions
        }, status=status.HTTP_200_OK)
        
    except Quiz.DoesNotExist:
        return Response(
            {'error': 'Quiz not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def teacher_add_question_to_quiz(request, quiz_id):
    """Add a question to quiz's question paper"""
    user = request.user
    
    if not _check_teacher_permission(user):
        return Response(
            {'error': 'You are not authorized'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        quiz = Quiz.objects.get(id=quiz_id)
        question_id = request.data.get('question_id')
        fixed = request.data.get('fixed', True)
        
        if not question_id:
            return Response(
                {'error': 'question_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify ownership
        if quiz.creator != user:
            return Response(
                {'error': 'You do not have permission to modify this quiz'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        question = Question.objects.get(id=question_id)
        
        # Get or create question paper
        question_paper, created = QuestionPaper.objects.get_or_create(quiz=quiz)
        
        if fixed:
            # Add to fixed questions
            if question not in question_paper.fixed_questions.all():
                question_paper.fixed_questions.add(question)
                
                # Update order
                if question_paper.fixed_question_order:
                    question_paper.fixed_question_order += f",{question_id}"
                else:
                    question_paper.fixed_question_order = str(question_id)
                
                question_paper.update_total_marks()
                question_paper.save()
        else:
            # For random questions, need to create/update QuestionSet
            marks = request.data.get('marks', question.points)
            num_questions = request.data.get('num_questions', 1)
            question_set_id = request.data.get('question_set_id')
            
            if question_set_id:
                qset = QuestionSet.objects.get(id=question_set_id)
            else:
                qset = QuestionSet.objects.create(
                    marks=marks,
                    num_questions=num_questions
                )
                question_paper.random_questions.add(qset)
            
            if question not in qset.questions.all():
                qset.questions.add(question)
                qset.save()
        
        return Response({
            'message': 'Question added to quiz successfully',
            'question_id': question_id
        }, status=status.HTTP_200_OK)
        
    except Quiz.DoesNotExist:
        return Response(
            {'error': 'Quiz not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Question.DoesNotExist:
        return Response(
            {'error': 'Question not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': 'Failed to add question to quiz', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def teacher_remove_question_from_quiz(request, quiz_id, question_id):
    """Remove a question from quiz's question paper"""
    user = request.user
    
    if not _check_teacher_permission(user):
        return Response(
            {'error': 'You are not authorized'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        quiz = Quiz.objects.get(id=quiz_id)
        
        # Verify ownership
        if quiz.creator != user:
            return Response(
                {'error': 'You do not have permission to modify this quiz'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        question_paper = QuestionPaper.objects.filter(quiz=quiz).first()
        if not question_paper:
            return Response(
                {'error': 'Question paper not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        question = Question.objects.get(id=question_id)
        
        # Remove from fixed questions
        if question in question_paper.fixed_questions.all():
            question_paper.fixed_questions.remove(question)
            
            # Update order
            if question_paper.fixed_question_order:
                order_list = question_paper.fixed_question_order.split(',')
                order_list = [qid for qid in order_list if qid != str(question_id)]
                question_paper.fixed_question_order = ','.join(order_list)
            
            question_paper.update_total_marks()
            question_paper.save()
        
        # Also check random question sets
        for qset in question_paper.random_questions.all():
            if question in qset.questions.all():
                qset.questions.remove(question)
                qset.save()
                # Delete question set if empty
                if qset.questions.count() == 0:
                    question_paper.random_questions.remove(qset)
                    qset.delete()
        
        return Response({
            'message': 'Question removed from quiz successfully'
        }, status=status.HTTP_200_OK)
        
    except Quiz.DoesNotExist:
        return Response(
            {'error': 'Quiz not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': 'Failed to remove question from quiz', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def teacher_reorder_quiz_questions(request, quiz_id):
    """Reorder questions in quiz"""
    user = request.user
    
    if not _check_teacher_permission(user):
        return Response(
            {'error': 'You are not authorized'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        quiz = Quiz.objects.get(id=quiz_id)
        
        # Verify ownership
        if quiz.creator != user:
            return Response(
                {'error': 'You do not have permission to modify this quiz'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        question_paper = QuestionPaper.objects.filter(quiz=quiz).first()
        if not question_paper:
            return Response(
                {'error': 'Question paper not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        question_order = request.data.get('question_order', [])
        if question_order:
            # Validate all question IDs belong to this question paper
            question_ids = [str(qid) for qid in question_order]
            valid_questions = question_paper.fixed_questions.filter(
                id__in=question_ids
            )
            
            if valid_questions.count() != len(question_ids):
                return Response(
                    {'error': 'Some question IDs are invalid'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            question_paper.fixed_question_order = ','.join(question_ids)
            question_paper.save()
        
        return Response({
            'message': 'Question order updated successfully'
        }, status=status.HTTP_200_OK)
        
    except Quiz.DoesNotExist:
        return Response(
            {'error': 'Quiz not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': 'Failed to reorder questions', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ============================================================
#  ENROLLMENT MANAGEMENT APIs
# ============================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def teacher_get_course_enrollments(request, course_id):
    """Get all enrollments for a course (enrolled, pending, rejected)"""
    user = request.user
    
    if not _check_teacher_permission(user):
        return Response(
            {'error': 'You are not authorized'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        course = Course.objects.get(id=course_id)
        
        # Verify teacher owns the course
        if course.creator != user and user not in course.teachers.all():
            return Response(
                {'error': 'You do not have permission to access this course'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get enrolled students
        enrolled_students = []
        for student in course.students.all():
            # Get course status for progress
            try:
                course_status = CourseStatus.objects.get(course=course, user=student)
                progress = course_status.percent_completed
                grade = course_status.grade
            except CourseStatus.DoesNotExist:
                progress = 0
                grade = None
            
            enrolled_students.append({
                'user_id': student.id,
                'username': student.username,
                'email': student.email,
                'first_name': student.first_name,
                'last_name': student.last_name,
                'progress': progress,
                'grade': grade
            })
        
        # Get pending requests
        pending_requests = []
        for student in course.requests.all():
            pending_requests.append({
                'user_id': student.id,
                'username': student.username,
                'email': student.email,
                'first_name': student.first_name,
                'last_name': student.last_name
            })
        
        # Get rejected students
        rejected_students = []
        for student in course.rejected.all():
            rejected_students.append({
                'user_id': student.id,
                'username': student.username,
                'email': student.email,
                'first_name': student.first_name,
                'last_name': student.last_name
            })
        
        return Response({
            'course_id': course.id,
            'course_name': course.name,
            'enrolled': enrolled_students,
            'pending_requests': pending_requests,
            'rejected': rejected_students
        }, status=status.HTTP_200_OK)
        
    except Course.DoesNotExist:
        return Response(
            {'error': 'Course not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def teacher_approve_enrollment(request, course_id, user_id):
    """Approve a student enrollment request"""
    user = request.user
    
    if not _check_teacher_permission(user):
        return Response(
            {'error': 'You are not authorized'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        course = Course.objects.get(id=course_id)
        student = User.objects.get(id=user_id)
        
        # Verify teacher owns the course
        if course.creator != user and user not in course.teachers.all():
            return Response(
                {'error': 'You do not have permission to modify this course'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Remove from requests/rejected and add to enrolled
        course.requests.remove(student)
        course.rejected.remove(student)
        course.students.add(student)
        
        # Create CourseStatus if it doesn't exist
        CourseStatus.objects.get_or_create(course=course, user=student)
        
        return Response({
            'message': 'Enrollment approved successfully',
            'user_id': user_id,
            'username': student.username
        }, status=status.HTTP_200_OK)
        
    except Course.DoesNotExist:
        return Response(
            {'error': 'Course not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def teacher_reject_enrollment(request, course_id, user_id):
    """Reject a student enrollment request"""
    user = request.user
    
    if not _check_teacher_permission(user):
        return Response(
            {'error': 'You are not authorized'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        course = Course.objects.get(id=course_id)
        student = User.objects.get(id=user_id)
        
        # Verify teacher owns the course
        if course.creator != user and user not in course.teachers.all():
            return Response(
                {'error': 'You do not have permission to modify this course'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Remove from requests/enrolled and add to rejected
        course.requests.remove(student)
        course.students.remove(student)
        course.rejected.add(student)
        
        return Response({
            'message': 'Enrollment rejected successfully',
            'user_id': user_id,
            'username': student.username
        }, status=status.HTTP_200_OK)
        
    except Course.DoesNotExist:
        return Response(
            {'error': 'Course not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def teacher_remove_enrollment(request, course_id, user_id):
    """Remove an enrolled student from course"""
    user = request.user
    
    if not _check_teacher_permission(user):
        return Response(
            {'error': 'You are not authorized'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        course = Course.objects.get(id=course_id)
        student = User.objects.get(id=user_id)
        
        # Verify teacher owns the course
        if course.creator != user and user not in course.teachers.all():
            return Response(
                {'error': 'You do not have permission to modify this course'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Remove from enrolled
        course.students.remove(student)
        
        return Response({
            'message': 'Student removed from course successfully',
            'user_id': user_id,
            'username': student.username
        }, status=status.HTTP_200_OK)
        
    except Course.DoesNotExist:
        return Response(
            {'error': 'Course not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )


# ============================================================
#  LEARNING UNIT ORDERING APIs
# ============================================================

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def teacher_reorder_module_units(request, module_id):
    """Reorder learning units within a module"""
    user = request.user
    
    if not _check_teacher_permission(user):
        return Response(
            {'error': 'You are not authorized'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        module = LearningModule.objects.get(id=module_id)
        
        # Verify teacher owns the course - find course that contains this module
        course = Course.objects.filter(learning_module=module).first()
        if not course or (course.creator != user and user not in course.teachers.all()):
            return Response(
                {'error': 'You do not have permission to modify this module'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        unit_orders = request.data.get('unit_orders', [])
        if not unit_orders:
            return Response(
                {'error': 'unit_orders is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update order for each unit
        for unit_order in unit_orders:
            unit_id = unit_order.get('unit_id')
            order = unit_order.get('order')
            
            if unit_id is None or order is None:
                continue
            
            # Try to find as lesson
            try:
                lesson = Lesson.objects.get(id=unit_id, learning_module=module)
                lesson.order = order
                lesson.save()
            except Lesson.DoesNotExist:
                # Try to find as quiz
                try:
                    quiz = Quiz.objects.get(id=unit_id, learning_module=module)
                    # Get the learning unit for this quiz
                    learning_unit = LearningUnit.objects.filter(
                        quiz=quiz, learning_module=module
                    ).first()
                    if learning_unit:
                        learning_unit.order = order
                        learning_unit.save()
                except Quiz.DoesNotExist:
                    continue
        
        return Response({
            'message': 'Unit order updated successfully'
        }, status=status.HTTP_200_OK)
        
    except LearningModule.DoesNotExist:
        return Response(
            {'error': 'Module not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': 'Failed to reorder units', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def teacher_reorder_course_modules(request, course_id):
    """Reorder modules within a course"""
    user = request.user
    
    if not _check_teacher_permission(user):
        return Response(
            {'error': 'You are not authorized'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        course = Course.objects.get(id=course_id)
        
        # Verify teacher owns the course
        if course.creator != user and user not in course.teachers.all():
            return Response(
                {'error': 'You do not have permission to modify this course'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        module_orders = request.data.get('module_orders', [])
        if not module_orders:
            return Response(
                {'error': 'module_orders is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update order for each module
        for module_order in module_orders:
            module_id = module_order.get('module_id')
            order = module_order.get('order')
            
            if module_id is None or order is None:
                continue
            
            try:
                module = LearningModule.objects.get(id=module_id)
                # Verify module belongs to course
                if module in course.learning_module.all():
                    module.order = order
                    module.save()
            except LearningModule.DoesNotExist:
                continue
        
        return Response({
            'message': 'Module order updated successfully'
        }, status=status.HTTP_200_OK)
        
    except Course.DoesNotExist:
        return Response(
            {'error': 'Course not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': 'Failed to reorder modules', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ============================================================
#  COURSE ANALYTICS APIs
# ============================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def teacher_get_course_analytics(request, course_id):
    """Get comprehensive analytics for a course"""
    user = request.user
    
    if not _check_teacher_permission(user):
        return Response(
            {'error': 'You are not authorized'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        course = Course.objects.get(id=course_id)
        
        # Verify teacher owns the course
        if course.creator != user and user not in course.teachers.all():
            return Response(
                {'error': 'You do not have permission to access this course'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get enrolled students
        enrolled_students = course.students.all()
        total_students = enrolled_students.count()
        
        # Get course statuses for progress calculation
        course_statuses = CourseStatus.objects.filter(course=course)
        
        # Calculate completion rate
        completed_count = course_statuses.filter(percent_completed=100).count()
        completion_rate = (completed_count / total_students * 100) if total_students > 0 else 0
        
        # Calculate average score
        avg_score = course_statuses.aggregate(
            avg=Avg('percentage', output_field=FloatField())
        )['avg'] or 0
        
        # Module statistics
        modules = course.get_learning_modules()
        module_stats = []
        for module in modules:
            # Get units from the module (reverse relationship)
            module_units = module.learning_unit.all()
            total_units = module_units.count()
            
            if total_units == 0:
                continue
            
            # Count students who completed all units in this module
            students_completed = 0
            # Get all unit IDs for this module
            module_unit_ids = list(module.learning_unit.values_list('id', flat=True))
            
            for student in enrolled_students:
                try:
                    cs = CourseStatus.objects.get(course=course, user=student)
                    # Filter completed units that belong to this module
                    completed_units_count = cs.completed_units.filter(id__in=module_unit_ids).count()
                    if completed_units_count == total_units:
                        students_completed += 1
                except CourseStatus.DoesNotExist:
                    continue
            
            module_completion_rate = (students_completed / total_students * 100) if total_students > 0 else 0
            
            module_stats.append({
                'module_id': module.id,
                'module_name': module.name,
                'completion_rate': round(module_completion_rate, 2),
                'students_completed': students_completed,
                'total_units': total_units
            })
        
        # Quiz statistics
        quizzes = course.get_quizzes()
        quiz_stats = []
        for quiz in quizzes:
            # Get all answer papers for this quiz
            answer_papers = AnswerPaper.objects.filter(
                question_paper__quiz=quiz,
                course=course,
                status='completed'
            )
            
            total_attempts = answer_papers.count()
            
            if total_attempts > 0:
                # Calculate average score
                avg_score_quiz = answer_papers.aggregate(
                    avg=Avg('percent', output_field=FloatField())
                )['avg'] or 0
                
                # Calculate pass rate
                passed_count = answer_papers.filter(passed=True).count()
                pass_rate = (passed_count / total_attempts * 100) if total_attempts > 0 else 0
                
                # Get question paper for total questions
                try:
                    question_paper = QuestionPaper.objects.get(quiz=quiz)
                    total_questions = question_paper.fixed_questions.count()
                except QuestionPaper.DoesNotExist:
                    total_questions = 0
                
                quiz_stats.append({
                    'quiz_id': quiz.id,
                    'quiz_name': quiz.description,
                    'total_attempts': total_attempts,
                    'average_score': round(avg_score_quiz, 2),
                    'pass_rate': round(pass_rate, 2),
                    'total_questions': total_questions
                })
        
        # Top students (by course completion percentage)
        top_students_data = []
        for cs in course_statuses.order_by('-percentage')[:5]:
            student = cs.user
            top_students_data.append({
                'user_id': student.id,
                'username': student.username,
                'first_name': student.first_name,
                'last_name': student.last_name,
                'score': round(cs.percentage, 2),
                'grade': cs.grade or 'N/A',
                'completion': cs.percent_completed
            })
        
        # Question statistics (for quizzes in this course)
        question_stats = []
        for quiz in quizzes:
            try:
                question_paper = QuestionPaper.objects.get(quiz=quiz)
                questions = question_paper.fixed_questions.all()
                
                for question in questions:
                    # Get all answer papers that attempted this question
                    answer_papers_with_q = AnswerPaper.objects.filter(
                        question_paper=question_paper,
                        course=course,
                        questions=question,
                        status='completed'
                    )
                    
                    total_attempts_q = answer_papers_with_q.count()
                    
                    if total_attempts_q > 0:
                        # Count correct answers (simplified - check if marks > 0)
                        correct_attempts = answer_papers_with_q.filter(
                            answers__question=question,
                            answers__correct=True
                        ).distinct().count()
                        
                        # Calculate average score for this question
                        question_answers = Answer.objects.filter(
                            answerpaper__in=answer_papers_with_q,
                            question=question
                        )
                        avg_question_score = question_answers.aggregate(
                            avg=Avg('marks', output_field=FloatField())
                        )['avg'] or 0
                        
                        question_stats.append({
                            'question_id': question.id,
                            'summary': question.summary,
                            'quiz_id': quiz.id,
                            'quiz_name': quiz.description,
                            'average_score': round(avg_question_score, 2),
                            'attempts': total_attempts_q,
                            'correct_attempts': correct_attempts
                        })
            except QuestionPaper.DoesNotExist:
                continue
        
        # Enrollment trends (last 30 days)
        # Note: Since ManyToManyField doesn't track enrollment dates by default,
        # we'll show the total enrolled count for each day (simplified)
        enrollment_trends = []
        today = timezone.now().date()
        total_enrolled = course.students.count()
        for i in range(29, -1, -1):
            date = today - timedelta(days=i)
            # For now, show total enrolled (can be enhanced with enrollment tracking later)
            enrollment_trends.append({
                'date': date.isoformat(),
                'enrolled': total_enrolled
            })
        
        return Response({
            'course_id': course.id,
            'course_name': course.name,
            'total_students': total_students,
            'enrolled_students': total_students,
            'completion_rate': round(completion_rate, 2),
            'average_score': round(avg_score, 2),
            'module_stats': module_stats,
            'quiz_stats': quiz_stats,
            'top_students': top_students_data,
            'question_statistics': question_stats[:20],  # Limit to top 20
            'enrollment_trends': enrollment_trends
        }, status=status.HTTP_200_OK)
        
    except Course.DoesNotExist:
        return Response(
            {'error': 'Course not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': 'Failed to get analytics', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
