# End-to-End Testing Guide

## Overview

This document provides a comprehensive guide for testing all implemented features in the React frontend and Django REST APIs.

## Completed Features Summary

### ✅ Student Features (Previously Completed)
1. **Student Dashboard** - User stats, enrolled courses, recent activities
2. **Course Catalog** - Browse courses, filter, enroll
3. **Course Modules** - View modules and learning units
4. **Lessons** - View lesson content, mark as complete
5. **Quizzes** - Take quizzes, timer, question navigation, submit answers
6. **Insights** - View badges and progress
7. **Profile** - User profile management

### ✅ Teacher Features (Newly Completed)
1. **Teacher Dashboard** - Course stats, recent courses, upcoming quizzes
2. **Course Management** - Create, edit, list courses
3. **Module Management** - Create, edit, delete modules within courses
4. **Lesson Management** - Create, edit, delete lessons within modules
5. **Quiz Management** - Create, edit, delete quizzes within modules
6. **Question Management** - Full CRUD for questions (MCQ, MCC, Code, Integer, Float, String, Arrange)
7. **Quiz Question Management** - Add/remove/reorder questions in quizzes
8. **Enrollment Management** - Approve/reject student enrollments
9. **Design Course** - Reorder modules and learning units
10. **Course Analytics** - View course statistics, module completion, quiz performance, top students

---

## Prerequisites for Testing

### 1. Backend Setup
```bash
# Activate virtual environment
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (if not exists)
python manage.py createsuperuser

# Initialize badges (if not done)
python manage.py initialize_badges

# Start Django server
python manage.py runserver
```

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Test Accounts
- **Teacher Account**: Create via Django admin or signup
- **Student Account**: Create via Django admin or signup
- Ensure teacher account has moderator permissions (use Django admin)

---

## Testing Flow: Teacher Features

### Phase 1: Teacher Authentication & Dashboard

#### 1.1 Login as Teacher
**Frontend:** `http://localhost:5173/signin`
- Enter teacher credentials
- Should redirect to `/teacher/dashboard`

**Expected Result:**
- Dashboard loads with stats (Total Courses, Active Courses, Students, Avg. Completion)
- Recent Events section shows upcoming quizzes
- Recent Courses section shows created courses
- "Create New Course" button visible

**API Test:**
```bash
# Get teacher dashboard
curl -X GET http://localhost:8000/api/teacher/dashboard/ \
  -H "Authorization: Token YOUR_TOKEN"
```

---

### Phase 2: Course Management

#### 2.1 Create a New Course
**Frontend:** Click "Create New Course" → `/teacher/add-course`

**Steps:**
1. Fill in course details:
   - Course Name: "Python Basics"
   - Instructions: "Learn Python programming fundamentals"
   - Code: "PYTHON101"
   - Enrollment: "default" or "open"
   - Start/End Enrollment Dates
   - Grading System: (optional)
2. Click "Create Course"

**Expected Result:**
- Course created successfully
- Redirected to course management page
- Course appears in courses list

**API Test:**
```bash
# Create course
curl -X POST http://localhost:8000/api/teacher/courses/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Python Basics",
    "instructions": "Learn Python programming",
    "code": "PYTHON101",
    "enrollment": "default",
    "active": true
  }'
```

#### 2.2 List Courses
**Frontend:** `/teacher/courses`

**Steps:**
1. View all courses
2. Filter by status (All, Active, Inactive, Draft)
3. Search courses by name

**Expected Result:**
- All courses created by teacher displayed
- Filtering works correctly
- Search works correctly
- Each course shows: name, status, students count, modules count

**API Test:**
```bash
# List courses
curl -X GET "http://localhost:8000/api/teacher/courses/?status=all&search=" \
  -H "Authorization: Token YOUR_TOKEN"
```

#### 2.3 Edit Course
**Frontend:** Click "Edit" on a course → `/teacher/courses/{courseId}/edit`

**Steps:**
1. Modify course details
2. Click "Update Course"

**Expected Result:**
- Course updated successfully
- Changes reflected in course list

**API Test:**
```bash
# Update course
curl -X PUT http://localhost:8000/api/teacher/courses/1/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Python Basics Updated",
    "instructions": "Updated description"
  }'
```

---

### Phase 3: Module Management

#### 3.1 Create Module
**Frontend:** `/teacher/courses/{courseId}/manage` → Modules tab → "Add Module"

**Steps:**
1. Fill module form:
   - Module Name: "Introduction to Python"
   - Description: "Learn Python basics"
   - Order: 1
   - Active: checked
   - Check Prerequisite: unchecked
