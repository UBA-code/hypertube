package config

import (
	"os"
	"strconv"
)

type Config struct {
	Port           string
	OAuth2ClientID string
	OAuth2Secret   string
	OAuth2Redirect string
	JWTSecret      string
	DatabaseURL    string
}

func Load() *Config {
	return &Config{
		Port:           getEnv("PORT", "1234"),
		OAuth2ClientID: getEnv("OAUTH2_CLIENT_ID", ""),
		OAuth2Secret:   getEnv("OAUTH2_SECRET", ""),
		OAuth2Redirect: getEnv("OAUTH2_REDIRECT_URL", "http://localhost:8080/auth/callback"),
		JWTSecret:      "secret",
		DatabaseURL:    getEnv("DATABASE_URL", "postgres://postgres:passwd@localhost:5432/db?sslmode=disable"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}
