# Remaining Teacher Features - Detailed Implementation Plan

## Overview

This document outlines the detailed plan for implementing the remaining teacher features that are currently static in the frontend. All features will be migrated to dynamic React components connected to RESTful Django APIs.

## Current Status

### ✅ Completed Features:
- Question Management (CRUD + UI)
- Enrollment Management (APIs + UI)
- Unit Ordering APIs (backend ready)

### ❌ Remaining Features:
1. Design Course UI (Module/Unit Reordering)
2. Course Analytics (APIs + UI)
3. Grading System Management
4. Appearance Tab
5. Privacy Tab
6. Demo Course Creation
7. Top Students Widget
8. Quiz Question Management UI

---

## Phase 1: Design Course UI (HIGH PRIORITY)

### 1.1 Module Reordering UI

**Location:** `ManageCourse.jsx` - "Design Course" tab

**Features:**
- Display modules in current order
- Up/Down buttons or drag-and-drop to reorder modules
- Visual feedback during reordering
- Save order button

**Implementation Steps:**

1. **Backend API** (Already exists: `teacher_reorder_course_modules`)
   - Endpoint: `PUT /api/teacher/courses/{courseId}/modules/reorder/`
   - Request: `{ "module_orders": [{"module_id": 1, "order": 1}, ...] }`

2. **Frontend Component:**
   - Add state for module order in `ManageCourse.jsx`
   - Create `ModuleOrdering` component or integrate into Design Course tab
   - Display modules with up/down arrows
   - Handle reordering logic
   - Call `reorderCourseModules` API on save

**Files to Modify:**
- `frontend/src/pages/teacher/ManageCourse.jsx` - Design Course tab implementation
- `frontend/src/api/api.js` - Already has `reorderCourseModules` function

**UI Design:**
```
Design Course Tab:
├── Module Ordering Section
│   ├── Module 1 [↑] [↓]
│   ├── Module 2 [↑] [↓]
│   └── Module 3 [↑] [↓]
└── [Save Order] button
```

### 1.2 Unit Reordering UI

**Location:** `ManageCourse.jsx` - "Design Course" tab (within each module)

**Features:**
- Display learning units (lessons/quizzes) within each module
- Up/Down buttons to reorder units
- Visual feedback
- Save order per module

**Implementation Steps:**

1. **Backend API** (Already exists: `teacher_reorder_module_units`)
   - Endpoint: `PUT /api/teacher/modules/{moduleId}/units/reorder/`
   - Request: `{ "unit_orders": [{"unit_id": 1, "order": 1}, ...] }`

2. **Frontend Component:**
   - Add state for unit orders per module
   - Display units with up/down arrows within module cards
   - Handle reordering logic
   - Call `reorderModuleUnits` API on save

**Files to Modify:**
- `frontend/src/pages/teacher/ManageCourse.jsx` - Design Course tab, unit ordering within modules
- `frontend/src/api/api.js` - Already has `reorderModuleUnits` function

**UI Design:**
```
Design Course Tab:
├── Module 1
│   ├── Lesson 1 [↑] [↓]
│   ├── Quiz 1 [↑] [↓]
│   └── Lesson 2 [↑] [↓]
├── Module 2
│   └── ...
└── [Save All Orders] button
```

---

## Phase 2: Course Analytics (HIGH PRIORITY)

### 2.1 Course Analytics API

**Endpoint:** `GET /api/teacher/courses/{courseId}/analytics/`

**Data to Return:**
```json
{
  "course_id": 1,
  "course_name": "Python Basics",
  "total_students": 50,
  "enrolled_students": 45,
  "completion_rate": 72.5,
  "average_score": 78.3,
  "module_stats": [
    {
      "module_id": 1,
      "module_name": "Module 1",
      "completion_rate": 85.0,
      "students_completed": 38,
      "average_time_spent": 120  // minutes
    }
  ],
  "quiz_stats": [
    {
      "quiz_id": 1,
      "quiz_name": "Quiz 1",
      "total_attempts": 120,
      "average_score": 75.5,
      "pass_rate": 80.0,
      "total_questions": 10,
      "average_time": 25  // minutes
    }
  ],
  "top_students": [
    {
      "user_id": 5,
      "username": "student1",
      "first_name": "John",
      "last_name": "Doe",
      "score": 95.5,
      "grade": "A",
      "completion": 100
    }
  ],
  "question_statistics": [
    {
      "question_id": 10,
      "summary": "Question 1",
      "average_score": 85.0,
      "attempts": 120,
      "correct_attempts": 102
    }
  ],
  "enrollment_trends": [
    {"date": "2025-01-01", "enrolled": 5},
    {"date": "2025-01-02", "enrolled": 8}
  ]
}
```

