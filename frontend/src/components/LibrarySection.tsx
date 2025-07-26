import React from "react";
import { MdLocalMovies } from "react-icons/md";

interface LibrarySectionProps {
  activeTab: string;
}

const LibrarySection: React.FC<LibrarySectionProps> = ({ activeTab }) => {
  if (activeTab !== "library") {
    return null;
  }

  return (
    <section>
      <h2 className="text-xl font-bold mb-6 flex items-center">
        <MdLocalMovies className="mr-2 text-red-500" />
        Your Movie Library
      </h2>

      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <MdLocalMovies className="mx-auto text-4xl text-gray-600 mb-4" />
        <h3 className="text-xl font-bold">Your library is empty</h3>
        <p className="text-gray-500 mb-4">
          Add movies to your library to watch later
        </p>
        <button className="px-4 py-2 bg-gradient-to-r from-red-600 to-purple-600 rounded-lg hover:opacity-90 transition">
          Browse Movies
        </button>
      </div>
    </section>
  );
};

export default LibrarySection;
