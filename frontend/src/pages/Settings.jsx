import React from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import ChangePassword from '../components/auth/ChangePassword';
import { useAuthStore } from '../store/authStore';
import { FaUserCircle, FaEnvelope, FaIdBadge } from 'react-icons/fa';

const Settings = () => {
    const user = useAuthStore((state) => state.user);

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] transition-colors duration-200">
            <Header isAuth={true} />
            <div className="flex">
                <Sidebar activePage="settings" />

                <main className="flex-1 p-4 sm:p-6 lg:p-8 ml-0 md:ml-64 transition-all duration-300">
                    <div className="max-w-4xl mx-auto space-y-8">

                        {/* Page Header */}
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Account Settings</h1>
                            <p className="text-[var(--text-secondary)] mt-2">Manage your account profile and security preferences.</p>
                        </div>

                        {/* Profile Section */}
                        <div className="bg-[var(--bg-secondary)] rounded-2xl p-6 border border-[var(--border-subtle)] shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                    <FaUserCircle className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-semibold text-[var(--text-primary)]">Profile Information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Full Name</label>
                                    <div className="flex items-center gap-3 px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)]">
                                        <FaIdBadge className="text-[var(--text-tertiary)]" />
                                        <span>{user?.first_name} {user?.last_name}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Email Address</label>
                                    <div className="flex items-center gap-3 px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] opacity-75 cursor-not-allowed">
                                        <FaEnvelope className="text-[var(--text-tertiary)]" />
                                        <span>{user?.email}</span>
                                    </div>
                                    <p className="text-xs text-[var(--text-secondary)] mt-1 ml-1">Email cannot be changed directly.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">User Role</label>
                                    <div className="flex items-center gap-3 px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] opacity-75 cursor-not-allowed">
                                        <div className={`w-2 h-2 rounded-full ${user?.is_moderator ? 'bg-indigo-500' : 'bg-emerald-500'}`}></div>
                                        <span>{user?.is_moderator ? 'Teacher / Moderator' : 'Student'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Section */}
                        <ChangePassword />

                    </div>
                </main>
            </div>
        </div>
    );
};

export default Settings;