2. Click "Create"

**Expected Result:**
- Module created and appears in modules list
- Module shows in course structure

**API Test:**
```bash
# Create module
curl -X POST http://localhost:8000/api/teacher/courses/1/modules/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Introduction to Python",
    "description": "Learn Python basics",
    "order": 1,
    "active": true,
    "check_prerequisite": false
  }'
```

#### 3.2 Edit Module
**Frontend:** Click "Edit" on a module

**Steps:**
1. Modify module details
2. Click "Update"

**Expected Result:**
- Module updated successfully

#### 3.3 Delete Module
**Frontend:** Click "Delete" on a module

**Steps:**
1. Confirm deletion
2. Module should be removed

**Expected Result:**
- Module deleted
- All lessons/quizzes in module also removed

---

### Phase 4: Lesson Management

#### 4.1 Create Lesson
**Frontend:** Modules tab → Click "Add Lesson" on a module

**Steps:**
1. Fill lesson form:
   - Lesson Name: "Python Variables"
   - Description: "Learn about variables in Python"
   - Video URL: (optional) YouTube ID or URL
   - Order: 1
   - Active: checked
2. Click "Create"

**Expected Result:**
- Lesson created and appears in module's learning units
- Lesson shows with lesson icon

**API Test:**
```bash
# Create lesson
curl -X POST http://localhost:8000/api/teacher/modules/1/lessons/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Python Variables",
    "description": "Learn about variables",
    "video_path": "",
    "order": 1,
    "active": true
  }'
```

#### 4.2 Edit Lesson
**Frontend:** Click "Edit" on a lesson

**Steps:**
1. Modify lesson details
2. Click "Update"

**Expected Result:**
- Lesson updated successfully

#### 4.3 Delete Lesson
**Frontend:** Click "Delete" on a lesson

**Expected Result:**
- Lesson deleted from module

---

### Phase 5: Quiz Management

#### 5.1 Create Quiz
**Frontend:** Modules tab → Click "Add Quiz" on a module

**Steps:**
1. Fill quiz form:
   - Description: "Python Basics Quiz"
   - Instructions: "Answer all questions"
   - Duration: 30 (minutes)
   - Attempts Allowed: 3
   - Pass Criteria: 60%
   - Weightage: 100%
   - Allow Skip: checked
   - Active: checked
   - Order: 2
2. Click "Create"

**Expected Result:**
- Quiz created and appears in module's learning units
- Quiz shows with quiz icon

**API Test:**
```bash
# Create quiz
curl -X POST http://localhost:8000/api/teacher/modules/1/quizzes/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Python Basics Quiz",
    "instructions": "Answer all questions",
    "duration": 30,
    "attempts_allowed": 3,
    "pass_criteria": 60.0,
    "weightage": 100.0,
    "allow_skip": true,
    "active": true,
    "order": 2
  }'
```

#### 5.2 Edit Quiz
**Frontend:** Click "Edit" on a quiz

**Steps:**
1. Modify quiz details
2. Click "Update"

**Expected Result:**
- Quiz updated successfully

#### 5.3 Delete Quiz
**Frontend:** Click "Delete" on a quiz

**Expected Result:**
- Quiz deleted from module

---

### Phase 6: Question Management

#### 6.1 Create Question (MCQ)
**Frontend:** `/teacher/questions` → "Create Question"

**Steps:**
1. Fill question form:
   - Summary: "What is Python?"
   - Description: "Select the correct answer"
   - Type: "MCQ (Single Correct)"
   - Language: "Python"
   - Points: 5
   - Topic: "Basics"
2. Add Test Case:
   - Options: "A programming language", "A snake", "A framework", "A database"
   - Correct Option Index: 0
3. Click "Create Question"

**Expected Result:**
- Question created successfully
- Appears in questions list

**API Test:**
```bash
# Create MCQ question
curl -X POST http://localhost:8000/api/teacher/questions/create/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "What is Python?",
    "description": "Select the correct answer",
    "type": "mcq",
    "language": "python",
    "points": 5.0,
    "active": true,
    "test_cases": [{
      "type": "mcqtestcase",
      "options": ["A programming language", "A snake", "A framework", "A database"],
      "correct": 0
    }]
  }'
```

#### 6.2 Create Code Question
**Frontend:** `/teacher/questions/create`

**Steps:**
1. Fill question form:
   - Summary: "Print Hello World"
   - Description: "Write a program to print Hello World"
   - Type: "Code (Programming)"
   - Language: "Python"
   - Points: 10
   - Snippet: "print(" (optional)
