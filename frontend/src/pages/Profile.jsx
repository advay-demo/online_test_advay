import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaLinkedin, 
  FaGithub, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaGraduationCap,
  FaCamera,
  FaGlobe,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaSave,
  FaTimes,
  FaEdit,
  FaPlus,
  FaTrash
} from 'react-icons/fa';
import Header from '../components/layout/Header';
import StudentSidebar from '../components/layout/Sidebar';
import TeacherSidebar from '../components/layout/TeacherSidebar';
import { useAuthStore } from '../store/authStore';
import { getUserProfile, patchUserProfile } from '../api/api';

const Profile = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    display_name: '',
    bio: '',
    email: '',
    phone: '',
    city: '',
    country: 'India',
    linkedin: '',
    github: '',
    roll_number: '',
    institute: '',
    department: '',
    position: '',
    timezone: 'Asia/Kolkata'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [newSkill, setNewSkill] = useState('');
  const [skills, setSkills] = useState(['Data Structures', 'Algorithms', 'SQL', 'React', 'Python', 'JavaScript']);
  const [loading, setLoading] = useState(true);

  // Determine if user is moderator/teacher
  const isTeacher = user?.is_moderator || false;

  // Fetch profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await getUserProfile();
        const userData = response.user;
        setProfileData(userData);
        
        // Populate form
        setFormData({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          display_name: userData.display_name || '',
          bio: userData.bio || '',
          email: userData.email || '',
          phone: userData.phone || '',
          city: userData.city || '',
          country: userData.country || 'India',
          linkedin: userData.linkedin || '',
          github: userData.github || '',
          roll_number: userData.roll_number || '',
          institute: userData.institute || '',
          department: userData.department || '',
          position: userData.position || '',
          timezone: userData.timezone || 'Asia/Kolkata'
        });
      } catch (error) {
        console.error('Failed to load profile:', error);
        showMessage('error', 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadProfile();
    }
  }, [isAuthenticated]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Only send changed fields
      const changedFields = {};
      Object.keys(formData).forEach(key => {
        if (formData[key] !== profileData?.[key]) {
          changedFields[key] = formData[key];
        }
      });

      if (Object.keys(changedFields).length === 0) {
        showMessage('info', 'No changes to save');
        setIsSaving(false);
        return;
      }

      const response = await patchUserProfile(changedFields);
      
      if (response.message) {
        setProfileData(response.user);
        showMessage('success', 'Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      showMessage('error', error.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original data
    if (profileData) {
      setFormData({
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        display_name: profileData.display_name || '',
        bio: profileData.bio || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        city: profileData.city || '',
        country: profileData.country || 'India',
        linkedin: profileData.linkedin || '',
        github: profileData.github || '',
        roll_number: profileData.roll_number || '',
        institute: profileData.institute || '',
        department: profileData.department || '',
        position: profileData.position || '',
        timezone: profileData.timezone || 'Asia/Kolkata'
      });
    }
    setIsEditing(false);
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const calculateProfileCompleteness = () => {
    const fields = [
      formData.first_name,
      formData.last_name,
      formData.email,
      formData.bio,
      formData.phone,
      formData.city,
      formData.institute,
      formData.department,
      formData.linkedin || formData.github
    ];
    const filledFields = fields.filter(field => field && field.trim()).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const completeness = calculateProfileCompleteness();

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <div className="text-2xl text-gray-300 mb-4">Please log in to view your profile</div>
          <Link to="/signin" className="text-indigo-400 hover:text-indigo-300">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen relative grid-texture">
        {isTeacher ? (
          <TeacherSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        ) : (
          <StudentSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        )}
        <main className="flex-1 lg:ml-64">
          <Header 
            onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
          />
          <div className="p-8 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading profile...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen relative grid-texture">
      {/* Sidebar - Conditional based on role */}
      {isTeacher ? (
        <TeacherSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      ) : (
        <StudentSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <main className="flex-1">
        <Header isAuth />
        
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header Section */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Profile Settings</h1>
            <p className="text-sm muted">Manage your account information and preferences</p>
          </div>

          {/* Status Message */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg border ${
              message.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-400' :
              message.type === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-400' :
              'bg-blue-500/10 border-blue-500/50 text-blue-400'
            }`}>
              <div className="flex items-center gap-2">
                {message.type === 'success' ? <FaCheckCircle /> : <FaTimesCircle />}
                <span>{message.text}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 lg:gap-8">
            {/* Main Card */}
            <div className="flex-1 card-strong rounded-xl sm:rounded-2xl overflow-hidden">
              {/* Card Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--border-color)] gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0">
                    <img
                      src={`https://ui-avatars.com/api/?name=${formData.first_name}+${formData.last_name}&background=6366f1&color=fff&size=128&bold=true`}
                      alt="Profile"
                      className="w-full h-full rounded-full border-2 border-white/10"
                    />
                    {isEditing && (
                      <button 
                        className="absolute -bottom-1 -right-1 bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded-full border-2 border-[#0a0a0f] transition-colors"
                        onClick={() => alert('Avatar upload coming soon!')}
                      >
                        <FaCamera className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-lg sm:text-xl font-bold truncate">
                        {formData.display_name || `${formData.first_name} ${formData.last_name}`}
                      </h2>
                    </div>
                    <p className="text-xs sm:text-sm muted">
                      @{user?.username} • {formData.position || (isTeacher ? 'Teacher' : 'Student')}
                    </p>
                  </div>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 text-white px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold hover:bg-blue-700 active:scale-95 transition text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
                  >
                    <FaEdit className="inline w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Edit Profile</span>
                    <span className="sm:hidden">Edit</span>
                  </button>
                )}
              </div>

              {/* Form Content */}
              <form onSubmit={handleSave}>
                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
                    {/* Left Column - Personal & Contact */}
                    <div>
                      {/* Personal Information */}
                      <div className="mb-6 sm:mb-8">
                        <h3 className="text-base sm:text-lg font-bold mb-1">
                          <FaUser className="inline w-4 h-4 mr-2" />
                          Personal Information
                        </h3>
                        <p className="text-xs sm:text-sm muted mb-4">Basic details about yourself</p>
                        
                        <div className="space-y-4">
                          {/* First & Last Name */}
                          <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div>
                              <label className="block text-xs sm:text-sm font-semibold soft mb-2">
                                First Name *
                              </label>
                              <input
                                type="text"
                                value={formData.first_name}
                                onChange={(e) => handleChange('first_name', e.target.value)}
                                disabled={!isEditing}
                                required
                                placeholder="First name"
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                            </div>
                            <div>
                              <label className="block text-xs sm:text-sm font-semibold soft mb-2">
                                Last Name *
                              </label>
                              <input
                                type="text"
                                value={formData.last_name}
                                onChange={(e) => handleChange('last_name', e.target.value)}
                                disabled={!isEditing}
                                required
                                placeholder="Last name"
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                            </div>
                          </div>

                          {/* Display Name */}
                          <div>
                            <label className="block text-xs sm:text-sm font-semibold soft mb-2">
                              Display Name
                            </label>
                            <input
                              type="text"
                              value={formData.display_name}
                              onChange={(e) => handleChange('display_name', e.target.value)}
                              disabled={!isEditing}
                              placeholder="How you want to be called"
                              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </div>

                          {/* Bio */}
                          <div>
                            <label className="block text-xs sm:text-sm font-semibold soft mb-2">
                              Bio
                            </label>
                            <textarea
                              value={formData.bio}
                              onChange={(e) => handleChange('bio', e.target.value)}
                              disabled={!isEditing}
                              rows="4"
                              placeholder="Tell us about yourself..."
                              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg resize-none text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <p className="text-xs muted mt-1">
                              {formData.bio?.length || 0}/500 characters
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="mb-6 sm:mb-8">
                        <h3 className="text-base sm:text-lg font-bold mb-1">
                          <FaEnvelope className="inline w-4 h-4 mr-2" />
                          Contact & Location
                        </h3>
                        <p className="text-xs sm:text-sm muted mb-4">How to reach you</p>
                        
                        <div className="space-y-4">
                          {/* Email */}
                          <div>
                            <label className="block text-xs sm:text-sm font-semibold soft mb-2">
                              Email *
                            </label>
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) => handleChange('email', e.target.value)}
                              disabled={!isEditing}
                              required
                              placeholder="your.email@example.com"
                              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </div>

                          {/* Phone */}
                          <div>
                            <label className="block text-xs sm:text-sm font-semibold soft mb-2">
                              Phone
                            </label>
                            <input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => handleChange('phone', e.target.value)}
                              disabled={!isEditing}
                              placeholder="+91 XXXXX XXXXX"
                              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </div>

                          {/* City & Country */}
                          <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div>
                              <label className="block text-xs sm:text-sm font-semibold soft mb-2">
                                City
                              </label>
                              <input
                                type="text"
                                value={formData.city}
                                onChange={(e) => handleChange('city', e.target.value)}
                                disabled={!isEditing}
                                placeholder="Your city"
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                            </div>
                            <div>
                              <label className="block text-xs sm:text-sm font-semibold soft mb-2">
                                Country
                              </label>
                              <select
                                value={formData.country}
                                onChange={(e) => handleChange('country', e.target.value)}
                                disabled={!isEditing}
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <option value="India">India</option>
                                <option value="United States">United States</option>
                                <option value="United Kingdom">United Kingdom</option>
                                <option value="Canada">Canada</option>
                                <option value="Australia">Australia</option>
                              </select>
                            </div>
                          </div>

                          {/* Timezone */}
                          <div>
                            <label className="block text-xs sm:text-sm font-semibold soft mb-2">
                              <FaClock className="inline w-3 h-3 mr-1" />
                              Timezone
                            </label>
                            <select
                              value={formData.timezone}
                              onChange={(e) => handleChange('timezone', e.target.value)}
                              disabled={!isEditing}
                              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                              <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                              <option value="Europe/London">Europe/London (GMT)</option>
                              <option value="America/New_York">America/New York (EST)</option>
                              <option value="America/Los_Angeles">America/Los Angeles (PST)</option>
                              <option value="UTC">UTC</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Education & Social */}
                    <div>
                      {/* Educational Information */}
                      <div className="mb-6 sm:mb-8">
                        <h3 className="text-base sm:text-lg font-bold mb-1">
                          <FaGraduationCap className="inline w-4 h-4 mr-2" />
                          Educational Information
                        </h3>
                        <p className="text-xs sm:text-sm muted mb-4">Academic details</p>
                        
                        <div className="space-y-4">
                          {/* Roll Number & Position */}
                          <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div>
                              <label className="block text-xs sm:text-sm font-semibold soft mb-2">
                                Roll Number
                              </label>
                              <input
                                type="text"
                                value={formData.roll_number}
                                onChange={(e) => handleChange('roll_number', e.target.value)}
                                disabled={!isEditing}
                                placeholder="Roll no."
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                            </div>
                            <div>
                              <label className="block text-xs sm:text-sm font-semibold soft mb-2">
                                Position
                              </label>
                              <input
                                type="text"
                                value={formData.position}
                                onChange={(e) => handleChange('position', e.target.value)}
                                disabled={!isEditing}
                                placeholder="e.g., Student"
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                            </div>
                          </div>

                          {/* Institute */}
                          <div>
                            <label className="block text-xs sm:text-sm font-semibold soft mb-2">
                              Institute
                            </label>
                            <input
                              type="text"
                              value={formData.institute}
                              onChange={(e) => handleChange('institute', e.target.value)}
                              disabled={!isEditing}
                              placeholder="Enter institute name"
                              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </div>

                          {/* Department */}
                          <div>
                            <label className="block text-xs sm:text-sm font-semibold soft mb-2">
                              Department
                            </label>
                            <input
                              type="text"
                              value={formData.department}
                              onChange={(e) => handleChange('department', e.target.value)}
                              disabled={!isEditing}
                              placeholder="e.g., Computer Science"
                              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </div>

                          {/* Skills */}
                          <div className="pt-4 border-t border-[var(--border-color)]">
                            <div className="flex justify-between items-center mb-3">
                              <label className="text-xs sm:text-sm font-semibold soft">
                                Skills
                              </label>
                              <span className="text-xs muted">{skills.length} skills</span>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                              {skills.map((skill, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full text-sm text-blue-300"
                                >
                                  <span>{skill}</span>
                                  {isEditing && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveSkill(skill)}
                                      className="hover:text-red-400 transition-colors"
                                    >
                                      <FaTimes className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>

                            {isEditing && (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={newSkill}
                                  onChange={(e) => setNewSkill(e.target.value)}
                                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                                  placeholder="Add a skill..."
                                  className="flex-1 px-3 sm:px-4 py-2 rounded-lg text-sm"
                                />
                                <button
                                  type="button"
                                  onClick={handleAddSkill}
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                >
                                  <FaPlus className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Social Links */}
                      <div>
                        <h3 className="text-base sm:text-lg font-bold mb-1">
                          <FaGlobe className="inline w-4 h-4 mr-2" />
                          Social Links
                        </h3>
                        <p className="text-xs sm:text-sm muted mb-4">Connect your social profiles</p>
                        
                        <div className="space-y-4">
                          {/* LinkedIn */}
                          <div>
                            <label className="block text-xs sm:text-sm font-semibold soft mb-2">
                              <FaLinkedin className="inline w-4 h-4 mr-1 text-blue-400" />
                              LinkedIn Profile
                            </label>
                            <input
                              type="url"
                              value={formData.linkedin}
                              onChange={(e) => handleChange('linkedin', e.target.value)}
                              disabled={!isEditing}
                              placeholder="https://www.linkedin.com/in/your-profile"
                              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </div>

                          {/* GitHub */}
                          <div>
                            <label className="block text-xs sm:text-sm font-semibold soft mb-2">
                              <FaGithub className="inline w-4 h-4 mr-1 text-gray-400" />
                              GitHub Profile
                            </label>
                            <input
                              type="url"
                              value={formData.github}
                              onChange={(e) => handleChange('github', e.target.value)}
                              disabled={!isEditing}
                              placeholder="https://github.com/your-username"
                              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Buttons */}
                  {isEditing && (
                    <div className="flex justify-between gap-3 mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-white/10">
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="border border-white/10 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium hover:bg-white/5 active:scale-95 transition flex items-center justify-center gap-2 text-sm flex-1 sm:flex-initial disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FaTimes className="w-4 h-4" />
                        <span className="hidden sm:inline">Cancel</span>
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-blue-600 text-white px-5 sm:px-8 py-2 sm:py-2.5 rounded-lg font-semibold hover:bg-blue-700 active:scale-95 transition text-sm flex-1 sm:flex-initial disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isSaving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <FaSave className="w-4 h-4" />
                            <span>Save Changes</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Profile Summary Card */}
            <div className="xl:w-80 2xl:w-96">
              <div className="card-strong p-4 sm:p-6 rounded-xl sm:rounded-2xl sticky top-6">
                <div className="mb-4">
                  <h3 className="text-base sm:text-lg font-bold mb-1">Profile Summary</h3>
                  <p className="text-xs sm:text-sm muted">Your profile overview</p>
                </div>

                {/* Profile Completeness */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Completeness</span>
                    <span className="text-sm font-semibold">{completeness}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        completeness >= 80 ? 'bg-green-500' :
                        completeness >= 50 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${completeness}%` }}
                    />
                  </div>
                  <p className="text-xs muted mt-2">
                    {completeness >= 80 ? '🎉 Great! Your profile is looking complete' :
                     completeness >= 50 ? '👍 Good progress! Add more details' :
                     '📝 Let\'s complete your profile'}
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{isTeacher ? '12' : '8'}</div>
                    <div className="text-xs muted">{isTeacher ? 'Courses' : 'Enrolled'}</div>
                  </div>
                  <div className="bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{isTeacher ? '248' : '47'}</div>
                    <div className="text-xs muted">{isTeacher ? 'Students' : 'Completed'}</div>
                  </div>
                </div>

                {/* Account Info */}
                <div className="pt-6 border-t border-[var(--border-color)] space-y-3">
                  <h4 className="text-sm font-semibold mb-3">Account Information</h4>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="muted">Username</span>
                    <span className="font-medium">@{user?.username}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="muted">Role</span>
                    <span className="font-medium">{isTeacher ? 'Teacher' : 'Student'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="muted">Location</span>
                    <span className="font-medium">
                      {formData.city ? `${formData.city}, ${formData.country}` : 'Not set'}
                    </span>
                  </div>
                </div>

                {/* Social Links Summary */}
                {(formData.linkedin || formData.github) && (
                  <div className="pt-6 border-t border-[var(--border-color)] mt-6">
                    <h4 className="text-sm font-semibold mb-3">Social Profiles</h4>
                    <div className="space-y-2">
                      {formData.linkedin && (
                        <a 
                          href={formData.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg transition-colors group"
                        >
                          <FaLinkedin className="w-5 h-5 text-blue-400" />
                          <span className="text-sm group-hover:text-white transition-colors">LinkedIn</span>
                        </a>
                      )}
                      {formData.github && (
                        <a 
                          href={formData.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-2 bg-gray-500/10 hover:bg-gray-500/20 border border-gray-500/20 rounded-lg transition-colors group"
                        >
                          <FaGithub className="w-5 h-5 text-gray-400" />
                          <span className="text-sm group-hover:text-white transition-colors">GitHub</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;