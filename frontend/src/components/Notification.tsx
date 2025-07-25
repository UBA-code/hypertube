import React, { useEffect, useState } from "react";
import { FaTimes, FaExclamationCircle, FaCheckCircle } from "react-icons/fa";

interface NotificationProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({
  message,
  type,
  onClose,
  duration = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full transition-all duration-300 transform ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div
        className={`p-4 rounded-lg shadow-lg border-l-4 ${
          type === "success"
            ? "bg-green-800 border-green-500 text-green-100"
            : "bg-red-800 border-red-500 text-red-100"
        }`}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {type === "success" ? (
              <FaCheckCircle className="h-5 w-5 text-green-400" />
            ) : (
              <FaExclamationCircle className="h-5 w-5 text-red-400" />
            )}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium">{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleClose}
              className={`inline-flex rounded-md p-1.5 transition-colors ${
                type === "success"
                  ? "text-green-400 hover:text-green-300 hover:bg-green-700"
                  : "text-red-400 hover:text-red-300 hover:bg-red-700"
              }`}
            >
              <FaTimes className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification;