2. Add Test Case:
   - Expected Input: (empty)
   - Expected Output: "Hello World"
   - Weight: 1.0
   - Hidden: unchecked
3. Click "Create Question"

**Expected Result:**
- Code question created with test case

**API Test:**
```bash
# Create code question
curl -X POST http://localhost:8000/api/teacher/questions/create/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Print Hello World",
    "description": "Write a program to print Hello World",
    "type": "code",
    "language": "python",
    "points": 10.0,
    "snippet": "print(",
    "test_cases": [{
      "type": "stdiobasedtestcase",
      "expected_input": "",
      "expected_output": "Hello World",
      "weight": 1.0,
      "hidden": false
    }]
  }'
```

#### 6.3 List Questions
**Frontend:** `/teacher/questions`

**Steps:**
1. View all questions
2. Filter by:
   - Type (MCQ, Code, etc.)
   - Language (Python, Java, etc.)
   - Status (Active/Inactive)
3. Search questions

**Expected Result:**
- All questions displayed
- Filtering works
- Search works
- Each question shows: summary, type, points, test cases count

**API Test:**
```bash
# List questions
curl -X GET "http://localhost:8000/api/teacher/questions/?type=code&language=python" \
  -H "Authorization: Token YOUR_TOKEN"
```

#### 6.4 Edit Question
**Frontend:** Click "Edit" on a question

**Steps:**
1. Modify question details
2. Update test cases if needed
3. Click "Update Question"

**Expected Result:**
- Question updated successfully

#### 6.5 Delete Question
**Frontend:** Click "Delete" on a question

**Expected Result:**
- Question deleted
- Removed from all quizzes (if added)

---

### Phase 7: Quiz Question Management

#### 7.1 Add Questions to Quiz
**Frontend:** Modules tab → Click "Questions" button on a quiz

**Steps:**
1. Modal opens showing current questions (empty initially)
2. Click "Add Questions"
3. Search/filter questions
4. Select questions to add (checkbox)
5. Click "Add X Questions"

**Expected Result:**
- Questions added to quiz
- Questions appear in quiz's question list
- Total marks updated

**API Test:**
```bash
# Add question to quiz
curl -X POST http://localhost:8000/api/teacher/quizzes/1/questions/add/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question_id": 1,
    "fixed": true
  }'
```

#### 7.2 Reorder Questions in Quiz
**Frontend:** Quiz Question Manager → Use up/down arrows

**Steps:**
1. Click up/down arrows to reorder questions
2. Order updates immediately

**Expected Result:**
- Questions reordered
- Order saved automatically

**API Test:**
```bash
# Reorder questions
curl -X PUT http://localhost:8000/api/teacher/quizzes/1/questions/reorder/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question_order": [2, 1, 3]
  }'
```

#### 7.3 Remove Question from Quiz
**Frontend:** Quiz Question Manager → Click "Remove" (trash icon)

**Steps:**
1. Click remove button
2. Confirm deletion

**Expected Result:**
- Question removed from quiz
- Still exists in question bank

**API Test:**
```bash
# Remove question from quiz
curl -X DELETE http://localhost:8000/api/teacher/quizzes/1/questions/1/remove/ \
  -H "Authorization: Token YOUR_TOKEN"
```

---

### Phase 8: Enrollment Management

#### 8.1 View Enrollments
**Frontend:** Course Management → Enrollment tab

**Steps:**
1. Navigate to course management
2. Click "Enrollment" tab

**Expected Result:**
- Three sections displayed:
  - Pending Requests
  - Enrolled Students (with progress and grade)
  - Rejected Students

**API Test:**
```bash
# Get enrollments
curl -X GET http://localhost:8000/api/teacher/courses/1/enrollments/ \
  -H "Authorization: Token YOUR_TOKEN"
```

#### 8.2 Approve Enrollment Request
**Frontend:** Enrollment tab → Click "Approve" on pending request

**Steps:**
1. Student requests enrollment (as student)
2. Teacher sees request in "Pending Requests"
3. Click "Approve"

**Expected Result:**
- Student moved to "Enrolled Students"
- Student can now access course

**API Test:**
```bash
# Approve enrollment
curl -X POST http://localhost:8000/api/teacher/courses/1/enrollments/5/approve/ \
  -H "Authorization: Token YOUR_TOKEN"
```

#### 8.3 Reject Enrollment Request
**Frontend:** Enrollment tab → Click "Reject" on pending request

