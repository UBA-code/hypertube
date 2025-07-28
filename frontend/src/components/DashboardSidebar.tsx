import React from "react";
import {
  FaPlay,
  FaHistory,
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { MdLocalMovies, MdDownload, MdTrendingUp } from "react-icons/md";

interface User {
  userName: string;
  firstName?: string;
  profilePicture?: string;
}

interface DashboardSidebarProps {
  currentUser: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onLogout,
}) => {
  return (
    <div className="w-64 bg-gray-800 p-4 hidden md:flex flex-col">
      <div className="flex items-center space-x-3 mb-10 mt-2">
        <FaPlay className="text-red-600 text-3xl" />
        <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
          Hypertube
        </h1>
      </div>

      <div className="mb-8 flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
        {currentUser?.profilePicture ? (
          <img
            src={currentUser.profilePicture}
            alt={currentUser.userName}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <FaUserCircle className="text-gray-400 text-3xl" />
        )}
        <div>
          <p className="font-semibold">{currentUser?.userName}</p>
          <p className="text-sm text-gray-400">Premium Member</p>
        </div>
      </div>

      <nav className="flex-1">
        <ul className="space-y-2">
          <li>
            <button
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition ${
                activeTab === "popular"
                  ? "bg-gradient-to-r from-red-600 to-purple-600"
                  : "hover:bg-gray-700"
              }`}
              onClick={() => setActiveTab("popular")}
            >
              <MdTrendingUp className="text-xl" />
              <span>Popular Movies</span>
            </button>
          </li>
          <li>
            <button
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition ${
                activeTab === "watched"
                  ? "bg-gradient-to-r from-red-600 to-purple-600"
                  : "hover:bg-gray-700"
              }`}
              onClick={() => setActiveTab("watched")}
            >
              <FaHistory className="text-xl" />
              <span>Watch History</span>
            </button>
          </li>
          <li>
            <button
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition ${
                activeTab === "library"
                  ? "bg-gradient-to-r from-red-600 to-purple-600"
                  : "hover:bg-gray-700"
              }`}
              onClick={() => setActiveTab("library")}
            >
              <MdLocalMovies className="text-xl" />
              <span>My Library</span>
            </button>
          </li>
          <li>
            <button
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition ${
                activeTab === "downloads"
                  ? "bg-gradient-to-r from-red-600 to-purple-600"
                  : "hover:bg-gray-700"
              }`}
              onClick={() => setActiveTab("downloads")}
            >
              <MdDownload className="text-xl" />
              <span>Downloads</span>
            </button>
          </li>
        </ul>
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-700">
        <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition">
          <FaCog className="text-xl" />
          <span>Settings</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition"
        >
          <FaSignOutAlt className="text-xl" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
