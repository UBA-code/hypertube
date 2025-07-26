import React from "react";

interface User {
  userName: string;
  firstName?: string;
}

interface WelcomeMessageProps {
  currentUser: User | null;
}

const DashboardWelcomeMessage: React.FC<WelcomeMessageProps> = ({
  currentUser,
}) => {
  return (
    <div className="mb-8">
      <h1 className="text-2xl md:text-3xl font-bold">
        Welcome back,{" "}
        <span className="bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
          {currentUser?.firstName || currentUser?.userName}
        </span>
      </h1>
      <p className="text-gray-400">Ready to continue your movie journey?</p>
    </div>
  );
};

export default DashboardWelcomeMessage;
