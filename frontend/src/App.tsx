import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import CheckEmailPage from "./pages/CheckEmailPage";
import SearchResults from "./pages/SearchResults";
import MovieDetails from "./pages/MovieDetails";
import VideoPlayer from "./pages/VideoPlayer";
import "./index.css";
// @ts-expect-error - DashBoard is a .jsx file
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
          <Route
            path="/reset-password/:token"
            element={<ResetPasswordPage />}
          />
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
          <Route path="/check-email" element={<CheckEmailPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/results" element={<SearchResults />} />
          <Route path="/movies/:imdbId" element={<MovieDetails />} />
          <Route path="/player" element={<VideoPlayer />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
