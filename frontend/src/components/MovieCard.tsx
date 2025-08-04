import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlay, FaHeart, FaRegHeart } from "react-icons/fa";
import { MdDownload } from "react-icons/md";
import { RiMovie2Line } from "react-icons/ri";

interface Movie {
  imdbId: string;
  title: string;
  year: number;
  coverImage?: string;
  imdbRating?: number;
  genres: string[];
  duration: number;
  isWatched: boolean;
  isFavorite: boolean;
  synopsis: string;
  cast: {
    actors: string[];
    directors: string[];
    producers: string[];
  };
  torrents: Array<{
    quality?: string;
    size?: string;
    seeders?: number;
    leechers?: number;
  }>;
  subtitles: Array<{
    language: string;
    url: string;
  }>;
  comments: Array<{
    id: string;
    content: string;
    user: string;
    timestamp: string;
  }>;
  streamUrl: string;
  lastWatched: string | null;
}

interface MovieCardProps {
  movie: Movie;
  type?: "standard" | "watched";
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, type = "standard" }) => {
  const [isFavorite, setIsFavorite] = useState(movie.isFavorite);
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false);
  const navigate = useNavigate();

  // Function to toggle favorite status
  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation to movie details

    if (isUpdatingFavorite) return; // Prevent multiple clicks

    setIsUpdatingFavorite(true);
    const newFavoriteStatus = !isFavorite;

    try {
      const response = await fetch(
        `http://localhost:3000/movies/favorite/${movie.imdbId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ setTo: newFavoriteStatus }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to update favorite status: ${response.statusText}`
        );
      }

      // Update local state only if API call was successful
      setIsFavorite(newFavoriteStatus);
    } catch (error) {
      console.error("Error updating favorite status:", error);
      // Optionally show a notification to the user about the error
    } finally {
      setIsUpdatingFavorite(false);
    }
  };

  // Function to get rating color based on IMDB score (0.0 = red, 10.0 = green)
  const getRatingColor = (rating: number): string => {
    // Normalize rating to 0-1 scale
    const normalized = Math.max(0, Math.min(10, rating)) / 10;

    // Interpolate between red (0) and green (1)
    // Red: rgb(239, 68, 68) - Tailwind red-500
    // Green: rgb(34, 197, 94) - Tailwind green-500
    const red = Math.round(239 - (239 - 34) * normalized);
    const green = Math.round(68 + (197 - 68) * normalized);
    const blue = Math.round(68 + (94 - 68) * normalized);

    return `rgb(${red}, ${green}, ${blue})`;
  };

  // Format rating to 1 decimal place
  const formatRating = (rating: number): string => {
    return rating.toFixed(1);
  };

  // Handle movie click to navigate to details page
  const handleMovieClick = () => {
    navigate(`/movies/${movie.imdbId}`);
  };

  return (
    <div className="group relative cursor-pointer" onClick={handleMovieClick}>
      <div className="aspect-[2/3] bg-gray-800 rounded-lg overflow-hidden relative">
        {movie.coverImage ? (
          <img
            src={movie.coverImage}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
            <RiMovie2Line className="text-4xl text-gray-500" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="flex justify-between items-center">
              <button className="w-10 h-10 bg-gradient-to-r from-red-600 to-purple-600 rounded-full flex items-center justify-center hover:opacity-90 transition">
                <FaPlay className="ml-1" />
              </button>

              <button
                className={`w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center hover:bg-opacity-100 transition ${
                  isUpdatingFavorite ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={toggleFavorite}
                disabled={isUpdatingFavorite}
              >
                {isFavorite ? (
                  <FaHeart className="text-red-500" />
                ) : (
                  <FaRegHeart className="text-white" />
                )}
              </button>
            </div>
          </div>
        </div>

        {type === "watched" && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
            <div
              className="h-full bg-red-500"
              style={{ width: `${Math.floor(Math.random() * 60) + 40}%` }}
            ></div>
          </div>
        )}

        {movie.imdbRating && (
          <div
            className="absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded text-white"
            style={{ backgroundColor: getRatingColor(movie.imdbRating) }}
          >
            {formatRating(movie.imdbRating)}
          </div>
        )}
      </div>

      <div className="mt-3">
        <h3 className="font-semibold truncate">{movie.title}</h3>
        <div className="flex justify-between text-sm text-gray-400">
          <span>{movie.year}</span>
          <span className="flex items-center">
            <MdDownload className="mr-1" />
            {movie.torrents?.[0]?.size || "1.2 GB"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
