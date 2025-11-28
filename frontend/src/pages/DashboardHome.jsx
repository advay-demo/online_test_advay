import React from 'react';
import { useAuthStore } from '../store/authStore';
import Dashboard from './student/Dashboard';
import DashboardTeachers from './teacher/DashboardTeachers';

const DashboardHome = () => {
    const { user } = useAuthStore();

    // If user is a moderator (teacher), show Teacher Dashboard
    if (user?.is_moderator) {
        return <DashboardTeachers />;
    }

    // Otherwise, show Student Dashboard
    return <Dashboard />;
};

export default DashboardHome;
