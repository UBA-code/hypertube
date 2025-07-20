import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search movies...",
  className = "relative w-full max-w-md",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Check if user is authenticated before allowing search
      try {
        const response = await fetch("http://localhost:3000/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          // User not authenticated, redirect to login
          navigate("/login");
          return;
        }

        // User is authenticated, proceed with search
        navigate(`/results?query=${encodeURIComponent(searchQuery.trim())}`);
        setSearchQuery(""); // Clear the search after navigation
      } catch {
        // If auth check fails, redirect to login
        navigate("/login");
      }
    }
  };

  return (
    <form onSubmit={handleSearchSubmit} className={className}>
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        <FaSearch />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white placeholder-gray-400"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </form>
  );
};

export default SearchBar;
