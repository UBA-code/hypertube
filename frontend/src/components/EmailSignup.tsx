import React, { useState } from "react";

const EmailSignup: React.FC = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Thank you! We'll notify you at ${email} when Hypertube launches.`);
    setEmail("");
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md">
      <h4 className="font-bold mb-4">Join our waiting list</h4>
      <p className="text-gray-400 text-sm mb-4">
        We're launching soon! Enter your email to get early access.
      </p>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className="bg-gray-800 border border-gray-700 rounded-l-lg px-4 py-2 w-full focus:outline-none focus:border-red-500"
          required
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-red-600 to-purple-600 px-4 rounded-r-lg font-medium"
        >
          Notify Me
        </button>
      </form>
    </div>
  );
};

export default EmailSignup;
