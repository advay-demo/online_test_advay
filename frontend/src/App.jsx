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
import PrivateRoute from './components/auth/PrivateRoute';

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
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/courses" element={<CourseCatalog />} />
          <Route path="/module" element={<CourseModule />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/lesson" element={<Lesson />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/submission" element={<Submission />} />
        </Route>

        {/* Teacher Routes */}
        <Route path="/teacher/dashboard" element={<DashboardTeachers />} />
        <Route path="/teacher/add-course" element={<AddCourse />} />
        <Route path="/teacher/courses" element={<Courses />} />
        <Route path="/teacher/manage-course" element={<ManageCourse />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
