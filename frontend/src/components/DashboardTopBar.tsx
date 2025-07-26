import React from "react";
import { FaSearch, FaPlay, FaBell, FaUserCircle } from "react-icons/fa";

interface User {
  userName: string;
  firstName?: string;
  profilePicture?: string;
}

interface DashboardTopBarProps {
  currentUser: User | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

const DashboardTopBar: React.FC<DashboardTopBarProps> = ({
  currentUser,
  searchQuery,
  setSearchQuery,
  isMenuOpen,
  setIsMenuOpen,
}) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center md:hidden">
        <button
          className="mr-4 text-xl"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>
        <FaPlay className="text-red-600 text-2xl mr-2" />
        <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
          Hypertube
        </h1>
      </div>

      <div className="relative w-full max-w-md">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <FaSearch />
        </div>
        <input
          type="text"
          placeholder="Search movies..."
          className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="hidden md:flex items-center space-x-4 ml-4">
        <button className="relative p-2 rounded-full hover:bg-gray-800">
          <FaBell className="text-xl" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        {currentUser?.profilePicture ? (
          <img
            src={currentUser.profilePicture}
            alt={currentUser.userName}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <FaUserCircle className="text-gray-400 text-3xl" />
        )}
      </div>
    </div>
  );
};

export default DashboardTopBar;
