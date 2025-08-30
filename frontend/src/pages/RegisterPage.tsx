import React, { useState, useEffect } from "react";
import { FaPlay, FaArrowLeft } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";
import SocialAuthButtons from "../components/SocialAuthButtons";
import Notification from "../components/Notification";
import api from "../services/api.ts";
import { AxiosError } from "axios";

const RegisterPage: React.FC = () => {
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
        await api.get("/auth/me");
        // If the response is successful (not 401), user is authenticated
        navigate("/dashboard");
      } catch (error) {
        console.log("Auth check failed:", error);
        // If there's an error, assume user is not authenticated and stay on page
      }
    };

    checkAuthStatus();
  }, [navigate]);

  const handleEmailRegister = async (userData: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    setIsLoading(true);
    try {
      // TODO: Implement email registration logic
      const x = {
        userName: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
      };
      console.log("Email registration:", x);

      const response = await api.post("/auth/register", x);

      if (response.status === 201 && response.data.success) {
        // Success case
        setNotification({
          message:
            response.data.message ||
            "Registration successful! Redirecting to dashboard...",
          type: "success",
        });

        // Navigate to dashboard after a short delay to show the success message
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      }
    } catch (error) {
      console.error("Registration failed:", error);

      // Handle axios error response
      let errorMessage = "Registration failed. Please try again.";

      if (error instanceof AxiosError) {
        if (error.response?.data?.message) {
          const msg = error.response.data.message;
          if (Array.isArray(msg)) {
            errorMessage = msg.join(", ");
          } else {
            errorMessage = msg;
          }
        } else if (error.request) {
          errorMessage = "Network error. Please check your connection and try again.";
        }
      }

      setNotification({
        message: errorMessage,
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
              <h1 className="text-3xl font-bold mb-2">Create Account</h1>
              <p className="text-gray-400">
                Join Hypertube and start streaming
              </p>
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

            {/* Email Registration Form */}
            <RegisterForm
              onSubmit={handleEmailRegister}
              isLoading={isLoading}
            />

            {/* Footer Links */}
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-red-500 hover:text-red-400 transition"
                >
                  Sign in
                </Link>
              </p>
              <p className="text-gray-500 text-xs mt-4">
                By creating an account, you agree to our{" "}
                <Link to="/terms" className="text-red-500 hover:text-red-400">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-red-500 hover:text-red-400">
                  Privacy Policy
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

export default RegisterPage;
