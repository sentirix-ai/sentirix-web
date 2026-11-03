'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Shield,
  Mail,
  User,
  Phone,
  Sparkles,
} from 'lucide-react';
import { UserSession, updateUserAvatar } from '../lib/auth';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserSession | null;
  onProfileUpdated: (updatedUser: UserSession) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onProfileUpdated,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state whenever modal opens or user changes
  useEffect(() => {
    if (isOpen && user) {
      setSelectedImage(user.avatarUrl || null);
      setIsRemoving(false);
      setFeedback(null);
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  // Process selected file with client-side canvas compression & square crop
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', message: 'Please select a valid image file (JPG, PNG, WEBP).' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas 400x400 for high-resolution circular avatar
        const canvas = document.createElement('canvas');
        const targetSize = 400;
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          setSelectedImage(img.src);
          setIsRemoving(false);
          setFeedback(null);
          return;
        }

        // Center square crop
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, targetSize, targetSize);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setSelectedImage(compressedDataUrl);
        setIsRemoving(false);
        setFeedback(null);
      };
      img.src = loadEvent.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setSelectedImage(null);
    setIsRemoving(true);
    setFeedback(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setFeedback(null);

    const finalAvatarUrl = isRemoving ? null : selectedImage;

    try {
      const res = await updateUserAvatar(user.username, finalAvatarUrl, user.id);
      if (res.success) {
        const updatedUser: UserSession = {
          ...user,
          avatarUrl: finalAvatarUrl,
        };
        onProfileUpdated(updatedUser);
        setFeedback({
          type: 'success',
          message: finalAvatarUrl
            ? 'Profile photo updated successfully!'
            : 'Profile photo has been removed.',
        });
        setTimeout(() => {
          onClose();
        }, 1100);
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Failed to save profile photo. Please try again.',
        });
      }
    } catch {
      setFeedback({ type: 'error', message: 'An error occurred while saving the photo.' });
    } finally {
      setIsSaving(false);
    }
  };

  const currentDisplayAvatar = isRemoving ? null : selectedImage;
  const hasChanges = (user.avatarUrl || null) !== currentDisplayAvatar;
  const isAdmin = user.role === 'ADMIN' || user.username.toLowerCase() === 'pungkyrama';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center text-[#2563EB]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">Account Profile Settings</h3>
              <p className="text-xs text-slate-500">Manage your avatar photo and Sentirix account details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Feedback Banner */}
          {feedback && (
            <div
              className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Photo Upload Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
            {/* Avatar Circle with Hover Overlay */}
            <div className="relative group shrink-0">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-full overflow-hidden border-3 border-white shadow-md bg-gradient-to-tr from-[#1E3A8A] to-[#2563EB] flex items-center justify-center cursor-pointer transition-transform group-hover:scale-102"
                title="Click to select a new profile photo"
              >
                {currentDisplayAvatar ? (
                  <img
                    src={currentDisplayAvatar}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-2xl font-black tracking-wider uppercase">
                    {user.avatarText || user.username.slice(0, 2)}
                  </span>
                )}
                {/* Camera icon hover overlay */}
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                  <Camera className="w-6 h-6" />
                  <span className="text-[10px] font-semibold mt-1">Change Photo</span>
                </div>
              </div>

              {/* Bottom-right camera badge */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-md border-2 border-white hover:bg-[#1D4ED8] transition-colors cursor-pointer"
                title="Upload new photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Upload & Remove Controls */}
            <div className="flex-1 text-center sm:text-left space-y-2.5">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Profile Photo</h4>
                <p className="text-xs text-slate-500">
                  Supports JPG, PNG, or WEBP. Photos are automatically cropped and optimized for sharp, fast rendering.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose New Photo</span>
                </button>

                {currentDisplayAvatar && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Photo</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* User Account Details Readout */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Account Information
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Username */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Username</span>
                  <span className="block text-xs font-bold text-slate-800 truncate">@{user.username}</span>
                </div>
              </div>

              {/* Role */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Access Role</span>
                  <span className="block text-xs font-bold text-slate-800 truncate">
                    {isAdmin
                      ? 'Platform Founder & Admin'
                      : user.isGuestMember
                        ? 'Support Agent'
                        : 'Support Pod Leader'}
                  </span>
                </div>
              </div>

              {/* Email */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Work Email</span>
                  <span className="block text-xs font-bold text-slate-800 truncate">
                    {user.email || 'admin@sentrix.enterprise'}
                  </span>
                </div>
              </div>

              {/* Phone */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Phone / Mobile</span>
                  <span className="block text-xs font-bold text-slate-800 truncate">
                    {user.phone || '+1-555-019-0000'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-white text-xs font-bold shadow-sm transition-all cursor-pointer ${
              hasChanges && !isSaving
                ? 'bg-[#2563EB] hover:bg-[#1D4ED8] hover:shadow-md'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
            }`}
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Profile Photo</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};