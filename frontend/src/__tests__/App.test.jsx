import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock all the page components to avoid complex rendering and dependencies
vi.mock('../pages/Home', () => ({ default: () => <div data-testid="page-home">Home</div> }));
vi.mock('../pages/Signup', () => ({ default: () => <div data-testid="page-signup">Signup</div> }));
vi.mock('../pages/Signin', () => ({ default: () => <div data-testid="page-signin">Signin</div> }));
vi.mock('../pages/SocialAuthCallback', () => ({ default: () => <div data-testid="page-social-auth">SocialAuth</div> }));
vi.mock('../pages/ForgotPassword', () => ({ default: () => <div data-testid="page-forgot-password">ForgotPassword</div> }));
vi.mock('../pages/DashboardHome', () => ({ default: () => <div data-testid="page-dashboard-home">DashboardHome</div> }));
vi.mock('../pages/student/Courses', () => ({ default: () => <div data-testid="page-student-courses">CourseStudent</div> }));
vi.mock('../pages/Quiz', () => ({ default: () => <div data-testid="page-quiz">Quiz</div> }));
vi.mock('../pages/Submission', () => ({ default: () => <div data-testid="page-submission">Submission</div> }));
vi.mock('../pages/student/AddCourse', () => ({ default: () => <div data-testid="page-add-course">AddCourse</div> }));
vi.mock('../pages/student/ManageCourse', () => ({ default: () => <div data-testid="page-manage-course">ManageCourse</div> }));
vi.mock('../pages/student/Lesson', () => ({ default: () => <div data-testid="page-lesson">Lesson</div> }));
vi.mock('../pages/student/ViewAnswerPaper', () => ({ default: () => <div data-testid="page-view-answer-paper">ViewAnswerPaper</div> }));
vi.mock('../pages/student/Insights', () => ({ default: () => <div data-testid="page-insights">Insights</div> }));
vi.mock('../pages/Profile', () => ({ default: () => <div data-testid="page-profile">Profile</div> }));
vi.mock('../pages/teacher/DashboardTeachers', () => ({ default: () => <div data-testid="page-teacher-dashboard">DashboardTeachers</div> }));
vi.mock('../pages/teacher/AddCourse', () => ({ default: () => <div data-testid="page-teacher-add-course">TeacherAddCourse</div> }));
vi.mock('../pages/teacher/Courses', () => ({ default: () => <div data-testid="page-teacher-courses">TeacherCourses</div> }));
vi.mock('../pages/teacher/ManageCourse', () => ({ default: () => <div data-testid="page-teacher-manage-course">TeacherManageCourse</div> }));
vi.mock('../pages/teacher/TeacherQuizzes', () => ({ default: () => <div data-testid="page-teacher-quizzes">TeacherQuizzes</div> }));
vi.mock('../pages/teacher/Questions', () => ({ default: () => <div data-testid="page-teacher-questions">TeacherQuestions</div> }));
vi.mock('../pages/teacher/GradingSystems', () => ({ default: () => <div data-testid="page-teacher-grading-systems">TeacherGradingSystems</div> }));
vi.mock('../pages/teacher/UploadQuestion', () => ({ default: () => <div data-testid="page-teacher-upload-question">TeacherUploadQuestion</div> }));
vi.mock('../pages/teacher/TestQuestion', () => ({ default: () => <div data-testid="page-teacher-test-question">TeacherTestQuestion</div> }));
vi.mock('../pages/Settings', () => ({ default: () => <div data-testid="page-settings">Settings</div> }));
vi.mock('../pages/Notifications', () => ({ default: () => <div data-testid="page-notifications">Notifications</div> }));

// Mock components
vi.mock('../components/layout/ThemeController', () => ({ default: () => <div data-testid="theme-controller" /> }));
vi.mock('../components/auth/PrivateRoute', () => ({
  default: ({ children }) => {
    // Just render the Outlet (using react-router's Outlet)
    const { Outlet } = require('react-router-dom');
    return <Outlet />;
  }
}));
vi.mock('../components/auth/PublicRoute', () => ({
  default: ({ children }) => {
    const { Outlet } = require('react-router-dom');
    return <Outlet />;
  }
}));

describe('App Component', () => {
  it('renders without crashing and displays Home by default', () => {
    render(<App />);
    expect(screen.getByTestId('theme-controller')).toBeInTheDocument();
    // Default route "/" is Home
    expect(screen.getByTestId('page-home')).toBeInTheDocument();
  });
});