**Expected Result:**
- Student moved to "Rejected" section
- Can be approved later if needed

**API Test:**
```bash
# Reject enrollment
curl -X POST http://localhost:8000/api/teacher/courses/1/enrollments/5/reject/ \
  -H "Authorization: Token YOUR_TOKEN"
```

#### 8.4 Remove Enrolled Student
**Frontend:** Enrollment tab → Click "Remove" on enrolled student

**Expected Result:**
- Student removed from course
- Student loses access to course

**API Test:**
```bash
# Remove enrollment
curl -X DELETE http://localhost:8000/api/teacher/courses/1/enrollments/5/remove/ \
  -H "Authorization: Token YOUR_TOKEN"
```

---

### Phase 9: Design Course (Reordering)

#### 9.1 Reorder Modules
**Frontend:** Course Management → Design Course tab

**Steps:**
1. Navigate to Design Course tab
2. Use up/down arrows to reorder modules
3. Click "Save Module Order"

**Expected Result:**
- Modules reordered
- Order saved
- Students see modules in new order

**API Test:**
```bash
# Reorder modules
curl -X PUT http://localhost:8000/api/teacher/courses/1/modules/reorder/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "module_orders": [
      {"module_id": 2, "order": 1},
      {"module_id": 1, "order": 2}
    ]
  }'
```

#### 9.2 Reorder Learning Units
**Frontend:** Design Course tab → Within each module

**Steps:**
1. Find module with learning units
2. Use up/down arrows to reorder units (lessons/quizzes)
3. Click "Save Unit Order" for that module

**Expected Result:**
- Units reordered within module
- Order saved
- Students see units in new order

**API Test:**
```bash
# Reorder units
curl -X PUT http://localhost:8000/api/teacher/modules/1/units/reorder/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "unit_orders": [
      {"unit_id": 2, "order": 1},
      {"unit_id": 1, "order": 2}
    ]
  }'
```

---

### Phase 10: Course Analytics

#### 10.1 View Course Analytics
**Frontend:** Course Management → Analytics tab

**Steps:**
1. Navigate to Analytics tab
2. View analytics data

**Expected Result:**
- Overview cards show:
  - Total Students
  - Completion Rate
  - Average Score
  - Active Students
- Module Statistics section shows completion rates
- Quiz Performance table shows quiz stats
- Top Students list shows top performers
- Question Statistics table shows question performance

**API Test:**
```bash
# Get analytics
curl -X GET http://localhost:8000/api/teacher/courses/1/analytics/ \
  -H "Authorization: Token YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "course_id": 1,
  "course_name": "Python Basics",
  "total_students": 10,
  "completion_rate": 75.5,
  "average_score": 82.3,
  "module_stats": [...],
  "quiz_stats": [...],
  "top_students": [...],
  "question_statistics": [...]
}
```

---

## Testing Flow: Student Features (Quick Reference)

### 1. Student Dashboard
- **URL:** `/dashboard`
- **Test:** View stats, enrolled courses, recent activities

### 2. Course Catalog
- **URL:** `/courses`
- **Test:** Browse courses, filter, enroll in courses

### 3. Course Modules
- **URL:** `/courses/{courseId}/modules`
- **Test:** View modules and learning units

### 4. Lesson View
- **URL:** `/lessons/{lessonId}`
- **Test:** View lesson content, mark as complete

### 5. Quiz Taking
- **URL:** `/quizzes/{quizId}`
- **Test:** Start quiz, answer questions, submit

### 6. Insights
- **URL:** `/insights`
- **Test:** View badges and progress

---

## Common Issues & Troubleshooting

### Issue: API Returns 403 Forbidden
**Solution:**
- Check if user has moderator permissions
- Verify authentication token is valid
- Ensure user owns the resource (course/quiz/question)

### Issue: Questions Not Appearing in Quiz
**Solution:**
- Verify question is created and active
- Check if question is added to quiz's question paper
- Ensure question paper exists for quiz

### Issue: Enrollment Not Working
**Solution:**
- Check course enrollment method (default/open)
- Verify enrollment dates are valid
- Check if student is already enrolled/rejected

### Issue: Analytics Not Showing Data
**Solution:**
- Ensure students are enrolled
- Verify students have completed quizzes/lessons
- Check if course status records exist

### Issue: Reordering Not Saving
**Solution:**
- Check browser console for errors
- Verify API request is successful
- Ensure module/unit IDs are correct

---

## API Endpoints Summary

### Teacher APIs

