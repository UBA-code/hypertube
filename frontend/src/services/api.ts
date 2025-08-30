import axios from "axios";

// Create axios instance with default configuration
const api = axios.create({
	baseURL: "http://localhost:3000",
	withCredentials: true, // Include cookies for authentication
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor for logging or adding auth headers
api.interceptors.request.use(
	(config) => {
		// You can add request logging here if needed
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor for error handling
api.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		// Handle common errors here
		if (error.response?.status === 401) {
			const redirectTo = error.response?.data?.redirectTo;
			if (redirectTo && window.location.href !== redirectTo) {
				window.location.href = redirectTo;
			} else if (window.location.pathname !== "/login") {
				window.location.href = "/login";
			}
		}
		return Promise.reject(error);
	}
);

export default api;
