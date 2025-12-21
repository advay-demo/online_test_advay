import os
import django
import sys
from rest_framework.request import Request

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "online_test.settings")
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate

from django.contrib.auth.models import User
from yaksh.models import Course, LearningModule, LearningUnit, Profile, CourseStatus
from api import views

print("--- REPRODUCING 500 ERROR ---")

# 1. Setup User
username = 'continue_user'
if not User.objects.filter(username=username).exists():
    user = User.objects.create_user(username=username, password='password')
    Profile.objects.create(user=user)
else:
    user = User.objects.get(username=username)

# 2. Setup Course & Module & Unit
course, _ = Course.objects.get_or_create(name='ContinueCourse', code='CONT101', active=True, creator=user)
module, _ = LearningModule.objects.get_or_create(name='ContinueModule', active=True, order=1, creator=user)
if module not in course.learning_module.all():
    course.learning_module.add(module)

# Create a unit
# Note: Unit usually links to lesson or quiz.
from yaksh.models import Lesson
lesson, _ = Lesson.objects.get_or_create(name='ContinueLesson', description='desc', active=True, creator=user)
unit, _ = LearningUnit.objects.get_or_create(order=1, type='lesson', lesson=lesson)
if unit not in module.learning_unit.all():
    module.learning_unit.add(unit)

# 3. Enroll User
if not course.students.filter(id=user.id).exists():
    course.students.add(user)

# 3b. Create CourseStatus
status, _ = CourseStatus.objects.get_or_create(user=user, course=course)

# 4. Invoke View
factory = APIRequestFactory()
request = factory.get(f'/api/student/courses/{course.id}/modules/')
force_authenticate(request, user=user)

print("Calling course_modules...")
try:
    response = views.course_modules(request, course_id=course.id)
    print(f"Response Code: {response.status_code}")
    if response.status_code == 200:
        print("SUCCESS: View returned 200")
    else:
        print(f"FAILURE: View returned {response.status_code}")
        print(response.data)
except Exception as e:
    print("CRASHED!")
    import traceback
    traceback.print_exc()

print("--- END REPRODUCTION ---")
