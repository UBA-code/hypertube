import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
          Tailwind CSS Test
        </h1>

        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Counter Test
            </h2>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-blue-600">{count}</span>
              <button
                onClick={() => setCount((count) => count + 1)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Increment
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="h-16 bg-red-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold">Red</span>
            </div>
            <div className="h-16 bg-green-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold">Green</span>
            </div>
            <div className="h-16 bg-yellow-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold">Yellow</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-600 text-sm">
              If you can see styled colors and responsive layout, Tailwind is
              working! 🎉
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
