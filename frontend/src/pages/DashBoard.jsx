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
} from "../components";

// Mock API service that returns promises with data matching your plan structure
import { getPopularMovies, getWatchedMovies } from "../services/server";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [popularMovies, setPopularMovies] = useState([]);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("popular");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch("http://localhost:3000/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Include cookies for authentication
        });

        // If the response is not successful (401 or other error), user is not authenticated
        if (!response.ok) {
          navigate("/login");
          return;
        }

        // If successful, user is authenticated, get user data
        const userData = await response.json();
        setCurrentUser(userData);
      } catch {
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

        // Fetch movie data (user data is already fetched from auth check)
        const [popular, watched] = await Promise.all([
          getPopularMovies(),
          getWatchedMovies(),
        ]);

        setPopularMovies(popular);
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
      const response = await fetch("http://localhost:3000/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for authentication
      });

      if (response.ok) {
        // Logout successful, redirect to login page
        navigate("/login");
      } else {
        console.error("Logout failed:", response.statusText);
        // Even if logout fails on server, clear local state and redirect
        navigate("/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Even if there's a network error, redirect to login
      navigate("/login");
    }
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

        <PopularMoviesSection
          activeTab={activeTab}
          filteredMovies={popularMovies}
        />

        <WatchedMoviesSection
          activeTab={activeTab}
          watchedMovies={watchedMovies}
        />

        <LibrarySection activeTab={activeTab} />

        <DownloadsSection activeTab={activeTab} />
      </div>
    </div>
  );
};

export default Dashboard;
