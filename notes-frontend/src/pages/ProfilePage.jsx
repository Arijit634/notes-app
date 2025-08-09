import {
    CameraIcon,
    KeyIcon,
    ShieldCheckIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from '../components/common';
import Button from '../components/common/Button';
import { changePassword, clearTwoFactorSetup, deleteProfilePicture, disableTwoFactor, fetchUserProfile, setupTwoFactor, updateProfile, uploadProfilePicture, verifyTwoFactor } from '../store/slices/profileSlice';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { profile, loading } = useSelector(state => state.profile);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  const tabs = [
    { id: 'general', label: 'General', icon: UserIcon },
    { id: 'security', label: 'Security', icon: KeyIcon },
    { id: 'two-factor', label: '2FA', icon: ShieldCheckIcon },
    { id: 'picture', label: 'Profile Picture', icon: CameraIcon },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Profile Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Overview */}
      <Card className="p-6">
        <div className="flex items-center space-x-6">
          <div className="relative">
            {profile?.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt={profile.userName}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {profile?.userName?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {profile?.userName}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {profile?.email}
            </p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Member since {new Date(profile?.createdDate).toLocaleDateString()}
              </span>
              {profile?.signUpMethod && (
                <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs rounded-full">
                  {profile.signUpMethod.toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'general' && <GeneralSettings profile={profile} />}
        {activeTab === 'security' && <SecuritySettings profile={profile} />}
        {activeTab === 'two-factor' && <TwoFactorSettings profile={profile} />}
        {activeTab === 'picture' && <ProfilePictureSettings profile={profile} />}
      </div>
    </motion.div>
  );
};

// Placeholder components - we'll implement these next
const GeneralSettings = ({ profile }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.profile);
  const [formData, setFormData] = useState({
    userName: profile?.userName || '',
    email: profile?.email || '',
    phoneNumber: profile?.phoneNumber || '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        userName: profile.userName || '',
        email: profile.email || '',
        phoneNumber: profile.phoneNumber || '',
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateProfile(formData)).unwrap();
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error || 'Failed to update profile');
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
        General Information
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              className="input"
              placeholder="Enter your username"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="input"
              placeholder="Enter your phone number"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sign Up Method
            </label>
            <div className="input bg-gray-50 dark:bg-gray-800 cursor-not-allowed">
              {profile?.signUpMethod?.toUpperCase() || 'LOCAL'}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button
            type="submit"
            loading={loading}
            className="px-6"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Card>
  );
};

const SecuritySettings = ({ profile }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.profile);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = (e) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      await dispatch(changePassword(passwordData)).unwrap();
      toast.success('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error(error || 'Failed to change password');
    }
  };

  // Don't show password change for OAuth users
  const isOAuthUser = profile?.signUpMethod && profile.signUpMethod !== 'email';

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
        Security Settings
      </h3>
      
      {isOAuthUser ? (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <ShieldCheckIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-blue-800 dark:text-blue-200 font-medium">
              OAuth Account
            </span>
          </div>
          <p className="text-blue-700 dark:text-blue-300 mt-2">
            Your account is secured through {profile.signUpMethod.toUpperCase()}. 
            Password changes are managed by your OAuth provider.
          </p>
        </div>
      ) : (
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="input"
                placeholder="Enter your current password"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="input"
                placeholder="Enter new password"
                minLength={6}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="input"
                placeholder="Confirm new password"
                minLength={6}
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button
              type="submit"
              loading={loading}
              className="px-6"
            >
              Change Password
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
};

const TwoFactorSettings = ({ profile }) => {
  const dispatch = useDispatch();
  const { loading, twoFactorSetup } = useSelector(state => state.profile);
  const [verificationCode, setVerificationCode] = useState('');
  const [showSetup, setShowSetup] = useState(false);

  // Debug logging
  console.log('TwoFactorSettings Debug:', { showSetup, twoFactorSetup, loading });

  // Auto-show setup when twoFactorSetup data is available
  useEffect(() => {
    if (twoFactorSetup && !showSetup) {
      setShowSetup(true);
    }
  }, [twoFactorSetup, showSetup]);

  const handleSetupTwoFactor = async () => {
    try {
      const result = await dispatch(setupTwoFactor()).unwrap();
      console.log('2FA Setup Result:', result);
      // Small delay to ensure Redux state is updated
      setTimeout(() => setShowSetup(true), 100);
      toast.success('2FA setup initiated. Scan the QR code with your authenticator app.');
    } catch (error) {
      console.error('2FA Setup Error:', error);
      toast.error(error || 'Failed to setup 2FA');
    }
  };

  const handleVerifyTwoFactor = async (e) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit verification code');
      return;
    }

    try {
      await dispatch(verifyTwoFactor(verificationCode)).unwrap();
      toast.success('2FA enabled successfully');
      setShowSetup(false);
      setVerificationCode('');
    } catch (error) {
      toast.error(error || 'Invalid verification code');
    }
  };

  const handleCancelSetup = () => {
    console.log('Cancel 2FA setup clicked');
    setShowSetup(false);
    setVerificationCode('');
    // Clear the Redux state as well
    dispatch(clearTwoFactorSetup());
  };

  const handleDisableTwoFactor = async (e) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit verification code');
      return;
    }

    try {
      await dispatch(disableTwoFactor(verificationCode)).unwrap();
      toast.success('2FA disabled successfully');
      setVerificationCode('');
    } catch (error) {
      toast.error(error || 'Invalid verification code');
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
        Two-Factor Authentication
      </h3>
      
      <div className="space-y-6">
        {/* 2FA Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-3">
            <ShieldCheckIcon className={`w-6 h-6 ${
              profile?.twoFactorEnabled 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-gray-400'
            }`} />
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Two-Factor Authentication
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {profile?.twoFactorEnabled 
                  ? 'Your account is protected with 2FA' 
                  : 'Add an extra layer of security to your account'
                }
              </p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            profile?.twoFactorEnabled
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
          }`}>
            {profile?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
          </div>
        </div>

        {/* Setup 2FA */}
        {!profile?.twoFactorEnabled && !showSetup && (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Secure your account with two-factor authentication using Google Authenticator, 
              Authy, or any TOTP-compatible app.
            </p>
            <Button
              onClick={handleSetupTwoFactor}
              loading={loading}
              className="w-full sm:w-auto"
            >
              Enable Two-Factor Authentication
            </Button>
          </div>
        )}

        {/* QR Code Setup */}
        {showSetup && twoFactorSetup && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
                Scan QR Code
              </h4>
              <div className="flex flex-col items-center space-y-4">
                <div className="w-48 h-48 border rounded-lg bg-white flex items-center justify-center">
                  {twoFactorSetup.qrCodeUrl ? (
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(twoFactorSetup.qrCodeUrl)}`}
                      alt="2FA QR Code"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        console.error('QR Code image failed to load:', e);
                        console.log('QR Code URL:', twoFactorSetup.qrCodeUrl);
                      }}
                      onLoad={() => console.log('QR Code loaded successfully')}
                    />
                  ) : (
                    <div className="text-center text-gray-500">
                      <p>QR Code Loading...</p>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Can't scan? Enter this key manually:
                  </p>
                  <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono break-all">
                    {twoFactorSetup.secretKey}
                  </code>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleVerifyTwoFactor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Enter verification code from your authenticator app
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="input text-center text-lg font-mono tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>
              <div className="flex space-x-3">
                <Button
                  type="submit"
                  loading={loading}
                  disabled={verificationCode.length !== 6}
                  className="flex-1"
                >
                  Verify & Enable
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelSetup}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Disable 2FA */}
        {profile?.twoFactorEnabled && (
          <div className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
              <p className="text-yellow-800 dark:text-yellow-200">
                <strong>Warning:</strong> Disabling 2FA will reduce your account security.
              </p>
            </div>
            
            <form onSubmit={handleDisableTwoFactor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Enter verification code to disable 2FA
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="input text-center text-lg font-mono tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>
              <Button
                type="submit"
                variant="error"
                loading={loading}
                disabled={verificationCode.length !== 6}
                className="w-full sm:w-auto"
              >
                Disable Two-Factor Authentication
              </Button>
            </form>
          </div>
        )}
      </div>
    </Card>
  );
};

const ProfilePictureSettings = ({ profile }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.profile);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should not exceed 5MB');
      return;
    }

    try {
      await dispatch(uploadProfilePicture(file)).unwrap();
      toast.success('Profile picture uploaded successfully');
    } catch (error) {
      toast.error(error || 'Failed to upload profile picture');
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDeletePicture = async () => {
    if (window.confirm('Are you sure you want to delete your profile picture?')) {
      try {
        await dispatch(deleteProfilePicture()).unwrap();
        toast.success('Profile picture deleted successfully');
      } catch (error) {
        toast.error(error || 'Failed to delete profile picture');
      }
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
        Profile Picture
      </h3>
      
      <div className="space-y-6">
        {/* Current Picture */}
        <div className="flex items-center space-x-6">
          <div className="relative">
            {profile?.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt={profile.userName}
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center border-4 border-gray-200 dark:border-gray-700">
                <span className="text-white font-bold text-2xl">
                  {profile?.userName?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              {profile?.profilePicture ? 'Current Picture' : 'No Picture Set'}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {profile?.profilePicture 
                ? 'Your current profile picture is displayed across the app'
                : 'Upload a picture to personalize your profile'
              }
            </p>
            {profile?.profilePicture && (
              <Button
                variant="error"
                size="sm"
                onClick={handleDeletePicture}
                loading={loading}
                className="mt-2"
              >
                Delete Picture
              </Button>
            )}
          </div>
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver
              ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <CameraIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Upload new picture
          </h4>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Drag and drop an image here, or click to select
          </p>
          <div className="space-y-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              loading={loading}
              className="mx-auto"
            >
              Choose File
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Supports: JPG, PNG, GIF up to 5MB
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        {/* Guidelines */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            Picture Guidelines
          </h5>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Use a clear, recent photo of yourself</li>
            <li>• Square images work best (1:1 aspect ratio)</li>
            <li>• Minimum resolution: 200x200 pixels</li>
            <li>• Keep file size under 5MB for best performance</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default ProfilePage;
