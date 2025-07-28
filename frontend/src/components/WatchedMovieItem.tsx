import React from "react";
import { FaPlay } from "react-icons/fa";
import { RiMovie2Line } from "react-icons/ri";

interface Movie {
  id: string;
  title: string;
  year: number;
  coverImage?: string;
  genres: string[];
  duration?: number;
}

interface WatchedMovieItemProps {
  movie: Movie;
}

const WatchedMovieItem: React.FC<WatchedMovieItemProps> = ({ movie }) => {
  const progress = Math.floor(Math.random() * 60) + 40;

  return (
    <div className="flex items-center bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition">
      <div className="w-24 h-24 flex-shrink-0">
        {movie.coverImage ? (
          <img
            src={movie.coverImage}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
            <RiMovie2Line className="text-2xl text-gray-500" />
          </div>
        )}
      </div>

      <div className="flex-1 p-4">
        <div className="flex justify-between">
          <h3 className="font-bold">{movie.title}</h3>
          <span className="text-gray-400">
            {movie.duration
              ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m`
              : "2h 15m"}
          </span>
        </div>

        <div className="text-sm text-gray-400 mb-2">
          {movie.genres.slice(0, 3).join(", ")} • {movie.year}
        </div>

        <div className="flex items-center">
          <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden mr-3">
            <div
              className="h-full bg-red-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="text-sm">{progress}%</span>
        </div>
      </div>

      <button className="mr-4 w-10 h-10 bg-gradient-to-r from-red-600 to-purple-600 rounded-full flex items-center justify-center hover:opacity-90 transition">
        <FaPlay className="ml-1" />
      </button>
    </div>
  );
};

export default WatchedMovieItem;
