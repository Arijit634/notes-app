#!/bin/bash

# Development Startup Script
# This script starts both frontend and backend for local development

echo "🚀 Starting Notes App Development Environment"
echo "============================================="
echo ""

# Check if PostgreSQL is running
echo "📊 Checking PostgreSQL connection..."
if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "✅ PostgreSQL is running on localhost:5432"
else
    echo "❌ PostgreSQL is not running on localhost:5432"
    echo "Please start PostgreSQL service before running this script"
    echo "Make sure your database 'notes' exists with user 'postgres' and password 'manage'"
    exit 1
fi

echo ""

# Start backend in development mode
echo "🔧 Starting Backend (Spring Boot) on port 5000..."
cd "notes-backend"
export SPRING_PROFILES_ACTIVE=dev
mvn spring-boot:run -DskipTests &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait a moment for backend to start
sleep 5

echo ""

# Start frontend in development mode  
echo "🎨 Starting Frontend (React + Vite) on port 3000..."
cd "../notes-frontend"
npm run dev &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo "🎉 Development environment started!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:5000"
echo "📚 Swagger: http://localhost:5000/swagger-ui.html"
echo ""
echo "Press Ctrl+C to stop both services"

# Function to cleanup when script exits
cleanup() {
    echo ""
    echo "🛑 Stopping development servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "✅ Cleanup complete"
    exit 0
}

# Trap cleanup function on script exit
trap cleanup INT TERM

# Wait for both processes
wait
