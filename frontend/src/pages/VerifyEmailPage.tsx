import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api.ts";
import { AxiosError } from "axios";

interface VerificationState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

const VerifyEmailPage = () => {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<VerificationState>({
    loading: true,
    success: false,
    error: null,
  });

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setState({
          loading: false,
          success: false,
          error: "Invalid verification token",
        });
        return;
      }

      try {
        await api.get(`/auth/verify-email/${token}`);

        setState({
          loading: false,
          success: true,
          error: null,
        });
      } catch (error) {
        let errorMessage = "Email verification failed";

        if (error instanceof AxiosError) {
          errorMessage = error.response?.data?.message || errorMessage;
        }

        setState({
          loading: false,
          success: false,
          error: errorMessage,
        });
      }
    };

    verifyEmail();
  }, [token]);

  if (state.loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-gray-900 p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Verifying Email
            </h2>
            <p className="text-gray-300">
              Please wait while we verify your email address...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (state.success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-gray-900 p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Email Verified Successfully!
            </h2>
            <p className="text-gray-300 mb-6">
              Your email address has been verified. You can now access all
              features of Hypertube.
            </p>
            <Link
              to="/login"
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition duration-300 inline-block text-center"
            >
              Go to website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Email Verification Failed
          </h2>
          <p className="text-gray-300 mb-6">
            {state.error ||
              "Unable to verify your email address. The token may be invalid or expired."}
          </p>
          <div className="space-y-3">
            <Link
              to="/register"
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition duration-300 inline-block text-center"
            >
              Register Again
            </Link>
            <Link
              to="/login"
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition duration-300 inline-block text-center"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
