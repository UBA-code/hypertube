import React from "react";
import { FaSearch, FaGlobe, FaComment } from "react-icons/fa";
import { MdMovie, MdDownload, MdSecurity } from "react-icons/md";
import FeatureCard from "./FeatureCard";

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: <FaSearch className="text-3xl text-blue-500" />,
      title: "Advanced Search",
      description:
        "Find movies across multiple torrent sources with filters for quality, genre, and rating.",
    },
    {
      icon: <MdMovie className="text-3xl text-purple-500" />,
      title: "Instant Streaming",
      description:
        "Start watching immediately with our smart streaming technology - no waiting for downloads.",
    },
    {
      icon: <MdDownload className="text-3xl text-green-500" />,
      title: "Background Download",
      description:
        "Movies download seamlessly in the background while you watch.",
    },
    {
      icon: <FaGlobe className="text-3xl text-yellow-500" />,
      title: "Multi-language Subtitles",
      description:
        "Access subtitles in dozens of languages with auto-sync technology.",
    },
    {
      icon: <FaComment className="text-3xl text-red-500" />,
      title: "Community Interaction",
      description:
        "Discuss movies, share recommendations, and connect with other film lovers.",
    },
    {
      icon: <MdSecurity className="text-3xl text-indigo-500" />,
      title: "Secure Authentication",
      description:
        "Sign in with OAuth providers or email with industry-standard security.",
    },
  ];

  return (
    <section id="features" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powerful Features
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Hypertube combines the best of torrent technology with modern
            streaming for an unparalleled experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
