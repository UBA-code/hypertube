import React from "react";
import { FaPlay, FaArrowLeft, FaEnvelope, FaCheckCircle, } from "react-icons/fa";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";

const CheckEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const navigate = useNavigate()

  // const handleResendEmail = async () => {
  //   if (!email) {
  //     setResendError("Email address is required to resend verification");
  //     return;
  //   }

  //   setIsResending(true);
  //   setResendError("");
  //   setResendSuccess(false);

  //   try {
  //     await api.post("/auth/resend-verification", { email });
  //     setResendSuccess(true);

  //     // Clear success message after 5 seconds
  //     setTimeout(() => {
  //       setResendSuccess(false);
  //     }, 5000);
  //   } catch (error) {
  //     console.error("Failed to resend verification email:", error);

  //     let errorMessage = "Failed to resend verification email. Please try again.";
  //     if (error instanceof AxiosError) {
  //       errorMessage = error.response?.data?.message || errorMessage;
  //     }

  //     setResendError(errorMessage);
  //   } finally {
  //     setIsResending(false);
  //   }
  // };

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
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-2xl text-center">
            {/* Email Icon */}
            <div className="mb-6">
              <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaEnvelope className="text-red-500 text-3xl" />
              </div>
            </div>

            {/* Title and Message */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-4">Check Your Email</h1>
              <p className="text-gray-400 text-lg mb-4">
                We've sent a verification link to your email address.
              </p>
              {email && (
                <p className="text-white font-medium mb-4">
                  {email}
                </p>
              )}
              <p className="text-gray-400 text-sm">
                Please check your inbox and click the verification link to activate your account.
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center justify-center">
                <FaCheckCircle className="text-green-500 mr-2" />
                What to do next:
              </h3>
              <ol className="text-left text-gray-300 space-y-2 text-sm">
                <li>1. Check your email inbox</li>
                <li>2. Look for an email from Hypertube</li>
                <li>3. Click the verification link in the email</li>
                <li>4. Return to login once verified</li>
              </ol>
            </div>

            {/* Didn't receive email section */}
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-4">
                Didn't receive the email? Check your spam folder
              </p>


              {/* <button
                onClick={handleResendEmail}
                disabled={isResending || !email}
                className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition font-medium mb-4"
              >
                <FaRedo className={`${isResending ? 'animate-spin' : ''}`} />
                <span>
                  {isResending ? 'Sending...' : 'Resend verification email'}
                </span>
              </button>


              {resendSuccess && (
                <div className="bg-green-600/20 border border-green-600 rounded-lg p-3 mb-4">
                  <p className="text-green-400 text-sm">
                    Verification email sent successfully! Please check your inbox.
                  </p>
                </div>
              )}


              {resendError && (
                <div className="bg-red-600/20 border border-red-600 rounded-lg p-3 mb-4">
                  <p className="text-red-400 text-sm">{resendError}</p>
                </div>
              )} */}

            </div>

            {/* Footer Links */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-gray-400 text-sm mb-4">
                Already verified your email?
              </p>
              <button
                className="inline-block px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-white font-medium"
                onClick={async () => {
                  await api.post("/auth/logout");
                  navigate("/login");
                }}
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckEmailPage;
