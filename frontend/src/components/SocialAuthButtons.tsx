import React from "react";
import { FaGithub, FaGoogle } from "react-icons/fa";

interface SocialAuthButtonsProps {
  isLoading?: boolean;
  onGithubAuth: () => void;
  onGoogleAuth: () => void;
  on42Auth: () => void;
}

const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({
  isLoading = false,
  onGithubAuth,
  onGoogleAuth,
  on42Auth,
}) => {
  return (
    <div className="space-y-3">
      <button
        onClick={onGithubAuth}
        disabled={isLoading}
        className="w-full flex items-center justify-center px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FaGithub className="text-xl mr-3" />
        <span>Continue with GitHub</span>
      </button>

      <button
        onClick={onGoogleAuth}
        disabled={isLoading}
        className="w-full flex items-center justify-center px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FaGoogle className="text-xl mr-3 text-red-500" />
        <span>Continue with Google</span>
      </button>

      <button
        onClick={on42Auth}
        disabled={isLoading}
        className="w-full flex items-center justify-center px-4 py-3 bg-black border border-gray-700 rounded-lg hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="w-6 h-6 mr-3 bg-white rounded flex items-center justify-center">
          <span className="text-black font-bold text-sm">42</span>
        </div>
        <span>Continue with 42</span>
      </button>
    </div>
  );
};

export default SocialAuthButtons;
