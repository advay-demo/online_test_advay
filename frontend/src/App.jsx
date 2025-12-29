import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Signin from './pages/Signin';
import DashboardHome from './pages/DashboardHome';
import CourseCatalog from './pages/student/CourseCatalog';
import CourseModule from './pages/student/CourseModule';
import Quiz from './pages/student/Quiz';
import Lesson from './pages/student/Lesson';
import Insights from './pages/student/Insights';
import Profile from './pages/student/Profile';
import Submission from './pages/student/Submission';
import DashboardTeachers from './pages/teacher/DashboardTeachers';
import AddCourse from './pages/teacher/AddCourse';
import Courses from './pages/teacher/Courses';
import ManageCourse from './pages/teacher/ManageCourse';
import TeacherQuizzes from './pages/teacher/TeacherQuizzes';
import Questions from './pages/teacher/Questions';
import AddQuestion from './pages/teacher/AddQuestion';
import PrivateRoute from './components/auth/PrivateRoute';
import GradingSystems from './pages/teacher/GradingSystems';

import ThemeController from './components/layout/ThemeController';

function App() {
  return (
    <Router>
      <ThemeController />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<div className="p-8">Settings Page - Coming Soon</div>} />

          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/courses" element={<CourseCatalog />} />
          <Route path="/courses/:courseId/modules" element={<CourseModule />} />
          <Route path="/courses/:courseId/modules/:moduleId" element={<CourseModule />} />
          <Route path="/lessons/:lessonId" element={<Lesson />} />
          <Route path="/courses/:courseId/quizzes/:quizId" element={<Quiz />} />
          <Route path="/quizzes/:quizId" element={<Quiz />} />
          <Route path="/answerpapers/:answerpaperId/submission" element={<Submission />} />
          <Route path="/insights" element={<Insights />} />

          {/* Legacy routes for backward compatibility */}
          <Route path="/module" element={<CourseModule />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/lesson" element={<Lesson />} />
          <Route path="/submission" element={<Submission />} />
        </Route>

        {/* Teacher Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/teacher/dashboard" element={<DashboardTeachers />} />
          <Route path="/teacher/add-course" element={<AddCourse />} />
          <Route path="/teacher/grading-systems" element={<GradingSystems />} />
          <Route path="/teacher/courses" element={<Courses />} />
          <Route path="/teacher/quizzes" element={<TeacherQuizzes />} />
          <Route path="/teacher/courses/:courseId/manage" element={<ManageCourse />} />


          <Route path="/teacher/courses/:courseId/edit" element={<AddCourse />} />
          
          
          <Route path="/teacher/questions" element={<Questions />} />
          <Route path="/teacher/questions/create" element={<AddQuestion />} />
          <Route path="/teacher/questions/:questionId/edit" element={<AddQuestion />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
