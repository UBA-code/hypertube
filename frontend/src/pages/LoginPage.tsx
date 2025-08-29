import React, { useState, useEffect } from "react";
import { FaPlay, FaArrowLeft } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import SocialAuthButtons from "../components/SocialAuthButtons";
import Notification from "../components/Notification";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Check if user is already authenticated
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

        // If the response is successful (not 401), user is authenticated
        if (response.ok) {
          navigate("/dashboard");
        }
        // If 401, user is not authenticated, stay on login page
      } catch (error) {
        console.log("Auth check failed:", error);
        // If there's an error, assume user is not authenticated and stay on page
      }
    };

    checkAuthStatus();
  }, [navigate]);

  const handleUsernameLogin = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      // TODO: Implement username login logic
      console.log("username login:", { username, password });

      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for authentication
        body: JSON.stringify({ username, password }),
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        // Success case
        setNotification({
          message:
            responseData.message ||
            "Login successful! Redirecting to dashboard...",
          type: "success",
        });

        // Navigate to dashboard after a short delay to show the success message
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        // Error case
        let errorMessage = "Login failed. Please try again.";

        if (responseData.message) {
          if (Array.isArray(responseData.message)) {
            errorMessage = responseData.message.join(", ");
          } else {
            errorMessage = responseData.message;
          }
        }

        setNotification({
          message: errorMessage,
          type: "error",
        });
      }
    } catch (error) {
      console.error("Login failed:", error);
      setNotification({
        message: "Network error. Please check your connection and try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubAuth = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement GitHub OAuth
      console.log("GitHub OAuth initiated");
      window.location.href = "http://localhost:3000/auth/github";
    } catch (error) {
      console.error("GitHub auth failed:", error);
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement Google OAuth
      console.log("Google OAuth initiated");
      window.location.href = "http://localhost:3000/auth/google";
    } catch (error) {
      console.error("Google auth failed:", error);
      setIsLoading(false);
    }
  };

  const handle42Auth = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement 42 OAuth
      console.log("42 OAuth initiated");
      window.location.href = "http://localhost:3000/auth/42";
    } catch (error) {
      console.error("42 auth failed:", error);
      setIsLoading(false);
    }
  };

  const handleGitlabAuth = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement GitLab OAuth
      console.log("GitLab OAuth initiated");
      window.location.href = "http://localhost:3000/auth/gitlab";
    } catch (error) {
      console.error("GitLab auth failed:", error);
      setIsLoading(false);
    }
  };

  const handleDiscordAuth = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement Discord OAuth
      console.log("Discord OAuth initiated");
      window.location.href = "http://localhost:3000/auth/discord";
    } catch (error) {
      console.error("Discord auth failed:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <FaPlay className="text-red-600 text-3xl" />
          <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
            Hypertube
          </span>
        </Link>
        <Link
          to="/"
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition"
        >
          <FaArrowLeft />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
              <p className="text-gray-400">Sign in to your Hypertube account</p>
            </div>

            {/* Social Auth Buttons */}
            <SocialAuthButtons
              isLoading={isLoading}
              onGithubAuth={handleGithubAuth}
              onGoogleAuth={handleGoogleAuth}
              on42Auth={handle42Auth}
              onGitlabAuth={handleGitlabAuth}
              onDiscordAuth={handleDiscordAuth}
            />

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-700"></div>
              <span className="px-4 text-gray-400 text-sm">or</span>
              <div className="flex-1 border-t border-gray-700"></div>
            </div>

            {/* Username Login Form */}
            <LoginForm onSubmit={handleUsernameLogin} isLoading={isLoading} />

            {/* Footer Links */}
            <div className="mt-6 text-center space-y-2">
              <Link
                to="/forgot-password"
                className="text-red-500 hover:text-red-400 text-sm transition"
              >
                Forgot your password?
              </Link>
              <p className="text-gray-400 text-sm">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-red-500 hover:text-red-400 transition"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default LoginPage;
