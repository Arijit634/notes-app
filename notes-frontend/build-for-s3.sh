#!/bin/bash

# Build script for S3 deployment
echo "🚀 Building Notes Frontend for S3 Deployment..."

# Set environment
export NODE_ENV=production

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist

# Install dependencies (if needed)
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Build files are in the 'dist' directory"
    echo "🌐 Ready for S3 deployment"
    
    # Show build stats
    echo "📊 Build statistics:"
    du -sh dist
    find dist -name "*.js" -o -name "*.css" -o -name "*.html" | wc -l | xargs echo "Total files:"
else
    echo "❌ Build failed!"
    exit 1
fi
