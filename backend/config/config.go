package config

import (
	"os"
	"sync"

	"github.com/joho/godotenv"
)

type Config struct {
	AppName          string
	Debug            bool
	AnthropicAPIKey  string
	AWSAccessKeyID   string
	AWSSecretKey     string
	AWSRegion        string
	Port             string
}

var (
	instance *Config
	once     sync.Once
)

func GetConfig() *Config {
	once.Do(func() {
		// Load .env file
		godotenv.Load()

		instance = &Config{
			AppName:          "NEXUS AI",
			Debug:            os.Getenv("DEBUG") == "true",
			AnthropicAPIKey:  os.Getenv("ANTHROPIC_API_KEY"),
			AWSAccessKeyID:   os.Getenv("AWS_ACCESS_KEY_ID"),
			AWSSecretKey:     os.Getenv("AWS_SECRET_ACCESS_KEY"),
			AWSRegion:        getEnvOrDefault("AWS_REGION", "us-east-1"),
			Port:             getEnvOrDefault("PORT", "8000"),
		}
	})
	return instance
}

func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

