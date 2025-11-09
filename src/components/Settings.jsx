import React, { useState } from 'react';
import Sidbar from './partials/Sidbar';
import Topnav from './partials/Topnav';
import { useSelector, useDispatch } from 'react-redux';
import { 
  FaCog, FaUser, FaBell, FaLock, 
  FaPalette, FaLanguage, FaSave, FaShieldAlt 
} from 'react-icons/fa';

const Settings = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('profile');
  const [saveStatus, setSaveStatus] = useState(null);

  const [profileData, setProfileData] = useState({
    name: user?.name || 'User Name',
    email: user?.email || 'user@example.com',
    bio: 'Movie enthusiast and binge-watcher'
  });

  const [preferences, setPreferences] = useState({
    language: 'en',
    theme: 'dark',
    autoplay: true,
    notifications: true,
    emailUpdates: false
  });

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences({
      ...preferences,
      [key]: value
    });
  };

  const handleSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    }, 1000);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <FaUser /> },
    { id: 'preferences', label: 'Preferences', icon: <FaPalette /> },
    { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
    { id: 'security', label: 'Security', icon: <FaLock /> }
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-950">
      <Sidbar />
      <div className="w-full flex-1 flex flex-col">
        <Topnav />
        <div className="flex-grow overflow-y-auto bg-gradient-to-br from-[#0d0917] to-[#1a1125] text-white p-4 md:p-8">
          
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-gradient-to-r from-[#6556CD] to-[#9b8aff] p-3 rounded-xl">
              <FaCog className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Settings</h1>
              <p className="text-zinc-400 text-sm">Manage your account preferences</p>
            </div>
          </div>

          {/* Save Status */}
          {saveStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-400 flex items-center gap-2">
              <FaSave />
              Settings saved successfully!
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Tabs Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-[#1e1830] to-[#2a1f40] rounded-xl p-4 border border-[#6556CD]/20">
                <div className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-[#6556CD] text-white'
                          : 'text-zinc-400 hover:bg-[#0d0917] hover:text-white'
                      }`}
                    >
                      {tab.icon}
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              <div className="bg-gradient-to-br from-[#1e1830] to-[#2a1f40] rounded-xl p-6 md:p-8 border border-[#6556CD]/20">
                
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Profile Information</h2>
                    
                    <div className="flex items-center gap-6 mb-8">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#6556CD] to-[#9b8aff] flex items-center justify-center text-white text-3xl font-bold">
                        {profileData.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <button className="bg-[#6556CD] hover:bg-[#7561e0] text-white px-4 py-2 rounded-lg transition-all mb-2">
                          Change Photo
                        </button>
                        <p className="text-zinc-400 text-sm">JPG, PNG or GIF. Max size 2MB</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-zinc-300 mb-2 text-sm">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={profileData.name}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-3 bg-[#0d0917] text-white rounded-lg border border-[#6556CD]/30 focus:border-[#6556CD] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-300 mb-2 text-sm">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={profileData.email}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-3 bg-[#0d0917] text-white rounded-lg border border-[#6556CD]/30 focus:border-[#6556CD] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-300 mb-2 text-sm">Bio</label>
                        <textarea
                          name="bio"
                          value={profileData.bio}
                          onChange={handleProfileChange}
                          rows="4"
                          className="w-full px-4 py-3 bg-[#0d0917] text-white rounded-lg border border-[#6556CD]/30 focus:border-[#6556CD] focus:outline-none resize-none"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Preferences</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-zinc-300 mb-3 text-sm flex items-center gap-2">
                          <FaLanguage className="text-[#6556CD]" />
                          Language
                        </label>
                        <select
                          value={preferences.language}
                          onChange={(e) => handlePreferenceChange('language', e.target.value)}
                          className="w-full px-4 py-3 bg-[#0d0917] text-white rounded-lg border border-[#6556CD]/30 focus:border-[#6556CD] focus:outline-none"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-zinc-300 mb-3 text-sm flex items-center gap-2">
                          <FaPalette className="text-[#6556CD]" />
                          Theme
                        </label>
                        <select
                          value={preferences.theme}
                          onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                          className="w-full px-4 py-3 bg-[#0d0917] text-white rounded-lg border border-[#6556CD]/30 focus:border-[#6556CD] focus:outline-none"
                        >
                          <option value="dark">Dark</option>
                          <option value="light">Light</option>
                          <option value="auto">Auto</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-[#0d0917] rounded-lg border border-[#6556CD]/30">
                        <div>
                          <div className="text-white font-medium">Autoplay Videos</div>
                          <div className="text-zinc-400 text-sm">Automatically play video previews</div>
                        </div>
                        <button
                          onClick={() => handlePreferenceChange('autoplay', !preferences.autoplay)}
                          className={`relative w-14 h-7 rounded-full transition-all ${
                            preferences.autoplay ? 'bg-[#6556CD]' : 'bg-zinc-600'
                          }`}
                        >
                          <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                            preferences.autoplay ? 'transform translate-x-7' : ''
                          }`}></div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Notification Settings</h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-[#0d0917] rounded-lg border border-[#6556CD]/30">
                        <div>
                          <div className="text-white font-medium">Push Notifications</div>
                          <div className="text-zinc-400 text-sm">Receive notifications about new content</div>
                        </div>
                        <button
                          onClick={() => handlePreferenceChange('notifications', !preferences.notifications)}
                          className={`relative w-14 h-7 rounded-full transition-all ${
                            preferences.notifications ? 'bg-[#6556CD]' : 'bg-zinc-600'
                          }`}
                        >
                          <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                            preferences.notifications ? 'transform translate-x-7' : ''
                          }`}></div>
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-[#0d0917] rounded-lg border border-[#6556CD]/30">
                        <div>
                          <div className="text-white font-medium">Email Updates</div>
                          <div className="text-zinc-400 text-sm">Get weekly updates via email</div>
                        </div>
                        <button
                          onClick={() => handlePreferenceChange('emailUpdates', !preferences.emailUpdates)}
                          className={`relative w-14 h-7 rounded-full transition-all ${
                            preferences.emailUpdates ? 'bg-[#6556CD]' : 'bg-zinc-600'
                          }`}
                        >
                          <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                            preferences.emailUpdates ? 'transform translate-x-7' : ''
                          }`}></div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Security Settings</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-zinc-300 mb-2 text-sm">Current Password</label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 bg-[#0d0917] text-white rounded-lg border border-[#6556CD]/30 focus:border-[#6556CD] focus:outline-none"
                          placeholder="Enter current password"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-300 mb-2 text-sm">New Password</label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 bg-[#0d0917] text-white rounded-lg border border-[#6556CD]/30 focus:border-[#6556CD] focus:outline-none"
                          placeholder="Enter new password"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-300 mb-2 text-sm">Confirm New Password</label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 bg-[#0d0917] text-white rounded-lg border border-[#6556CD]/30 focus:border-[#6556CD] focus:outline-none"
                          placeholder="Confirm new password"
                        />
                      </div>

                      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                        <div className="flex items-start gap-3">
                          <FaShieldAlt className="text-amber-500 text-xl mt-1" />
                          <div>
                            <div className="text-amber-400 font-medium mb-1">Password Requirements</div>
                            <ul className="text-zinc-400 text-sm space-y-1">
                              <li>• At least 8 characters long</li>
                              <li>• Include uppercase and lowercase letters</li>
                              <li>• Include at least one number</li>
                              <li>• Include at least one special character</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="mt-8 flex gap-4">
                  <button
                    onClick={handleSave}
                    disabled={saveStatus === 'saving'}
                    className="bg-gradient-to-r from-[#6556CD] to-[#9b8aff] hover:from-[#7561e0] hover:to-[#a896ff] text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
                  >
                    {saveStatus === 'saving' ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button className="bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300">
                    Cancel
                  </button>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;
