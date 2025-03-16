#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Build the project
echo "Building the project..."
make

# Create a release tag
echo "Creating a release tag..."
TAG_NAME="release-$(date +%Y%m%d%H%M%S)"
git tag -a $TAG_NAME -m "Release $TAG_NAME"

# Push the release tag to the repository
echo "Pushing the release tag to the repository..."
git push origin $TAG_NAME

echo "Release process completed successfully."
