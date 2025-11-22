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
    AnswerPaper, Course, Answer, Profile
)

from yaksh.code_server import get_result as get_result_from_code_server
from yaksh.settings import SERVER_POOL_PORT, SERVER_HOST_NAME

from api.serializers import (
    QuestionSerializer, QuizSerializer, QuestionPaperSerializer,
    AnswerPaperSerializer, CourseSerializer
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
