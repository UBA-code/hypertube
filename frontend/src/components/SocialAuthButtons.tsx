import React from "react";
import { FaGithub, FaGoogle } from "react-icons/fa";

import { FaGitlab, FaDiscord } from "react-icons/fa";

interface SocialAuthButtonsProps {
  isLoading?: boolean;
  onGithubAuth: () => void;
  onGoogleAuth: () => void;
  on42Auth: () => void;
  onGitlabAuth: () => void;
  onDiscordAuth: () => void;
}

const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({
  isLoading = false,
  onGithubAuth,
  onGoogleAuth,
  on42Auth,
  onGitlabAuth,
  onDiscordAuth,
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
      <button
        onClick={onGitlabAuth}
        disabled={isLoading}
        className="w-full flex items-center justify-center px-4 py-3 bg-orange-600 text-white border border-orange-700 rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FaGitlab className="text-xl mr-3" />
        <span>Continue with GitLab</span>
      </button>

      <button
        onClick={onDiscordAuth}
        disabled={isLoading}
        className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white border border-indigo-700 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FaDiscord className="text-xl mr-3" />
        <span>Continue with Discord</span>
      </button>
    </div>
  );
};

export default SocialAuthButtons;
