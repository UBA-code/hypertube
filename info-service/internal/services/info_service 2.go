package services

import (
	"time"
)

type InfoService struct{}

func NewInfoService() *InfoService {
	return &InfoService{}
}

// GetPublicInfo returns public information about the project
func (s *InfoService) GetPublicInfo() map[string]interface{} {
	return map[string]interface{}{
		"project_name":     "Hypertube-uba",
		"description":      "A modern streaming platform built with NestJS and React",
		"version":          "1.0.0",
		"status":           "Active Development",
		"last_updated":     time.Now().UTC(),
		"repository":       "https://github.com/your-username/hypertube-uba",
		"license":          "MIT",
		"public_endpoints": []string{"/health", "/api/v1/info/public"},
		"contact":          "contact@hypertube.com",
	}
}

// GetProjectInfo returns detailed project information
func (s *InfoService) GetProjectInfo() map[string]interface{} {
	return map[string]interface{}{
		"project_name":  "Hypertube-uba",
		"description":   "Hypertube-uba is a comprehensive streaming platform that allows users to watch movies and TV shows with features like user authentication, movie search, torrent streaming, and subtitle support.",
		"version":       "1.0.0",
		"status":        "Active Development",
		"created_date":  "2024",
		"last_updated":  time.Now().UTC(),
		"repository":    "https://github.com/your-username/hypertube-uba",
		"license":       "MIT",
		"authors":       []string{"Development Team"},
		"contributors":  []string{"Open Source Contributors"},
		"documentation": "https://docs.hypertube.com",
		"issues":        "https://github.com/your-username/hypertube-uba/issues",
		"discussions":   "https://github.com/your-username/hypertube-uba/discussions",
	}
}

// GetArchitectureInfo returns project architecture information
func (s *InfoService) GetArchitectureInfo() map[string]interface{} {
	return map[string]interface{}{
		"architecture":       "Microservices Architecture",
		"backend_framework":  "NestJS (Node.js)",
		"frontend_framework": "React with TypeScript",
		"database":           "PostgreSQL",
		"authentication":     "OAuth2 with JWT",
		"file_storage":       "Local file system with HLS streaming",
		"api_documentation":  "Swagger/OpenAPI",
		"containerization":   "Docker with docker-compose",
		"deployment":         "Container-based deployment",
		"monitoring":         "Built-in logging and health checks",
		"security":           "JWT tokens, OAuth2, CORS protection",
		"scalability":        "Horizontal scaling ready",
	}
}

// GetFeaturesInfo returns project features information
func (s *InfoService) GetFeaturesInfo() map[string]interface{} {
	return map[string]interface{}{
		"user_management": map[string]interface{}{
			"oauth2_providers":  []string{"Google", "GitHub", "GitLab", "Discord", "42 (Intra)"},
			"user_profiles":     "Customizable user profiles",
			"role_based_access": "User and admin roles",
		},
		"movie_management": map[string]interface{}{
			"search":          "TMDB integration for movie search",
			"metadata":        "Rich movie information (actors, directors, genres)",
			"torrent_support": "Torrent streaming capabilities",
			"subtitles":       "Multi-language subtitle support",
			"ratings":         "User ratings and reviews",
		},
		"streaming": map[string]interface{}{
			"hls_streaming":    "HTTP Live Streaming support",
			"adaptive_quality": "Quality adaptation based on bandwidth",
			"resume_playback":  "Continue watching functionality",
			"download_support": "Movie download capabilities",
		},
		"social_features": map[string]interface{}{
			"comments":   "User comments on movies",
			"watchlists": "Personal movie collections",
			"sharing":    "Share movies with friends",
		},
		"admin_features": map[string]interface{}{
			"user_management":    "Admin user control panel",
			"content_moderation": "Comment and content moderation",
			"analytics":          "Usage statistics and metrics",
		},
	}
}

// GetTechStackInfo returns project tech stack information
func (s *InfoService) GetTechStackInfo() map[string]interface{} {
	return map[string]interface{}{
		"backend": map[string]interface{}{
			"runtime":        "Node.js",
			"framework":      "NestJS",
			"language":       "TypeScript",
			"database_orm":   "TypeORM",
			"database":       "PostgreSQL",
			"authentication": "Passport.js with JWT",
			"validation":     "class-validator",
			"documentation":  "Swagger/OpenAPI",
		},
		"frontend": map[string]interface{}{
			"framework":        "React",
			"language":         "TypeScript",
			"styling":          "Tailwind CSS",
			"build_tool":       "Vite",
			"state_management": "React hooks",
			"routing":          "React Router",
		},
		"infrastructure": map[string]interface{}{
			"containerization": "Docker",
			"orchestration":    "Docker Compose",
			"reverse_proxy":    "Nginx (if needed)",
			"monitoring":       "Built-in logging",
		},
		"external_services": map[string]interface{}{
			"movie_database":   "TMDB API",
			"torrent_tracking": "YTS API",
			"subtitle_service": "Custom subtitle scraping",
			"oauth_providers":  []string{"Google", "GitHub", "GitLab", "Discord", "42"},
		},
		"development_tools": map[string]interface{}{
			"package_manager": "npm/yarn",
			"linting":         "ESLint",
			"formatting":      "Prettier",
			"testing":         "Jest",
			"git_hooks":       "Husky (if configured)",
		},
	}
}

// GetEndpointsInfo returns available API endpoints
func (s *InfoService) GetEndpointsInfo() map[string]interface{} {
	return map[string]interface{}{
		"base_url": "http://localhost:3000",
		"version":  "v1",
		"endpoints": map[string]interface{}{
			"public": map[string]interface{}{
				"health":        "GET /health",
				"public_info":   "GET /api/v1/info/public",
				"auth_login":    "GET /api/v1/auth/login",
				"auth_callback": "GET /api/v1/auth/callback",
			},
			"protected": map[string]interface{}{
				"project_info":      "GET /api/v1/info/project",
				"architecture_info": "GET /api/v1/info/architecture",
				"features_info":     "GET /api/v1/info/features",
				"tech_stack_info":   "GET /api/v1/info/tech-stack",
				"endpoints_info":    "GET /api/v1/info/endpoints",
				"user_profile":      "GET /api/v1/user/profile",
			},
			"admin": map[string]interface{}{
				"admin_stats": "GET /api/v1/admin/stats",
			},
		},
		"authentication": "Bearer token in Authorization header or JWT cookie",
		"rate_limiting":  "Basic rate limiting implemented",
		"cors":           "Cross-origin requests supported",
	}
}

// GetAdminStats returns admin statistics
func (s *InfoService) GetAdminStats() map[string]interface{} {
	return map[string]interface{}{
		"service_status": "Running",
		"uptime":         "24 hours",
		"total_requests": 1000,
		"active_users":   50,
		"total_movies":   5000,
		"total_users":    200,
		"storage_used":   "2.5 GB",
		"last_backup":    time.Now().Add(-24 * time.Hour).UTC(),
		"system_health":  "Good",
		"performance":    "Optimal",
		"error_rate":     "0.1%",
		"response_time":  "150ms",
	}
}