**Backend Implementation:**
- Query `CourseStatus` for student progress
- Query `AnswerPaper` for quiz statistics
- Calculate completion rates per module
- Aggregate quiz attempt data
- Calculate top performers based on scores
- Return aggregated statistics

**Files to Create/Modify:**
- `api/views.py` - Add `teacher_get_course_analytics` view
- `api/urls.py` - Add route
- `api/serializers.py` - Add analytics serializer (optional)

### 2.2 Analytics UI in ManageCourse

**Location:** New "Analytics" tab in `ManageCourse.jsx`

**Features:**
- Overview cards (total students, completion rate, avg score)
- Module completion chart
- Quiz performance chart
- Top students list
- Question statistics table

**Implementation Steps:**

1. Create analytics tab component
2. Fetch analytics data on tab switch
3. Display charts using a charting library (e.g., recharts, chart.js)
4. Show statistics in cards and tables

**Files to Create/Modify:**
- `frontend/src/pages/teacher/ManageCourse.jsx` - Add Analytics tab
- `frontend/src/components/teacher/CourseAnalytics.jsx` - New component
- `frontend/src/api/api.js` - Add `getCourseAnalytics` function

**UI Design:**
```
Analytics Tab:
├── Overview Cards (4 cards)
│   ├── Total Students: 45
│   ├── Completion Rate: 72.5%
│   ├── Average Score: 78.3%
│   └── Active Students: 38
├── Module Completion Chart (Bar chart)
├── Quiz Performance Chart (Line chart)
├── Top Students List (Table)
└── Question Statistics (Table)
```

### 2.3 Dashboard Analytics Widget

**Location:** `DashboardTeachers.jsx`

**Features:**
- Enhanced dashboard with course-specific analytics
- Quick stats per course
- Link to detailed analytics

**Files to Modify:**
- `frontend/src/pages/teacher/DashboardTeachers.jsx` - Add analytics widgets

---

## Phase 3: Quiz Question Management UI (HIGH PRIORITY)

### 3.1 Quiz Question Manager Component

**Location:** `ManageCourse.jsx` - When editing a quiz, add "Manage Questions" button

**Features:**
- View all questions in quiz
- Add existing questions from question bank
- Create new questions inline (opens AddQuestion page)
- Remove questions from quiz
- Reorder questions
- Preview questions

**Implementation Steps:**

1. **Create Component:**
   - `frontend/src/components/teacher/QuizQuestionManager.jsx`
   - Modal or separate page for managing quiz questions

2. **Features:**
   - Fetch quiz questions using `getQuizQuestions` API
   - Display question list with preview
   - Question selector/search to add existing questions
   - Drag-and-drop or up/down buttons for reordering
   - Remove button for each question
   - Save button to update quiz

3. **Integration:**
   - Add "Manage Questions" button in quiz edit form
   - Open modal/page when clicked
   - Refresh quiz data after changes

**Files to Create/Modify:**
- `frontend/src/components/teacher/QuizQuestionManager.jsx` - New component
- `frontend/src/pages/teacher/ManageCourse.jsx` - Add manage questions button
- `frontend/src/api/api.js` - Already has quiz question APIs

**UI Design:**
```
Quiz Question Manager Modal:
├── Current Questions (Ordered list)
│   ├── Question 1 [Preview] [↑] [↓] [Remove]
│   ├── Question 2 [Preview] [↑] [↓] [Remove]
│   └── ...
├── Add Questions Section
│   ├── Search/Filter questions
│   ├── Question Bank List
│   └── [Add Selected] button
└── [Save Changes] [Cancel] buttons
```

---

## Phase 4: Grading System Management (MEDIUM PRIORITY)

### 4.1 Grading System APIs

