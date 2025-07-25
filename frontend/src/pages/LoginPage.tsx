import React, { useState } from "react";
import { FaPlay, FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import SocialAuthButtons from "../components/SocialAuthButtons";

const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // TODO: Implement email login logic
      console.log("Email login:", { email, password });
      // Simulate API call
      await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }).then((res) => {
        if (!res.ok) {
          throw new Error("Login failed");
        }
      });
      alert("Login successful!");
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please try again.");
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
              <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
              <p className="text-gray-400">Sign in to your Hypertube account</p>
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

            {/* Email Login Form */}
            <LoginForm onSubmit={handleEmailLogin} isLoading={isLoading} />

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
    </div>
  );
};

export default LoginPage;
