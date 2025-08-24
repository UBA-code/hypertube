import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlay, FaStar } from "react-icons/fa";
import { RiMovie2Line } from "react-icons/ri";
import type { WatchedMovie } from "../types/movie";

interface WatchedMovieItemProps {
  movie: WatchedMovie;
}

const WatchedMovieItem: React.FC<WatchedMovieItemProps> = ({ movie }) => {
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  // Handle play button click to navigate to movie details page
  const handlePlayClick = () => {
    navigate(`/movies/${movie.imdbId}`);
  };

  return (
    <div
      className="flex items-center bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition cursor-pointer"
      onClick={handlePlayClick}
    >
      <div className="w-32 h-48 flex-shrink-0">
        {!imageError ? (
          <img
            src={movie.coverImage}
            alt={movie.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
            <RiMovie2Line className="text-3xl text-gray-500" />
          </div>
        )}
      </div>

      <div className="flex-1 p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg">{movie.title}</h3>
          <span className="text-gray-400 text-sm">
            {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
          </span>
        </div>

        <div className="flex items-center mb-2">
          <FaStar className="text-yellow-500 mr-1" />
          <span className="text-sm text-gray-300 mr-4">
            {movie.imdbRating}/10
          </span>
          <span className="text-sm text-gray-400">({movie.year})</span>
        </div>

        <p
          className="text-sm text-gray-400 overflow-hidden"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical" as const,
          }}
        >
          {movie.synopsis}
        </p>
      </div>

      <button
        onClick={handlePlayClick}
        className="mr-4 w-12 h-12 bg-gradient-to-r from-red-600 to-purple-600 rounded-full flex items-center justify-center hover:opacity-90 transition"
      >
        <FaPlay className="ml-1 text-lg" />
      </button>
    </div>
  );
};

export default WatchedMovieItem;
