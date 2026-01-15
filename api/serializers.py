from rest_framework import serializers
from yaksh.models import (
    Question, Quiz, QuestionPaper, AnswerPaper, Course,
    LearningModule, LearningUnit, Lesson, CourseStatus,
    Badge, UserBadge, BadgeProgress, UserStats, DailyActivity, UserActivity, Post, Comment, User, Profile
)
from grades.models import GradingSystem, GradeRange
from notifications_plugin.models import Notification




class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model"""
    message_uid = serializers.CharField(source='message.uid', read_only=True)
    sender_name = serializers.CharField(source='message.creator.get_full_name', read_only=True)
    sender_username = serializers.CharField(source='message.creator.username', read_only=True)
    summary = serializers.CharField(source='message.summary', read_only=True)
    description = serializers.CharField(source='message.description', read_only=True)
    message_type = serializers.CharField(source='message.message_type', read_only=True)
    time_since = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'message_uid', 'sender_name', 'sender_username',
            'summary', 'description', 'message_type', 
            'timestamp', 'read', 'time_since'
        ]
        read_only_fields = ['message_uid', 'timestamp']
    
    def get_time_since(self, obj):
        """Get human-readable time since notification was created"""
        from django.utils.timesince import timesince
        return timesince(obj.timestamp)





class GradeRangeSerializer(serializers.ModelSerializer):
    class Meta:
        model = GradeRange
        fields = ['id', 'lower_limit', 'upper_limit', 'grade', 'description']
        read_only_fields = ['id']



class GradingSystemSerializer(serializers.ModelSerializer):
    grade_ranges = GradeRangeSerializer(many=True, source='graderange_set')

    class Meta:
        model = GradingSystem
        fields = ['id', 'name', 'description', 'grade_ranges', 'creator']
        read_only_fields = ['id', 'creator']

    def create(self, validated_data):
        grade_ranges_data = validated_data.pop('graderange_set')
        grading_system = GradingSystem.objects.create(**validated_data)
        for gr in grade_ranges_data:
            GradeRange.objects.create(system=grading_system, **gr)
        return grading_system

    def update(self, instance, validated_data):
        grade_ranges_data = validated_data.pop('graderange_set', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if grade_ranges_data is not None:
            instance.graderange_set.all().delete()
            for gr in grade_ranges_data:
                GradeRange.objects.create(system=instance, **gr)
        return instance

class PostSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source='creator.username', read_only=True)

    class Meta:
        model = Post
        fields = '__all__'
        read_only_fields = ['creator']
        

class CommentSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source='creator.username', read_only=True)
    # or use 'get_full_name' if you want full name

    class Meta:
        model = Comment
        fields = ['id', 'description', 'created_at', 'modified_at', 'author']



class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile with nested user fields"""
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    email = serializers.EmailField(source='user.email', required=False)
    username = serializers.CharField(source='user.username', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    is_moderator = serializers.BooleanField(read_only=True)
    email_verified = serializers.BooleanField(source='is_email_verified', read_only=True)
    
    class Meta:
        model = Profile
        fields = [
            'user_id', 'username', 'email', 'first_name', 'last_name',
            'roll_number', 'institute', 'department', 'position',
            'bio', 'phone', 'city', 'country', 'linkedin', 'github',
            'display_name', 'timezone', 'is_moderator', 'email_verified'
        ]
        read_only_fields = ['user_id', 'username', 'is_moderator', 'email_verified']
    
    def validate_email(self, value):
        """Validate that email is unique"""
        user = self.context['request'].user
        if User.objects.filter(email=value).exclude(id=user.id).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value
    
    def update(self, instance, validated_data):
        """Update both User and Profile models"""
        user_data = validated_data.pop('user', {})
        user = instance.user
        
        # Update User fields
        if 'first_name' in user_data:
            user.first_name = user_data['first_name']
        if 'last_name' in user_data:
            user.last_name = user_data['last_name']
        if 'email' in user_data:
            user.email = user_data['email']
        user.save()
        
        # Update Profile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        return instance
        

class QuestionSerializer(serializers.ModelSerializer):
    test_cases = serializers.SerializerMethodField()
    files = serializers.SerializerMethodField()

    def to_bool(self, val):
        if isinstance(val, bool):
            return val
        if isinstance(val, str):
            return val.lower() == "true"
        return bool(val)  

    def get_test_cases(self, obj):
        try:
            return obj.get_test_cases_as_dict()
        except Exception:
            return []

    def get_files(self, obj):  
        import os
        from yaksh.models import FileUpload
        files = []
        request = self.context.get('request')  # Get request from context
        for f in FileUpload.objects.filter(question=obj):
            # Build absolute URL if request is available
            if request and hasattr(f.file, 'url'):
                file_url = request.build_absolute_uri(f.file.url)
            else:
                file_url = f.file.url if hasattr(f.file, "url") else ""
            
            files.append({
                "id": f.id,
                "name": os.path.basename(f.file.name),
                "url": file_url,
                "extract": f.extract,
                "hide": f.hide,
            })
        return files

    def update(self, instance, validated_data):
        # Update Question fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update FileUpload extract/hide if files data is present
        files_data = self.initial_data.get("files")
        if files_data:
            from yaksh.models import FileUpload
            for file_data in files_data:
                file_id = file_data.get("id")
                if file_id is not None:
                    try:
                        file_obj = FileUpload.objects.get(id=file_id, question=instance)
                        # Coerce to bool in case frontend sends as string
                        extract = file_data.get("extract")
                        hide = file_data.get("hide")
                        if extract is not None:
                            file_obj.extract = str(extract).lower() == "true" if isinstance(extract, str) else bool(extract)
                        if hide is not None:
                            file_obj.hide = str(hide).lower() == "true" if isinstance(hide, str) else bool(hide)
                        file_obj.save()
                    except FileUpload.DoesNotExist:
                        continue
        return instance    

    class Meta:
        model = Question
        fields = '__all__'


class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = '__all__'


class QuestionPaperSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionPaper
        fields = '__all__'


class QuestionPaperDetailSerializer(serializers.ModelSerializer):
    fixed_questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = QuestionPaper
        fields = '__all__'


class AnswerPaperSerializer(serializers.ModelSerializer):

    questions = QuestionSerializer(many=True)

    class Meta:
        model = AnswerPaper
        fields = '__all__'


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = '__all__'


class LearningUnitSerializer(serializers.ModelSerializer):

    quiz = QuizSerializer()
    lesson = LessonSerializer()

    class Meta:
        model = LearningUnit
        fields = '__all__'


class LearningModuleSerializer(serializers.ModelSerializer):

    learning_unit = LearningUnitSerializer(many=True)

    class Meta:
        model = LearningModule
        fields = '__all__'


class CourseSerializer(serializers.ModelSerializer):

    learning_module = LearningModuleSerializer(many=True)

    class Meta:
        model = Course
        exclude = (
            'teachers',
            'rejected',
            'requests',
            'students',
            'grading_system',
            'view_grade',
        )


###############################################################################
# Badge & Achievement Serializers
###############################################################################

class BadgeSerializer(serializers.ModelSerializer):
    """Serializer for Badge model"""
    class Meta:
        model = Badge
        fields = ['id', 'name', 'description', 'icon', 'color', 'badge_type', 
                 'criteria_type', 'criteria_value']


class UserBadgeSerializer(serializers.ModelSerializer):
    """Serializer for earned badges with badge details"""
    badge = BadgeSerializer(read_only=True)
    earned_date = serializers.DateTimeField(format="%b %d, %Y")
    
    class Meta:
        model = UserBadge
        fields = ['id', 'badge', 'earned_date']


class BadgeProgressSerializer(serializers.ModelSerializer):
    """Serializer for badge progress tracking"""
    badge = BadgeSerializer(read_only=True)
    progress_percentage = serializers.SerializerMethodField()
    steps = serializers.SerializerMethodField()
    
    def get_progress_percentage(self, obj):
        return obj.progress_percentage()
    
    def get_steps(self, obj):
        return {
            'completed': obj.current_progress,
            'total': obj.badge.criteria_value
        }
    
    class Meta:
        model = BadgeProgress
        fields = ['id', 'badge', 'current_progress', 'progress_percentage', 'steps']


###############################################################################
# Stats & Activity Serializers
###############################################################################

class UserStatsSerializer(serializers.ModelSerializer):
    """Serializer for user statistics"""
    learning_hours = serializers.SerializerMethodField()
    
    def get_learning_hours(self, obj):
        hours = int(obj.total_learning_hours)
        minutes = int((obj.total_learning_hours - hours) * 60)
        return f"{hours}h {minutes}m"
    
    class Meta:
        model = UserStats
        fields = ['total_challenges_solved', 'challenges_this_week', 
                 'challenges_this_month', 'current_streak', 'longest_streak',
                 'learning_hours', 'last_activity_date']


class UserActivitySerializer(serializers.ModelSerializer):
    """Serializer for user activity feed"""
    time = serializers.SerializerMethodField()
    
    def get_time(self, obj):
        from django.utils import timezone
        now = timezone.now()
        diff = now - obj.timestamp
        
        if diff.days > 0:
            return f"{diff.days}d ago"
        elif diff.seconds >= 3600:
            hours = diff.seconds // 3600
            return f"{hours}h ago"
        elif diff.seconds >= 60:
            minutes = diff.seconds // 60
            return f"{minutes}m ago"
        else:
            return "Just now"
    
    class Meta:
        model = UserActivity
        fields = ['id', 'activity_type', 'title', 'description', 'icon', 
                 'color', 'badge_name', 'time', 'timestamp']


###############################################################################
# Enhanced Course Serializers for Student Dashboard
###############################################################################

class CourseProgressSerializer(serializers.ModelSerializer):
    """Enhanced course serializer with student progress"""
    progress = serializers.SerializerMethodField()
    lessons = serializers.SerializerMethodField()
    instructor = serializers.SerializerMethodField()
    color = serializers.SerializerMethodField()
    next_lesson = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()
    
    def get_progress(self, obj):
        user = self.context.get('user')
        if not user:
            return 0
        
        try:
            course_status = CourseStatus.objects.get(user=user, course=obj)
            # Count total learning units across all modules
            total_units = 0
            for module in obj.learning_module.all():
                total_units += module.learning_unit.count()
            
            if total_units == 0:
                return 0
            
            completed_units = course_status.completed_units.count()
            return int((completed_units / total_units) * 100)
        except CourseStatus.DoesNotExist:
            return 0
    
    def get_lessons(self, obj):
        total = 0
        completed = 0
        
        user = self.context.get('user')
        if user:
            try:
                course_status = CourseStatus.objects.get(user=user, course=obj)
                completed = course_status.completed_units.filter(type='lesson').count()
            except CourseStatus.DoesNotExist:
                pass
        
        for module in obj.learning_module.all():
            total += module.learning_unit.filter(type='lesson').count()
        
        return {'completed': completed, 'total': total}
    
    def get_instructor(self, obj):
        creator = obj.creator
        return f"{creator.first_name} {creator.last_name}" if creator.first_name else creator.username
    
    def get_color(self, obj):
        # Assign colors based on course id for variety
        colors = ['indigo', 'blue', 'purple', 'pink', 'cyan', 'green', 'orange']
        return colors[obj.id % len(colors)]
    
    def get_next_lesson(self, obj):
        user = self.context.get('user')
        if not user:
            return None
        
        try:
            course_status = CourseStatus.objects.get(user=user, course=obj)
            if course_status.current_unit and course_status.current_unit.type == 'lesson':
                return course_status.current_unit.lesson.name
        except (CourseStatus.DoesNotExist, AttributeError):
            pass
        
        # Get first lesson
        for module in obj.learning_module.order_by('order'):
            first_lesson = module.learning_unit.filter(type='lesson').order_by('order').first()
            if first_lesson:
                return first_lesson.lesson.name
        
        return None
    
    def get_is_enrolled(self, obj):
        user = self.context.get('user')
        if not user:
            return False
        return obj.students.filter(id=user.id).exists()
    
    class Meta:
        model = Course
        fields = ['id', 'name', 'progress', 'lessons', 'instructor', 'color', 
                 'next_lesson', 'is_enrolled', 'code', 'created_on']


class CourseCatalogSerializer(serializers.ModelSerializer):
    """Serializer for course catalog with enrollment info"""
    instructor = serializers.SerializerMethodField()
    level = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    students_count = serializers.SerializerMethodField()
    duration = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()
    color = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()
    
    def get_instructor(self, obj):
        creator = obj.creator
        return f"Prof. {creator.first_name} {creator.last_name}" if creator.first_name else f"Prof. {creator.username}"
    
    def get_level(self, obj):
        # You can add a level field to Course model or compute it
        return "Intermediate"
    
    def get_rating(self, obj):
        # Placeholder - implement rating system later
        return 4.5
    
    def get_students_count(self, obj):
        return obj.students.count()
    
    def get_duration(self, obj):
        # Estimate based on modules/lessons
        total_lessons = 0
        for module in obj.learning_module.all():
            total_lessons += module.learning_unit.filter(type='lesson').count()
        hours = total_lessons * 2  # Estimate 2 hours per lesson
        return f"{hours} hours"
    
    def get_progress(self, obj):
        user = self.context.get('user')
        if not user:
            return 0
        
        try:
            course_status = CourseStatus.objects.get(user=user, course=obj)
            total_units = sum(module.learning_unit.count() for module in obj.learning_module.all())
            
            if total_units == 0:
                return 0
            
            completed_units = course_status.completed_units.count()
            return int((completed_units / total_units) * 100)
        except CourseStatus.DoesNotExist:
            return 0
    
    def get_color(self, obj):
        colors = ['cyan', 'blue', 'orange', 'green', 'purple', 'indigo', 'pink']
        return colors[obj.id % len(colors)]
    
    def get_is_enrolled(self, obj):
        user = self.context.get('user')
        if not user:
            return False
        return obj.students.filter(id=user.id).exists()
    
    class Meta:
        model = Course
        fields = ['id', 'name', 'instructor', 'level', 'rating', 'students_count',
                 'duration', 'progress', 'color', 'is_enrolled', 'code']


###############################################################################
# Enhanced Lesson & Module Serializers
###############################################################################

class LessonDetailSerializer(serializers.ModelSerializer):
    """Detailed lesson serializer with video and files"""
    video_url = serializers.SerializerMethodField()
    files = serializers.SerializerMethodField()
    is_completed = serializers.SerializerMethodField()
    
    def get_video_url(self, obj):
        if obj.video_path:
            return obj.video_path
        return None
    
    def get_files(self, obj):
        files = obj.get_files()
        return [{'id': f.id, 'name': f.file.name} for f in files]
    
    def get_is_completed(self, obj):
        user = self.context.get('user')
        course_id = self.context.get('course_id')
        
        if not user or not course_id:
            return False
        
        try:
            course_status = CourseStatus.objects.get(user=user, course_id=course_id)
            # Find the learning unit for this lesson
            learning_unit = LearningUnit.objects.filter(
                lesson=obj,
                learning_unit__learning_module__id=course_id
            ).first()
            
            if learning_unit:
                return course_status.completed_units.filter(id=learning_unit.id).exists()
        except CourseStatus.DoesNotExist:
            pass
        
        return False
    
    class Meta:
        model = Lesson
        fields = ['id', 'name', 'description', 'html_data', 'video_url', 
                 'video_file', 'files', 'is_completed', 'active']


class LearningUnitDetailSerializer(serializers.ModelSerializer):
    """Detailed learning unit with quiz or lesson data"""
    lesson = LessonDetailSerializer(read_only=True)
    quiz = QuizSerializer(read_only=True)
    status = serializers.SerializerMethodField()
    
    def get_status(self, obj):
        user = self.context.get('user')
        course_id = self.context.get('course_id')
        
        if not user or not course_id:
            return "not_attempted"
        
        try:
            from yaksh.models import Course
            course = Course.objects.get(id=course_id)
            return obj.get_completion_status(user, course)
        except:
            return "not_attempted"
    
    class Meta:
        model = LearningUnit
        fields = ['id', 'order', 'type', 'lesson', 'quiz', 'status', 'check_prerequisite']


class LearningModuleDetailSerializer(serializers.ModelSerializer):
    """Detailed module serializer with units and progress"""
    units = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()
    
    def get_units(self, obj):
        units = obj.get_learning_units()
        serializer = LearningUnitDetailSerializer(
            units, many=True, context=self.context
        )
        return serializer.data
    
    def get_progress(self, obj):
        user = self.context.get('user')
        course_id = self.context.get('course_id')
        
        if not user or not course_id:
            return 0
        
        try:
            course_status = CourseStatus.objects.get(user=user, course_id=course_id)
            total_units = obj.learning_unit.count()
            
            if total_units == 0:
                return 0
            
            completed_units = 0
            for unit in obj.learning_unit.all():
                if course_status.completed_units.filter(id=unit.id).exists():
                    completed_units += 1
            
            return int((completed_units / total_units) * 100)
        except CourseStatus.DoesNotExist:
            return 0
    
    class Meta:
        model = LearningModule
        fields = ['id', 'name', 'description', 'order', 'units', 'progress', 
                 'check_prerequisite', 'active']



class LearningModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningModule
        fields = '__all__' 


class MinimalLearningUnitSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()
    check_prerequisite = serializers.BooleanField()

    def get_display_name(self, obj):
        if obj.type == "quiz" and obj.quiz:
            return f"{obj.quiz.description} (quiz)"
        elif obj.type == "lesson" and obj.lesson:
            return f"{obj.lesson.name} (lesson)"
        return ""

    class Meta:
        model = LearningUnit
        fields = ['id', 'type', 'order', 'display_name', 'check_prerequisite']                   



class SimpleUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
