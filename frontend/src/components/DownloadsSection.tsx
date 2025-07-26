import React from "react";
import { MdDownload } from "react-icons/md";

interface DownloadsSectionProps {
  activeTab: string;
}

const DownloadsSection: React.FC<DownloadsSectionProps> = ({ activeTab }) => {
  if (activeTab !== "downloads") {
    return null;
  }

  return (
    <section>
      <h2 className="text-xl font-bold mb-6 flex items-center">
        <MdDownload className="mr-2 text-red-500" />
        Your Downloads
      </h2>

      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <MdDownload className="mx-auto text-4xl text-gray-600 mb-4" />
        <h3 className="text-xl font-bold">No downloads yet</h3>
        <p className="text-gray-500 mb-4">Download movies to watch offline</p>
        <button className="px-4 py-2 bg-gradient-to-r from-red-600 to-purple-600 rounded-lg hover:opacity-90 transition">
          Find Movies to Download
        </button>
      </div>
    </section>
  );
};

export default DownloadsSection;
