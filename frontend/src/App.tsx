import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import SearchResults from "./pages/SearchResults";
import MovieDetails from "./pages/MovieDetails";
import "./index.css";
import Dashboard from "./pages/DashBoard";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/results" element={<SearchResults />} />
          <Route path="/movies/:imdbId" element={<MovieDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
