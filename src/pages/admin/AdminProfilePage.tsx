import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  ShieldCheck,
  Lock,
  Camera,
  Save,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import adminService, { AdminUser } from '@/services/adminService';
import toast from 'react-hot-toast';

export const AdminProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<AdminUser | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Profile Edit State
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Profile Image State
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);

  // Password Change State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Fetch admin profile on mount (GET /admin)
  const fetchProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const response = await adminService.getProfile();
      if (response && response.success !== false && response.data) {
        const adminData = response.data;
        setProfile(adminData);
        setFirstname(adminData.firstname || '');
        setLastname(adminData.lastname || '');
        setEmail(adminData.email || '');
        setProfileImageUrl(adminData.profileImage || '');
      }
    } catch (error: any) {
      console.error('Failed to load admin profile:', error);
      // Fallback display if not logged in / auth headers mock
      setFirstname('John');
      setLastname('Admin');
      setEmail('admin@escrowdapp.io');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Update Profile Info (PATCH /admin)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstname.trim() || !lastname.trim()) {
      toast.error('Firstname and lastname are required');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const response = await adminService.updateProfile({
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        email: email.trim(),
      });

      if (response && response.success !== false) {
        toast.success('Admin profile details updated!');
        fetchProfile();
      } else {
        toast.error(response?.message || 'Failed to update profile');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to update profile details';
      toast.error(msg);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Update Profile Image (POST /admin/profile-image)
  const handleUpdateProfileImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileImageUrl.trim()) {
      toast.error('Please enter a valid image URL');
      return;
    }

    setIsUpdatingImage(true);
    try {
      const response = await adminService.updateProfileImage({
        profileImage: profileImageUrl.trim(),
      });

      if (response && response.success !== false) {
        toast.success('Profile image updated successfully!');
        fetchProfile();
      } else {
        toast.error(response?.message || 'Failed to update profile image');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to update profile image';
      toast.error(msg);
    } finally {
      setIsUpdatingImage(false);
    }
  };

  // Change Password (POST /admin/change-password)
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword) {
      toast.error('Current password is required');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await adminService.changePassword({
        oldPassword,
        newPassword,
      });

      if (response && response.success !== false) {
        toast.success('Password changed successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(response?.message || 'Failed to change password');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to change password. Check old password.';
      toast.error(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
                Admin Profile Management
                <Sparkles className="h-4 w-4 text-indigo-400 fill-indigo-400" />
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Connected to backend APIs: <code className="text-indigo-400 font-mono text-[10px]">GET /admin</code>, <code className="text-indigo-400 font-mono text-[10px]">PATCH /admin</code>, <code className="text-indigo-400 font-mono text-[10px]">POST /admin/profile-image</code>, <code className="text-indigo-400 font-mono text-[10px]">POST /admin/change-password</code>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column — Profile Overview Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-5 text-center">
            <div className="relative inline-block mx-auto">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="Admin Avatar"
                  className="h-24 w-24 rounded-full object-cover border-2 border-indigo-500 shadow-xl mx-auto"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-xl mx-auto border-2 border-indigo-400/30">
                  {firstname ? firstname.charAt(0).toUpperCase() : 'A'}
                  {lastname ? lastname.charAt(0).toUpperCase() : 'D'}
                </div>
              )}
              <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 border-2 border-slate-950" title="Active" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-100">
                {firstname || 'Admin'} {lastname || 'User'}
              </h3>
              <p className="text-xs font-mono text-indigo-400 mt-0.5">{email || 'admin@escrowdapp.io'}</p>
              <div className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Super Administrator</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-900 text-left space-y-2 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Account Status:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Active
                </span>
              </div>
              <div className="flex justify-between">
                <span>Created At:</span>
                <span className="font-mono text-slate-300">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Active'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Profile Image URL Form */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-900 pb-3 text-xs font-bold text-slate-200">
              <Camera className="h-4 w-4 text-indigo-400" />
              <span>Update Profile Image</span>
            </div>
            <form onSubmit={handleUpdateProfileImage} className="space-y-3">
              <div className="space-y-1">
                <Label className="text-[11px] text-slate-400">Image Avatar URL</Label>
                <Input
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={profileImageUrl}
                  onChange={(e) => setProfileImageUrl(e.target.value)}
                  className="bg-slate-900 border-slate-800 text-xs text-slate-100 h-9 placeholder:text-slate-600"
                />
              </div>
              <Button
                type="submit"
                size="sm"
                disabled={isUpdatingImage}
                className="w-full bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-indigo-500/30 text-xs font-bold rounded-xl h-9"
              >
                {isUpdatingImage ? 'Updating Image...' : 'Save Profile Image'}
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column — Details & Change Password Forms */}
        <div className="lg:col-span-8 space-y-6">
          {/* Edit Profile Details (PATCH /admin) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-5">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <User className="h-4 w-4 text-indigo-400" />
                Personal Admin Information
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Update admin firstname, lastname, and primary email address.
              </p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300">First Name</Label>
                  <Input
                    type="text"
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                    placeholder="First Name"
                    className="bg-slate-900 border-slate-800 text-xs text-slate-100 h-10"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300">Last Name</Label>
                  <Input
                    type="text"
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                    placeholder="Last Name"
                    className="bg-slate-900 border-slate-800 text-xs text-slate-100 h-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Admin Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@escrowdapp.io"
                    className="pl-9 bg-slate-900 border-slate-800 text-xs text-slate-100 h-10"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl h-10 px-5 flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                  <Save className="h-4 w-4" />
                  <span>{isUpdatingProfile ? 'Saving Details...' : 'Save Profile Changes'}</span>
                </Button>
              </div>
            </form>
          </div>

          {/* Change Password Card (POST /admin/change-password) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-5">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-indigo-400" />
                Change Account Password
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Securely update your admin authentication password (<code className="text-indigo-400 font-mono text-[10px]">POST /admin/change-password</code>).
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Current Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="pl-9 bg-slate-900 border-slate-800 text-xs text-slate-100 h-10"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="pl-9 bg-slate-900 border-slate-800 text-xs text-slate-100 h-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="pl-9 bg-slate-900 border-slate-800 text-xs text-slate-100 h-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  disabled={isChangingPassword}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs border border-slate-700 rounded-xl h-10 px-5 flex items-center gap-2"
                >
                  <KeyRound className="h-4 w-4 text-indigo-400" />
                  <span>{isChangingPassword ? 'Updating Password...' : 'Update Password'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;
