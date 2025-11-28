import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaLinkedin, FaGithub, FaUpload, FaPlus, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGraduationCap } from 'react-icons/fa';
import Logo from '../../components/ui/Logo';
import { useUserStore } from '../../store/userStore';
import { useAuthStore } from '../../store/authStore';

const Profile = () => {
  const { user, isAuthenticated } = useAuthStore();
  const {
    user: profileUser,
    fetchUserProfile,
    updateUserProfile,
    updateLocalUser,
    isLoading,
    error,
    clearError
  } = useUserStore();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    bio: '',
    email: '',
    phone: '',
    city: '',
    country: 'India',
    linkedin: '',
    github: '',
    rollNumber: '',
    institute: '',
    department: '',
    position: '',
    timezone: 'Asia/Kolkata'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editMessage, setEditMessage] = useState('');

  // Initialize user profile data
  useEffect(() => {
    if (user) {
      // Initialize form with user data
      setFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        displayName: user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : '',
        bio: profileUser?.bio || '',
        email: user.email || '',
        phone: profileUser?.phone || '',
        city: profileUser?.city || 'Dehradun',
        country: profileUser?.country || 'India',
        linkedin: profileUser?.linkedin || '',
        github: profileUser?.github || '',
        rollNumber: user.roll_number || '',
        institute: user.institute || '',
        department: user.department || '',
        position: user.position || '',
        timezone: user.timezone || 'Asia/Kolkata'
      });
    }
  }, [user, profileUser]);

  // Fetch user profile if not loaded
  useEffect(() => {
    if (user && !profileUser && user.username) {
      fetchUserProfile(user.username);
    }
  }, [user, profileUser, fetchUserProfile]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Update local form state immediately for UI responsiveness
    updateLocalUser({ [field]: value });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!user) {
      return;
    }

    clearError();
    setIsEditing(true);
    setEditMessage('Saving...');

    try {
      const result = await updateUserProfile(user.username, formData);

      if (result.success) {
        setEditMessage('Profile updated successfully!');
        setTimeout(() => {
          setEditMessage('');
          setIsEditing(false);
        }, 2000);
      }
    } catch (error) {
      setEditMessage('Failed to update profile');
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    // Reset form to current user data
    if (user) {
      setFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        displayName: user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : '',
        email: user.email || '',
        phone: profileUser?.phone || '',
        city: profileUser?.city || 'Dehradun',
        country: profileUser?.country || 'India',
        linkedin: profileUser?.linkedin || '',
        github: profileUser?.github || '',
        rollNumber: user.roll_number || '',
        institute: user.institute || '',
        department: user.department || '',
        position: user.position || '',
        timezone: user.timezone || 'Asia/Kolkata'
      });
    }
    setIsEditing(false);
    setEditMessage('');
  };

  const handleResumeUpload = () => {
    // For now, just show an alert
    alert('Resume upload coming soon!');
  };

  const handleAvatarChange = () => {
    // For now, just show an alert
    alert('Avatar upload coming soon!');
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-gray-300 mb-4">Please log in to view your profile</div>
          <Link to="/signin" className="text-indigo-400 hover:text-indigo-300">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative grid-texture">
      {/* Main Content */}
      <main className="flex-1">
        <header className="px-8 flex justify-between py-4 border-b border-white/6">
          <div className="flex items-center gap-4">
            <Logo />
            <Link
              to="/dashboard"
              className="text-white hover:text-gray-300 transition text-sm"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </header>

        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-gray-400 text-sm mt-1">Manage your public profile, resume, and learning credentials</p>
          </div>

          {/* Edit Message */}
          {editMessage && (
            <div className={`mb-4 p-3 rounded-lg ${editMessage.includes('successfully')
                ? 'bg-green-500/20 border-green-500/50 text-green-200'
                : 'bg-red-500/20 border-red-500/50 text-red-200'
              }`}>
              <p className="text-sm">{editMessage}</p>
            </div>
          )}

          <div className="flex gap-8 flex-col lg:flex-row">
            {/* Left column: Profile card */}
            <aside className="lg:w-80 w-full">
              <div className="card p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    className="w-16 h-16 rounded-full border border-white/10 bg-gray-600"
                    src={`https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}&background=7b2ff7&color=fff&size=128`}
                    alt="Avatar"
                  />
                  <div>
                    <h2 className="text-lg font-semibold">
                      {formData.displayName || `${formData.firstName} ${formData.lastName}`}
                    </h2>
                    <div className="text-sm text-gray-400">@{user?.username}</div>
                    <div className="text-sm text-gray-400">
                      {formData.city ? `${formData.city}, ` : ''}
                      {formData.country}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="text-gray-400">Profile completeness</div>
                    <div className="font-medium">80%</div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div className="h-2 rounded-full bg-indigo-500" style={{ width: '80%' }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleResumeUpload}
                    className="w-full btn-primary text-white py-2 rounded-lg text-sm font-medium hover:brightness-110 transition disabled:opacity-50"
                    disabled={isLoading}
                  >
                    Upload Résumé
                  </button>
                  <button
                    onClick={handleAvatarChange}
                    className="w-full bg-white/[0.05] border border-white/10 py-2 rounded-lg text-sm hover:bg-white/10 transition"
                    disabled={isLoading}
                  >
                    Edit Avatar
                  </button>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <div className="text-xs text-gray-400">Quick actions</div>
                  <div className="mt-2 flex gap-2">
                    <button className="flex-1 bg-white/[0.05] border border-white/10 py-2 rounded-lg text-xs hover:bg-white/10 transition flex items-center justify-center gap-1">
                      <FaPlus className="w-3 h-3" />
                      Add Link
                    </button>
                    <button className="flex-1 bg-white/[0.05] border border-white/10 py-2 rounded-lg text-xs hover:bg-white/10 transition flex items-center justify-center gap-1">
                      <FaPlus className="w-3 h-3" />
                      Add Education
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            {/* Right column: editable cards */}
            <div className="flex-1 space-y-6">
              {/* Profile Information */}
              <section className="card p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold">Profile information</h3>
                  <div className="text-sm text-gray-400">
                    {isEditing ? 'Saving...' : 'Last updated: Nov 10, 2025'}
                  </div>
                </div>

                <form onSubmit={handleSave} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">First name</label>
                    <input
                      className="w-full py-1 px-1.5 bg-white/[0.05] border border-white/10 text-white"
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Last name</label>
                    <input
                      className="w-full py-1 px-1.5 bg-white/[0.05] border border-white/10 text-white"
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Display name</label>
                    <input
                      className="w-full py-1 px-1.5 bg-white/[0.05] border border-white/10 text-white"
                      value={formData.displayName}
                      onChange={(e) => handleChange('displayName', e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Bio</label>
                    <textarea
                      className="w-full py-1 px-1.5 bg-white/[0.05] border border-white/10 text-white"
                      rows="3"
                      value={formData.bio}
                      onChange={(e) => handleChange('bio', e.target.value)}
                    ></textarea>
                  </div>

                  <div className="md:col-span-2 flex gap-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-2 rounded-lg btn-primary text-white font-medium hover:brightness-110 disabled:opacity-50"
                    >
                      {isLoading ? 'Saving...' : 'Save changes'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-2 rounded-lg bg-white/[0.05] border border-white/10 text-sm hover:bg-white/10"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <div className="ml-auto text-xs text-gray-400 self-center">Auto-save off</div>
                  </div>
                </form>
              </section>

              {/* Contact & Location */}
              <section className="card p-6 grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-4 text-white">Contact</h4>
                  <label className="block text-xs text-gray-400 mb-1">Email</label>
                  <input
                    className="w-full py-1 px-1.5 bg-white/[0.05] border border-white/10 text-white"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                  <label className="block text-xs text-gray-400 mb-1 mt-3">Phone</label>
                  <input
                    className="w-full py-1 px-1.5 bg-white/[0.05] border border-white/10 text-white"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </div>

                <div>
                  <h4 className="font-medium mb-4 text-white">Location</h4>
                  <label className="block text-xs text-gray-400 mb-1">City</label>
                  <input
                    className="w-full py-1 px-1.5 bg-white/[0.05] border border-white/10 text-white"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                  />
                  <label className="block text-xs text-gray-400 mb-1 mt-3">Country</label>
                  <select className="w-full py-1 px-1.5 bg-white/[0.05] border border-white/10 text-white" value={formData.country}>
                    <option>India</option>
                    <option>United States</option>
                    <option>United Kingdom</option>
                  </select>
                </div>
              </section>

              {/* Educational Information */}
              <section className="card p-6">
                <h4 className="font-medium mb-4 text-white">Educational Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Roll Number</label>
                    <input
                      className="w-full py-1 px-1.5 bg-white/[0.05] border border-white/10 text-white"
                      value={formData.rollNumber}
                      onChange={(e) => handleChange('rollNumber', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Institute</label>
                    <input
                      className="w-full py-1 px-1.5 bg-white/[0.05] border border-white/10 text-white"
                      value={formData.institute}
                      onChange={(e) => handleChange('institute', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Department</label>
                    <input
                      className="w-full py-1 px-1.5 bg-white/[0.05] border border-white/10 text-white"
                      value={formData.department}
                      onChange={(e) => handleChange('department', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Position</label>
                    <input
                      className="w-full py-1 px-1.5 bg-white/[0.05] border border-white/10 text-white"
                      value={formData.position}
                      onChange={(e) => handleChange('position', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Timezone</label>
                    <select className="w-full py-1 px-1.5 bg-white/[0.05] border border-white/10 text-white" value={formData.timezone}>
                      <option>Asia/Kolkata</option>
                      <option>Asia/Dubai</option>
                      <option>Europe/London</option>
                      <option>America/New_York</option>
                      <option>UTC</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Social Links */}
              <section className="card p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-white">Social links</h4>
                  <button className="text-sm text-indigo-400 hover:text-indigo-300">Add link</button>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center text-blue-400 text-xs font-bold">
                      <FaLinkedin className="w-5 h-5" />
                    </div>
                    <input
                      className="flex-1 py-1 px-1.5 bg-white/[0.05] border border-white/10 text-white"
                      placeholder="https://www.linkedin.com/in/..."
                      value={formData.linkedin}
                      onChange={(e) => handleChange('linkedin', e.target.value)}
                    />
                    <button className="text-sm text-indigo-400 hover:text-indigo-300">Save</button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center text-white text-xs font-bold">
                      <FaGithub className="w-5 h-5" />
                    </div>
                    <input
                      className="flex-1 py-1 px-1.5 bg-white/[0.05] border border-white/10 text-white"
                      placeholder="https://github.com/..."
                      value={formData.github}
                      onChange={(e) => handleChange('github', e.target.value)}
                    />
                    <button className="text-sm text-indigo-400 hover:text-indigo-300">Save</button>
                  </div>
                </div>
              </section>

              {/* Skills */}
              <section className="card p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-white">Skills</h4>
                  <div className="text-sm text-gray-400">Proficiency shown on hover</div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {['Data Structure', 'Algorithm', 'SQL', 'React', 'Python (Intermediate)', 'JavaScript', 'Node.js'].map((skill) => (
                    <span key={skill} className="text-sm px-3 py-1.5 bg-white/[0.05] border border-white/10 rounded-xl text-gray-300">
                      {skill}
                    </span>
                  ))}
                  <div className="w-full mt-3">
                    <input
                      className="w-full py-1 px-1.5 bg-white/[0.05] border border-white/10 text-white"
                      placeholder="Add a skill and press Enter"
                    />
                  </div>
                </div>
              </section>

              {/* Badges & Certifications */}
              <section className="card p-6 grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-4 text-white">Badges</h4>
                  <div className="flex gap-3 flex-wrap">
                    {['Problem Solving', 'Java', 'SQL'].map((badge) => (
                      <div key={badge} className="px-3 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg text-sm text-amber-300">
                        {badge}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-4 text-white">Certifications</h4>
                  <div className="text-sm text-gray-400 mb-4">You have not added any certifications yet.</div>
                  <button className="px-6 py-2 rounded-lg btn-primary text-white hover:brightness-110">
                    Add certification
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
