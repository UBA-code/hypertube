import React, { useState, useEffect } from "react";
import { FaPlay, FaArrowLeft, FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../services/api.ts";
import { AxiosError } from "axios";

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    newPassword: false,
    confirmPassword: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if token exists in URL
    if (!token) {
      setError("Invalid reset link");
    }
  }, [token]);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password must contain at least one number";
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return "Password must contain at least one special character";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.newPassword || !formData.confirmPassword) {
      setError("All fields are required");
      return;
    }

    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!token) {
      setError("Invalid reset token");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/auth/reset-password", {
        newPassword: formData.newPassword,
        token: token,
      });

      setIsSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error: unknown) {
      console.error("Password reset failed:", error);
      let errorMessage = "Failed to reset password. Please try again.";

      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const togglePasswordVisibility = (
    field: "newPassword" | "confirmPassword"
  ) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field],
    });
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
          to="/login"
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition"
        >
          <FaArrowLeft />
          <span>Back to Login</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-2xl">
            {!isSuccess ? (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
                  <p className="text-gray-400">Enter your new password below</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* New Password */}
                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-medium mb-2"
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        id="newPassword"
                        name="newPassword"
                        type={showPassword.newPassword ? "text" : "password"}
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-12 py-3 bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${error ? "border-red-500" : "border-gray-700"
                          }`}
                        placeholder="Enter new password"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("newPassword")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword.newPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium mb-2"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={
                          showPassword.confirmPassword ? "text" : "password"
                        }
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-12 py-3 bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${error ? "border-red-500" : "border-gray-700"
                          }`}
                        placeholder="Confirm new password"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          togglePasswordVisibility("confirmPassword")
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword.confirmPassword ? (
                          <FaEyeSlash />
                        ) : (
                          <FaEye />
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-900/20 border border-red-500 rounded-lg p-3">
                      <p className="text-red-500 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Password Requirements */}
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <p className="text-sm font-medium mb-2">
                      Password must contain:
                    </p>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• At least 8 characters</li>
                      <li>• One uppercase letter</li>
                      <li>• One lowercase letter</li>
                      <li>• One number</li>
                      <li>• One special character (@$!%*?&)</li>
                    </ul>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !token}
                    className="w-full py-3 bg-gradient-to-r from-red-600 to-purple-600 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Resetting Password..." : "Reset Password"}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaLock className="text-2xl text-white" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Password Reset!</h1>
                <p className="text-gray-400 mb-6">
                  Your password has been successfully reset.
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  You will be redirected to the login page in a few seconds...
                </p>
                <Link
                  to="/login"
                  className="inline-block px-6 py-2 bg-gradient-to-r from-red-600 to-purple-600 rounded-lg font-semibold hover:opacity-90 transition"
                >
                  Go to Login
                </Link>
              </div>
            )}

            {/* Footer Links */}
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-red-500 hover:text-red-400 text-sm transition"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResetPasswordPage;