**Endpoints Needed:**
- `GET /api/teacher/grading-systems/` - List all grading systems
- `POST /api/teacher/grading-systems/` - Create grading system
- `GET /api/teacher/grading-systems/{id}/` - Get grading system details
- `PUT /api/teacher/grading-systems/{id}/` - Update grading system
- `DELETE /api/teacher/grading-systems/{id}/` - Delete grading system

**Grading System Structure:**
```json
{
  "id": 1,
  "name": "Standard Grading",
  "description": "Standard A-F grading system",
  "grade_ranges": [
    {"min": 90, "max": 100, "grade": "A"},
    {"min": 80, "max": 89, "grade": "B"},
    {"min": 70, "max": 79, "grade": "C"},
    {"min": 60, "max": 69, "grade": "D"},
    {"min": 0, "max": 59, "grade": "F"}
  ],
  "creator": 1,
  "created_at": "2025-01-01T00:00:00Z"
}
```

**Backend Implementation:**
- Work with `GradingSystem` model from `grades` app
- Verify ownership (creator=user)
- Handle grade ranges validation
- Support default grading system

**Files to Create/Modify:**
- `api/views.py` - Add grading system CRUD views
- `api/urls.py` - Add routes
- `api/serializers.py` - Add `GradingSystemSerializer`

### 4.2 Grading System UI Pages

**Pages Needed:**
1. **Grading Systems List Page** (`GradingSystems.jsx`)
   - List all grading systems created by teacher
   - Create new button
   - Edit/Delete actions

2. **Add/Edit Grading System Page** (`AddGradingSystem.jsx`)
   - Form for name and description
   - Dynamic grade range builder
   - Add/remove grade ranges
   - Validation (no overlaps, covers 0-100)

**Files to Create:**
- `frontend/src/pages/teacher/GradingSystems.jsx`
- `frontend/src/pages/teacher/AddGradingSystem.jsx`
- `frontend/src/components/teacher/GradingSystemForm.jsx` - Reusable form component

**Files to Modify:**
- `frontend/src/App.jsx` - Add routes
- `frontend/src/api/api.js` - Add grading system API functions
- `frontend/src/pages/teacher/Courses.jsx` - Add link to "Create Grading System"
- `frontend/src/pages/teacher/AddCourse.jsx` - Connect grading system dropdown to API

**UI Design:**
```
Grading Systems Page:
├── Header: "Grading Systems" [Create New]
├── Grading System Cards
│   ├── Standard Grading [Edit] [Delete]
│   └── Custom Grading [Edit] [Delete]
└── Empty state if none

Add/Edit Grading System:
├── Name: [input]
├── Description: [textarea]
├── Grade Ranges:
│   ├── A: 90-100 [Remove]
│   ├── B: 80-89 [Remove]
│   └── [Add Grade Range] button
└── [Save] [Cancel] buttons
```

---

## Phase 5: Advanced Course Settings (MEDIUM PRIORITY)

### 5.1 Appearance Tab

**Location:** `ManageCourse.jsx` - "Appearance" tab

**Features:**
- Course thumbnail/image upload
- Course color scheme picker
- Custom CSS (optional, advanced)
- Course description formatting preview

**APIs Needed:**
- `PUT /api/teacher/courses/{courseId}/appearance/`
- Image upload endpoint (can reuse existing file upload)

**Request Body:**
```json
{
  "thumbnail": "file_upload",
  "primary_color": "#3B82F6",
  "secondary_color": "#10B981",
  "custom_css": "optional css"
}
```

**Backend Implementation:**
- Add fields to Course model or use JSONField for appearance settings
- Handle image upload
- Store color preferences

**Files to Create/Modify:**
- `api/views.py` - Add `teacher_update_course_appearance` view
- `api/urls.py` - Add route
- `frontend/src/pages/teacher/ManageCourse.jsx` - Add Appearance tab
- `frontend/src/api/api.js` - Add `updateCourseAppearance` function

**UI Design:**
```
Appearance Tab:
├── Course Thumbnail
│   ├── [Upload Image] button
│   └── Preview
├── Color Scheme
│   ├── Primary Color: [Color Picker]
│   └── Secondary Color: [Color Picker]
├── Custom CSS (Advanced)
│   └── [Textarea for CSS]
└── [Save Changes] button
```

### 5.2 Privacy Tab

**Location:** `ManageCourse.jsx` - "Privacy" tab

