import React from "react";
import TestimonialCard from "./TestimonialCard";

const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      name: "Alex Johnson",
      rating: 5,
      review:
        "Hypertube has completely changed how I watch movies. The streaming is seamless and the quality is amazing. Best of all, it's free!",
    },
    {
      name: "Sarah Davis",
      rating: 5,
      review:
        "Amazing platform! The search functionality is incredible and I love how quickly movies start playing. No more waiting for downloads!",
    },
    {
      name: "Mike Chen",
      rating: 5,
      review:
        "The subtitle support is fantastic. I can watch foreign films with perfect sync. This is the future of movie streaming!",
    },
  ];

  return (
    <section id="testimonials" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our Users Say
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Join thousands of satisfied users enjoying ad-free streaming
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              name={testimonial.name}
              rating={testimonial.rating}
              review={testimonial.review}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
