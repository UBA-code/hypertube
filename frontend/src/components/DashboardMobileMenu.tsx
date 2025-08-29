import React from "react";

interface MobileMenuProps {
  isMenuOpen: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const DashboardMobileMenu: React.FC<MobileMenuProps> = ({
  isMenuOpen,
  activeTab,
  setActiveTab,
}) => {
  if (!isMenuOpen) return null;

  return (
    <div className="md:hidden bg-gray-800 p-4 mb-6 rounded-lg">
      <div className="grid grid-cols-3 gap-2">
        <button
          className={`p-3 rounded-lg transition text-sm ${
            activeTab === "popular"
              ? "bg-gradient-to-r from-red-600 to-purple-600"
              : "bg-gray-700"
          }`}
          onClick={() => setActiveTab("popular")}
        >
          Popular
        </button>
        <button
          className={`p-3 rounded-lg transition text-sm ${
            activeTab === "watched"
              ? "bg-gradient-to-r from-red-600 to-purple-600"
              : "bg-gray-700"
          }`}
          onClick={() => setActiveTab("watched")}
        >
          History
        </button>
        <button
          className={`p-3 rounded-lg transition text-sm ${
            activeTab === "library"
              ? "bg-gradient-to-r from-red-600 to-purple-600"
              : "bg-gray-700"
          }`}
          onClick={() => setActiveTab("library")}
        >
          Library
        </button>
        <button
          className={`p-3 rounded-lg transition text-sm ${
            activeTab === "downloads"
              ? "bg-gradient-to-r from-red-600 to-purple-600"
              : "bg-gray-700"
          }`}
          onClick={() => setActiveTab("downloads")}
        >
          Downloads
        </button>
        <button
          className={`p-3 rounded-lg transition text-sm ${
            activeTab === "profile"
              ? "bg-gradient-to-r from-red-600 to-purple-600"
              : "bg-gray-700"
          }`}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>
      </div>
    </div>
  );
};

export default DashboardMobileMenu;
