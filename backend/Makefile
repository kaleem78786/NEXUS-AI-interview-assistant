.PHONY: build run dev clean test deps

# Build the application
build:
	go build -o bin/nexus-ai main.go

# Run the application
run: build
	./bin/nexus-ai

# Run with hot reload (using air if installed)
dev:
	go run main.go

# Clean build artifacts
clean:
	rm -rf bin/

# Run tests
test:
	go test -v ./...

# Download dependencies
deps:
	go mod download
	go mod tidy

# Build for Linux (for deployment)
build-linux:
	GOOS=linux GOARCH=amd64 go build -o bin/nexus-ai-linux main.go

# Build for production
build-prod:
	CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o bin/nexus-ai main.go