#### Courses
- `GET /api/teacher/dashboard/` - Teacher dashboard
- `GET /api/teacher/courses/` - List courses
- `POST /api/teacher/courses/` - Create course
- `GET /api/teacher/courses/{id}/` - Get course
- `PUT /api/teacher/courses/{id}/` - Update course
- `DELETE /api/teacher/courses/{id}/` - Delete course

#### Modules
- `GET /api/teacher/courses/{courseId}/modules/` - List modules
- `POST /api/teacher/courses/{courseId}/modules/` - Create module
- `GET /api/teacher/courses/{courseId}/modules/{moduleId}/` - Get module
- `PUT /api/teacher/courses/{courseId}/modules/{moduleId}/` - Update module
- `DELETE /api/teacher/courses/{courseId}/modules/{moduleId}/` - Delete module

#### Lessons
- `GET /api/teacher/modules/{moduleId}/lessons/` - List lessons
- `POST /api/teacher/modules/{moduleId}/lessons/` - Create lesson
- `GET /api/teacher/modules/{moduleId}/lessons/{lessonId}/` - Get lesson
- `PUT /api/teacher/modules/{moduleId}/lessons/{lessonId}/` - Update lesson
- `DELETE /api/teacher/modules/{moduleId}/lessons/{lessonId}/` - Delete lesson

#### Quizzes
- `GET /api/teacher/modules/{moduleId}/quizzes/` - List quizzes
- `POST /api/teacher/modules/{moduleId}/quizzes/` - Create quiz
- `GET /api/teacher/modules/{moduleId}/quizzes/{quizId}/` - Get quiz
- `PUT /api/teacher/modules/{moduleId}/quizzes/{quizId}/` - Update quiz
- `DELETE /api/teacher/modules/{moduleId}/quizzes/{quizId}/` - Delete quiz

#### Questions
- `GET /api/teacher/questions/` - List questions
- `POST /api/teacher/questions/create/` - Create question
- `GET /api/teacher/questions/{id}/` - Get question
- `PUT /api/teacher/questions/{id}/update/` - Update question
- `DELETE /api/teacher/questions/{id}/delete/` - Delete question

#### Quiz Questions
- `GET /api/teacher/quizzes/{quizId}/questions/` - Get quiz questions
- `POST /api/teacher/quizzes/{quizId}/questions/add/` - Add question to quiz
- `DELETE /api/teacher/quizzes/{quizId}/questions/{questionId}/remove/` - Remove question
- `PUT /api/teacher/quizzes/{quizId}/questions/reorder/` - Reorder questions

#### Enrollment
- `GET /api/teacher/courses/{courseId}/enrollments/` - Get enrollments
- `POST /api/teacher/courses/{courseId}/enrollments/{userId}/approve/` - Approve
- `POST /api/teacher/courses/{courseId}/enrollments/{userId}/reject/` - Reject
- `DELETE /api/teacher/courses/{courseId}/enrollments/{userId}/remove/` - Remove

#### Ordering
- `PUT /api/teacher/courses/{courseId}/modules/reorder/` - Reorder modules
- `PUT /api/teacher/modules/{moduleId}/units/reorder/` - Reorder units

#### Analytics
- `GET /api/teacher/courses/{courseId}/analytics/` - Get analytics

---

## Test Data Setup

### Create Test Course Structure
1. Create course: "Python Basics"
2. Create module: "Introduction"
3. Create lesson: "Python Variables"
4. Create quiz: "Basics Quiz"
5. Create questions:
   - MCQ: "What is Python?"
   - Code: "Print Hello World"
6. Add questions to quiz
7. Enroll test student

### Expected Test Results
- Course visible in teacher dashboard
- Module appears in course
- Lesson and quiz appear as learning units
- Questions can be added to quiz
- Student can enroll and view course
- Analytics show data after student activity

---

## Next Steps After Testing

1. **Report Issues:** Document any bugs or unexpected behavior
2. **Performance Testing:** Test with multiple courses/modules/questions
3. **Edge Cases:** Test with empty data, invalid inputs, etc.
4. **Integration Testing:** Test complete workflows end-to-end
5. **User Acceptance:** Get feedback from actual users

---

## Notes

- All APIs require authentication (Token authentication)
- Teacher must have moderator permissions
- Some features require existing data (e.g., analytics needs student activity)
- Frontend and backend must be running simultaneously for full testing
- Use browser DevTools Network tab to inspect API calls
- Check browser console for frontend errors
- Check Django server logs for backend errors

