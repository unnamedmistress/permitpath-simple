#!/bin/bash
# Build script for OpenClaw Browser Relay extension with offscreen document fix

set -e

EXT_DIR="$(cd "$(dirname "$0")" && pwd)"
BUILD_DIR="${EXT_DIR}/dist"

echo "Building OpenClaw Browser Relay extension..."

# Clean build directory
rm -rf "${BUILD_DIR}"
mkdir -p "${BUILD_DIR}"

# Copy extension files
cp "${EXT_DIR}/manifest.json" "${BUILD_DIR}/"
cp "${EXT_DIR}/background.js" "${BUILD_DIR}/"
cp "${EXT_DIR}/offscreen.html" "${BUILD_DIR}/"
cp "${EXT_DIR}/offscreen.js" "${BUILD_DIR}/"
cp "${EXT_DIR}/popup.html" "${BUILD_DIR}/"
cp "${EXT_DIR}/popup.js" "${BUILD_DIR}/"

# Generate icons if ImageMagick is available
if command -v convert &> /dev/null; then
    echo "Generating icons..."
    convert "${EXT_DIR}/icon.svg" -resize 16x16 "${BUILD_DIR}/icon16.png"
    convert "${EXT_DIR}/icon.svg" -resize 48x48 "${BUILD_DIR}/icon48.png"
    convert "${EXT_DIR}/icon.svg" -resize 128x128 "${BUILD_DIR}/icon128.png"
else
    echo "ImageMagick not found, copying SVG as placeholder..."
    cp "${EXT_DIR}/icon.svg" "${BUILD_DIR}/icon.svg"
fi

echo "Build complete: ${BUILD_DIR}"
echo ""
echo "To install:"
echo "1. Open Chrome → chrome://extensions"
echo "2. Enable Developer mode"
echo "3. Click 'Load unpacked'"
echo "4. Select: ${BUILD_DIR}"
