import React from "react";
import EmailSignup from "./EmailSignup";

const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      step: "1",
      title: "Create Account",
      description: "Sign up in seconds with email or OAuth providers",
    },
    {
      step: "2",
      title: "Search & Select",
      description: "Find movies through our powerful search engine",
    },
    {
      step: "3",
      title: "Stream Instantly",
      description: "Click play and start watching immediately",
    },
    {
      step: "4",
      title: "Enjoy & Share",
      description: "Watch in HD, save favorites, and share with friends",
    },
  ];

  return (
    <section id="how-it-works" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How Hypertube Works
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Get started in minutes and enjoy unlimited streaming
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-600 to-purple-600 flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                {step.step}
              </div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-gray-400">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h3 className="text-2xl font-bold mb-4">
                Ready to start streaming?
              </h3>
              <p className="text-gray-400 mb-6">
                Join thousands of users enjoying ad-free HD streaming today. No
                credit card required.
              </p>
              <button className="px-6 py-3 bg-gradient-to-r from-red-600 to-purple-600 rounded-lg font-semibold hover:opacity-90 transition">
                Create Free Account
              </button>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <EmailSignup />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
