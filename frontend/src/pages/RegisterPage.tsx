import React, { useState } from "react";
import { FaPlay, FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";
import SocialAuthButtons from "../components/SocialAuthButtons";
import Notification from "../components/Notification";

const RegisterPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

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

      const response = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(x),
      });

      const responseData = await response.json();

      if (response.status === 201 && responseData.success) {
        // Success case
        setNotification({
          message:
            responseData.message ||
            "Registration successful! Please check your email to verify your account.",
          type: "success",
        });
      } else {
        // Error case
        let errorMessage = "Registration failed. Please try again.";

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
      console.error("Registration failed:", error);
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
      window.location.href = "/auth/github";
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
      window.location.href = "/auth/google";
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
      window.location.href = "/auth/42";
    } catch (error) {
      console.error("42 auth failed:", error);
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
