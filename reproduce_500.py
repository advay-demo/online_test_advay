import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "online_test.settings")
django.setup()

from django.test import RequestFactory
from django.contrib.auth.models import User
from api import views
from yaksh.models import Profile

print("--- REPRODUCING API 500 ERROR ---")

# Setup User
username = 'reproduce_500_user'
password = 'password'
if not User.objects.filter(username=username).exists():
    user = User.objects.create_user(username=username, password=password)
    Profile.objects.create(user=user, is_moderator=True)
    from django.contrib.auth.models import Group
    g, _ = Group.objects.get_or_create(name='moderator')
    g.user_set.add(user)
else:
    user = User.objects.get(username=username)

# Create a BAD question
from yaksh.models import Question, TestCase
try:
    bad_q = Question.objects.create(user=user, summary="Bad Question", active=True, points=1)
    # Bypass choices validation if possible, or use update
    tc = TestCase.objects.create(question=bad_q, type='valid_type') # Create valid first
    TestCase.objects.filter(id=tc.id).update(type='non_existent_model_type')
    print("Created Bad Question with invalid TestCase type")
    
    # Create a Question with NO test cases (triggers None return)
    empty_q = Question.objects.create(user=user, summary="Empty Question", active=True, points=1)
    print("Created Question with NO test cases")
    
except Exception as e:
    print(f"Failed to create bad data: {e}")

factory = RequestFactory()

def test_url(query_string, name):
    print(f"\nTesting {name} with query: {query_string}")
    request = factory.get(f'/api/teacher/questions/?{query_string}')
    request.user = user
    try:
        response = views.teacher_questions_list(request)
        print(f"Status Code: {response.status_code}")
        if response.status_code != 200:
             print("Data:", response.data)
    except Exception as e:
        print(f"CRASHED: {e}")
        import traceback
        traceback.print_exc()

# Test 1: Empty
test_url('', "Empty")

# Test 2: Search (Triggers Q object)
test_url('search=test', "Search")

# Test 3: Active
test_url('active=true', "Active True")
test_url('active=false', "Active False")
test_url('active=', "Active Empty")

print("\n--- END REPRODUCTION ---")
