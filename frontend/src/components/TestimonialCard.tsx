import React from "react";
import { FaUser } from "react-icons/fa";

interface TestimonialCardProps {
  name: string;
  rating: number;
  review: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  name,
  rating,
  review,
}) => {
  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mr-4">
          <FaUser className="text-xl" />
        </div>
        <div>
          <h4 className="font-bold">{name}</h4>
          <div className="flex text-yellow-400">{"★".repeat(rating)}</div>
        </div>
      </div>
      <p className="text-gray-300">{review}</p>
    </div>
  );
};

export default TestimonialCard;
