import os
import django
import json

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "online_test.settings")
django.setup()

from django.test import Client
from django.contrib.auth.models import User
from yaksh.models import Course, Profile
from api.serializers import ProfileSerializer

# Test teacher profile
teacher = User.objects.filter(email='teacher@example.com').first()
if teacher:
    print("Testing Teacher payload:")
    client = Client()
    client.force_login(teacher)
    response = client.get('/api/auth/profile/')
    if response.status_code == 200:
        data = response.json()
        print(json.dumps(data, indent=2))
    else:
        print(f"Failed with status: {response.status_code}")

print("\n----------------\n")

# Test student profile
student = User.objects.filter(email='student@example.com').first()
if student:
    print("Testing Student payload:")
    client = Client()
    client.force_login(student)
    response = client.get('/api/auth/profile/')
    if response.status_code == 200:
        data = response.json()
        print(json.dumps(data, indent=2))
    else:
        print(f"Failed with status: {response.status_code}")
