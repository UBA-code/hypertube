import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaTimes } from "react-icons/fa";
import api from "../services/api.ts";

interface SearchResult {
  imdbId: string;
  title: string;
  year: number;
  coverImage: string;
  imdbRating?: number; // Make optional since it might be missing
}

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  defaultValue?: string; // Add default value prop
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search movies...",
  className = "relative w-full max-w-md",
  defaultValue = "",
}) => {
  const [searchQuery, setSearchQuery] = useState(defaultValue);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | undefined>(undefined);

  // Update search query if defaultValue changes
  useEffect(() => {
    setSearchQuery(defaultValue);
  }, [defaultValue]);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get("/auth/me");
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Debounced search function
  const performLiveSearch = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      setSelectedIndex(-1);
      return;
    }

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      console.log("Performing live search for:", query); // Debug log
      const response = await api.get(
        `/movies/search?query=${encodeURIComponent(query)}&limit=5`
      );

      console.log("Search response:", response.data); // Debug log
      // Handle both direct array and wrapped response formats
      const results: SearchResult[] = Array.isArray(response.data)
        ? response.data
        : response.data.movies || [];
      console.log("Processed results:", results); // Debug log
      setSearchResults(results);
      setShowResults(results.length > 0 || query.trim().length >= 2);
      setSelectedIndex(-1); // Reset selection
    } catch (error) {
      console.error("Live search error:", error);
      setSearchResults([]);
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounce
    debounceRef.current = setTimeout(() => {
      performLiveSearch(value);
    }, 300);
  };

  // Handle result click
  const handleResultClick = (imdbId: string) => {
    setShowResults(false);
    setSearchQuery("");
    navigate(`/movies/${imdbId}`);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
    setSelectedIndex(-1);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || searchResults.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          e.preventDefault();
          handleResultClick(searchResults[selectedIndex].imdbId);
        }
        break;
      case "Escape":
        setShowResults(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (!isAuthenticated) {
        navigate("/login");
        return;
      }

      // Navigate to full search results page
      navigate(`/results?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setShowResults(false);
    }
  };

  return (
    <div ref={searchRef} className={className}>
      <form onSubmit={handleSearchSubmit}>
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <FaSearch />
          </div>
          <input
            type="text"
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white placeholder-gray-400"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (searchResults.length > 0) {
                setShowResults(true);
              }
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </form>

      {/* Live Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto search-results animate-scaleIn">
          {loading ? (
            <div className="p-4 text-center text-gray-400">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-red-600 border-t-transparent mx-auto mb-2"></div>
              Searching...
            </div>
          ) : searchResults.length > 0 ? (
            <div className="py-2">
              {searchResults.map((movie, index) => (
                <button
                  key={movie.imdbId}
                  onClick={() => handleResultClick(movie.imdbId)}
                  className={`w-full px-4 py-3 transition-colors text-left flex items-center space-x-3 ${index === selectedIndex
                      ? "bg-red-600 text-white"
                      : "hover:bg-gray-700 text-white"
                    }`}
                >
                  <div className="w-12 h-16 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                    {movie.coverImage ? (
                      <img
                        src={movie.coverImage}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4
                      className={`font-medium truncate ${index === selectedIndex ? "text-white" : "text-white"
                        }`}
                    >
                      {movie.title}
                    </h4>
                    <p
                      className={`text-sm ${index === selectedIndex
                          ? "text-red-100"
                          : "text-gray-400"
                        }`}
                    >
                      {movie.year} • ⭐{" "}
                      {movie.imdbRating ? movie.imdbRating.toFixed(1) : "N/A"}
                    </p>
                  </div>
                </button>
              ))}
              {searchQuery.trim() && (
                <div className="border-t border-gray-700 pt-2 pb-1">
                  <button
                    onClick={() => {
                      navigate(
                        `/results?query=${encodeURIComponent(
                          searchQuery.trim()
                        )}`
                      );
                      setShowResults(false);
                      setSearchQuery("");
                    }}
                    className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 transition-colors"
                  >
                    See all results for "{searchQuery}"
                  </button>
                </div>
              )}
            </div>
          ) : searchQuery.trim().length >= 2 ? (
            <div className="p-4 text-center text-gray-400">
              No movies found for "{searchQuery}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
