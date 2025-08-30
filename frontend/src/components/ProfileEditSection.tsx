import React, { useState } from "react";
import {
  FaUser,
  FaGlobe,
  FaCamera,
  FaSave,
  FaTimes,
  FaEnvelope,
} from "react-icons/fa";
import Notification from "./Notification";

interface User {
  id: number;
  userName: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  preferredLanguage?: string;
  email?: string;
}

interface ProfileEditSectionProps {
  currentUser: User | null;
  activeTab: string;
  onUpdateUser: (updatedUser: User) => void;
}

const ProfileEditSection: React.FC<ProfileEditSectionProps> = ({
  currentUser,
  activeTab,
  onUpdateUser,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [formData, setFormData] = useState({
    firstName: currentUser?.firstName || "",
    lastName: currentUser?.lastName || "",
    email: currentUser?.email || "",
    preferredLanguage: currentUser?.preferredLanguage || "english",
  });

  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(
    null
  );
  const [profilePicturePreview, setProfilePicturePreview] = useState<
    string | null
  >(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Language options
  const languageOptions = [
    { value: "english", label: "English" },
    { value: "french", label: "Français" },
    { value: "spanish", label: "Español" },
    { value: "german", label: "Deutsch" },
    { value: "italian", label: "Italiano" },
    { value: "portuguese", label: "Português" },
    { value: "russian", label: "Русский" },
    { value: "japanese", label: "日本語" },
    { value: "korean", label: "한국어" },
    { value: "chinese", label: "中文" },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
        setNotification({
          message: "Please select a valid image file (JPG, JPEG, or PNG)",
          type: "error",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setNotification({
          message: "File size must be less than 5MB",
          type: "error",
        });
        return;
      }

      setProfilePictureFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    const emailChanged = formData.email !== currentUser?.email;

    try {
      // Create FormData for multipart/form-data request
      const formDataToSend = new FormData();
      formDataToSend.append("firstName", formData.firstName);
      formDataToSend.append("lastName", formData.lastName);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("preferredLanguage", formData.preferredLanguage);

      if (profilePictureFile) {
        formDataToSend.append("profilePicture", profilePictureFile);
      }

      const response = await fetch("http://localhost:3000/users", {
        method: "PUT",
        credentials: "include",
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedUser = await response.json();

      // Update the user in the parent component
      onUpdateUser(updatedUser);

      if (emailChanged) {
        setNotification({
          message:
            "Profile updated successfully! Please check your email inbox to confirm your new email address.",
          type: "success",
        });
      } else {
        setNotification({
          message: "Profile updated successfully!",
          type: "success",
        });
      }

      setIsEditing(false);
      setProfilePictureFile(null);
      setProfilePicturePreview(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      setNotification({
        message: "Failed to update profile. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      firstName: currentUser?.firstName || "",
      lastName: currentUser?.lastName || "",
      email: currentUser?.email || "",
      preferredLanguage: currentUser?.preferredLanguage || "english",
    });
    setProfilePictureFile(null);
    setProfilePicturePreview(null);
    setErrors({});
  };

  if (activeTab !== "profile") {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Profile Settings</h2>
          <p className="text-gray-400 mt-1">Manage your personal information</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-purple-600 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile Content */}
      <div className="bg-gray-800 rounded-xl p-6">
        {!isEditing ? (
          // View Mode
          <div className="space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                {currentUser?.profilePicture ? (
                  <img
                    src={currentUser.profilePicture}
                    alt={currentUser.userName}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center">
                    <FaUser className="text-gray-400 text-3xl" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  {currentUser?.userName}
                </h3>
              </div>
            </div>

            {/* User Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  First Name
                </label>
                <p className="text-white">
                  {currentUser?.firstName || "Not set"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Last Name
                </label>
                <p className="text-white">
                  {currentUser?.lastName || "Not set"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Username
                </label>
                <p className="text-white">{currentUser?.userName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Email
                </label>
                <p className="text-white">
                  {currentUser?.email || "Not available"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Preferred Language
                </label>
                <p className="text-white">
                  {languageOptions.find(
                    (lang) => lang.value === currentUser?.preferredLanguage
                  )?.label || "English"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Edit Mode
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Upload */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                {profilePicturePreview || currentUser?.profilePicture ? (
                  <img
                    src={profilePicturePreview || currentUser?.profilePicture}
                    alt={currentUser?.userName}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center">
                    <FaUser className="text-gray-400 text-3xl" />
                  </div>
                )}
                <label
                  htmlFor="profilePicture"
                  className="absolute bottom-0 right-0 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-700 transition"
                >
                  <FaCamera className="text-white text-sm" />
                </label>
                <input
                  id="profilePicture"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  {currentUser?.userName}
                </h3>
                <p className="text-gray-400 text-sm">
                  Click the camera icon to change your profile picture
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium mb-2"
                >
                  First Name
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      errors.firstName ? "border-red-500" : "border-gray-600"
                    }`}
                    placeholder="Enter your first name"
                    disabled={isLoading}
                  />
                </div>
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium mb-2"
                >
                  Last Name
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      errors.lastName ? "border-red-500" : "border-gray-600"
                    }`}
                    placeholder="Enter your last name"
                    disabled={isLoading}
                  />
                </div>
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2"
                >
                  Email
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      errors.email ? "border-red-500" : "border-gray-600"
                    }`}
                    placeholder="Enter your email address"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="preferredLanguage"
                  className="block text-sm font-medium mb-2"
                >
                  Preferred Language
                </label>
                <div className="relative">
                  <FaGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    id="preferredLanguage"
                    name="preferredLanguage"
                    value={formData.preferredLanguage}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none"
                    disabled={isLoading}
                  >
                    {languageOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-400">
                  Username
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={currentUser?.userName || ""}
                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
                    disabled
                  />
                </div>
                <p className="text-gray-500 text-sm mt-1">
                  Username cannot be changed
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 to-purple-600 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaSave />
                <span>{isLoading ? "Saving..." : "Save Changes"}</span>
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaTimes />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfileEditSection;