**Features:**
- Course visibility settings (Public/Private)
- Enrollment method (already in course creation, show here)
- Access restrictions
- Student data privacy settings

**APIs Needed:**
- `PUT /api/teacher/courses/{courseId}/privacy/`

**Request Body:**
```json
{
  "hidden": false,
  "enrollment": "default",
  "allow_anonymous": false,
  "show_student_names": true,
  "public_course": false
}
```

**Backend Implementation:**
- Update Course model fields
- Validate privacy settings

**Files to Create/Modify:**
- `api/views.py` - Add `teacher_update_course_privacy` view
- `api/urls.py` - Add route
- `frontend/src/pages/teacher/ManageCourse.jsx` - Add Privacy tab
- `frontend/src/api/api.js` - Add `updateCoursePrivacy` function

**UI Design:**
```
Privacy Tab:
├── Course Visibility
│   ├── [ ] Public Course
│   └── [ ] Private Course
├── Enrollment Settings
│   ├── Enrollment Method: [Dropdown]
│   └── Enrollment Dates: [Date Pickers]
├── Access Restrictions
│   ├── [ ] Allow Anonymous Access
│   └── [ ] Require Login
├── Student Data Privacy
│   ├── [ ] Show Student Names
│   └── [ ] Show Student Progress
└── [Save Changes] button
```

---

## Phase 6: Demo Course Creation (LOW PRIORITY)

### 6.1 Demo Course API

**Endpoint:** `POST /api/teacher/courses/create-demo/`

**Features:**
- Create a demo course with sample content
- Include sample modules, lessons, and quizzes
- Use existing `Course.create_demo()` method if available

**Backend Implementation:**
- Check if `create_demo()` method exists in Course model
- If not, create demo course with sample data
- Return created course data

**Files to Create/Modify:**
- `api/views.py` - Add `teacher_create_demo_course` view
- `api/urls.py` - Add route
- `frontend/src/api/api.js` - Add `createDemoCourse` function

### 6.2 Demo Course Button

**Location:** `DashboardTeachers.jsx` - "Create Demo Course" button

**Features:**
- Button in dashboard header
- On click, call API
- Show loading state
- Redirect to course management page on success

**Files to Modify:**
- `frontend/src/pages/teacher/DashboardTeachers.jsx` - Connect button to API

---

## Phase 7: Top Students Widget (LOW PRIORITY)

### 7.1 Top Students API Enhancement

**Enhancement:** Update `teacher_dashboard` API to include top students

**Data to Return:**
```json
{
  "top_students": [
    {
      "user_id": 5,
      "username": "student1",
      "first_name": "John",
      "last_name": "Doe",
      "avatar_url": "url",
      "total_score": 980,
      "courses_completed": 5,
      "badges_count": 3
    }
  ]
}
```

**Backend Implementation:**
- Calculate top students based on:
  - Total quiz scores across all courses
  - Courses completed
  - Badges earned
- Return top 5 students

**Files to Modify:**
- `api/views.py` - Enhance `teacher_dashboard` view

### 7.2 Top Students Widget UI

**Location:** `DashboardTeachers.jsx` - Top Students section

**Features:**
- Display top 5 students
- Show avatar, name, score
- Link to student profile (if exists)

**Files to Modify:**
- `frontend/src/pages/teacher/DashboardTeachers.jsx` - Connect Top Students section to API data

---

## Implementation Priority Order

### Priority 1 (Critical - Complete Core Features):
1. ✅ Design Course UI (Module/Unit Reordering)
2. ✅ Quiz Question Management UI
3. ✅ Course Analytics APIs and UI

### Priority 2 (Important - Enhance Functionality):
4. ✅ Grading System Management
5. ✅ Appearance Tab
6. ✅ Privacy Tab

### Priority 3 (Nice to Have):
7. ✅ Demo Course Creation
8. ✅ Top Students Widget Enhancement

---

## Detailed API Specifications

### Course Analytics API

**GET** `/api/teacher/courses/{courseId}/analytics/`

**Response:**
```json
{
  "course_id": 1,
  "course_name": "Python Basics",
  "total_students": 50,
  "enrolled_students": 45,
  "completion_rate": 72.5,
  "average_score": 78.3,
  "module_stats": [...],
  "quiz_stats": [...],
  "top_students": [...],
  "question_statistics": [...],
  "enrollment_trends": [...]
}
```

