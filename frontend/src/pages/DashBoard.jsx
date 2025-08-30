// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DashboardSidebar,
  DashboardTopBar,
  DashboardMobileMenu,
  DashboardWelcomeMessage,
  DashboardLoadingSkeleton,
  ContinueWatchingSection,
  PopularMoviesSection,
  WatchedMoviesSection,
  LibrarySection,
  DownloadsSection,
  ProfileEditSection,
} from "../components";

// Mock API service that returns promises with data matching your plan structure
import { getWatchedMovies } from "../services/server";
import api from "../services/api.ts";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("popular");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await api.get("/auth/me");
        setCurrentUser(response.data);
      } catch (error) {
        console.log("Auth check failed:", error);
        // If there's an error, assume user is not authenticated and redirect
        navigate("/login");
        return;
      }
    };

    checkAuthStatus();
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Only fetch watched movies now - PopularMoviesSection handles its own data
        const watched = await getWatchedMovies();

        setWatchedMovies(watched);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch data if user is authenticated (currentUser is set)
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await api.post("/auth/logout");
      // Logout successful, redirect to login page
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if there's a network error, redirect to login
      navigate("/login");
    }
  };

  // Handle user profile updates
  const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  // Render loading skeleton
  if (loading) {
    return <DashboardLoadingSkeleton />;
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <DashboardSidebar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <DashboardTopBar
          currentUser={currentUser}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
        />

        <DashboardMobileMenu
          isMenuOpen={isMenuOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <DashboardWelcomeMessage currentUser={currentUser} />

        <PopularMoviesSection activeTab={activeTab} />

        <WatchedMoviesSection
          activeTab={activeTab}
          watchedMovies={watchedMovies}
        />

        <LibrarySection activeTab={activeTab} setActiveTab={setActiveTab} />

        <ProfileEditSection
          activeTab={activeTab}
          currentUser={currentUser}
          onUpdateUser={handleUpdateUser}
        />
      </div>
    </div>
  );
};

export default Dashboard;