### Grading System APIs

**POST** `/api/teacher/grading-systems/`
```json
{
  "name": "Standard Grading",
  "description": "A-F grading system",
  "grade_ranges": [
    {"min": 90, "max": 100, "grade": "A"},
    {"min": 80, "max": 89, "grade": "B"}
  ]
}
```

### Appearance API

**PUT** `/api/teacher/courses/{courseId}/appearance/`
```json
{
  "thumbnail": "file",
  "primary_color": "#3B82F6",
  "secondary_color": "#10B981"
}
```

### Privacy API

**PUT** `/api/teacher/courses/{courseId}/privacy/`
```json
{
  "hidden": false,
  "enrollment": "default",
  "allow_anonymous": false
}
```

---

## Files Summary

### Backend Files to Create/Modify:
1. `api/views.py` - Add analytics, grading system, appearance, privacy, demo course APIs
2. `api/serializers.py` - Add GradingSystemSerializer, AnalyticsSerializer
3. `api/urls.py` - Add new routes

### Frontend Files to Create:
1. `frontend/src/components/teacher/QuizQuestionManager.jsx` - **NEW**
2. `frontend/src/components/teacher/CourseAnalytics.jsx` - **NEW**
3. `frontend/src/components/teacher/GradingSystemForm.jsx` - **NEW**
4. `frontend/src/pages/teacher/GradingSystems.jsx` - **NEW**
5. `frontend/src/pages/teacher/AddGradingSystem.jsx` - **NEW**

### Frontend Files to Modify:
1. `frontend/src/pages/teacher/ManageCourse.jsx` - Add Design Course, Analytics, Appearance, Privacy tabs
2. `frontend/src/pages/teacher/DashboardTeachers.jsx` - Add demo course button, top students widget
3. `frontend/src/pages/teacher/Courses.jsx` - Add link to grading systems
4. `frontend/src/pages/teacher/AddCourse.jsx` - Connect grading system dropdown
5. `frontend/src/api/api.js` - Add all new API functions
6. `frontend/src/App.jsx` - Add grading system routes

---

## Testing Strategy

### Design Course:
1. Reorder modules → Verify order saved
2. Reorder units within module → Verify order saved
3. Student views course → Verify correct order displayed

### Analytics:
1. Create course with students → Verify analytics calculated
2. Students complete quizzes → Verify statistics update
3. View analytics → Verify charts display correctly

### Quiz Question Management:
1. Add questions to quiz → Verify questions appear
2. Reorder questions → Verify order saved
3. Remove questions → Verify removed from quiz
4. Student takes quiz → Verify questions display correctly

### Grading Systems:
1. Create grading system → Verify saved
2. Assign to course → Verify course uses grading system
3. Student completes course → Verify grade calculated

---

## Estimated Time

- **Phase 1 (Design Course UI)**: 3-4 hours
- **Phase 2 (Analytics)**: 4-5 hours
- **Phase 3 (Quiz Question Management)**: 3-4 hours
- **Phase 4 (Grading Systems)**: 3-4 hours
- **Phase 5 (Appearance/Privacy)**: 2-3 hours
- **Phase 6 (Demo Course)**: 1-2 hours
- **Phase 7 (Top Students)**: 1-2 hours

**Total Estimated Time**: 17-24 hours

---

## Success Criteria

✅ Teachers can reorder modules and units visually
✅ Course analytics display accurate statistics
✅ Teachers can manage questions within quizzes
✅ Grading systems can be created and assigned
✅ Course appearance and privacy settings work
✅ Demo courses can be created with one click
✅ Top students widget shows real data

---

## Notes

- **Charting Library**: Consider using `recharts` or `chart.js` for analytics charts
- **Drag-and-Drop**: Consider using `react-beautiful-dnd` or `@dnd-kit/core` for reordering
- **Image Upload**: Reuse existing file upload infrastructure
- **Permissions**: All APIs must verify teacher/moderator permissions
- **Ownership**: Verify course/question/quiz ownership before operations
- **Validation**: Validate all inputs, especially grade ranges and privacy settings
- **Error Handling**: Comprehensive error handling and user feedback
- **UI/UX**: Ensure all forms are intuitive and provide good user experience

