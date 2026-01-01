#!/bin/bash

# Quantum Pi Forge - Logo Variation Generator
# Generates all logo sizes and formats from master logo

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
MASTER_LOGO="logos/quantum-pi-forge-logo.png"
OUTPUT_DIR="logos"

echo "🎨 Quantum Pi Forge Logo Generator"
echo "===================================="
echo ""

# Check if master logo exists
if [ ! -f "$MASTER_LOGO" ]; then
    echo -e "${RED}❌ Error: Master logo not found at $MASTER_LOGO${NC}"
    echo ""
    echo "Please upload your master logo as: $MASTER_LOGO"
    echo "Then run this script again."
    exit 1
fi

# Check for ImageMagick
if ! command -v convert &> /dev/null; then
    echo -e "${RED}❌ Error: ImageMagick not installed${NC}"
    echo ""
    echo "Install with:"
    echo "  Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "  macOS: brew install imagemagick"
    echo "  Windows: choco install imagemagick"
    exit 1
fi

echo -e "${GREEN}✓ Master logo found${NC}"
echo -e "${GREEN}✓ ImageMagick installed${NC}"
echo ""

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

echo "Generating PNG variations..."

# Standard sizes
convert "$MASTER_LOGO" -resize 512x512 "$OUTPUT_DIR/quantum-pi-forge-logo-512.png"
echo "  ✓ 512x512"

convert "$MASTER_LOGO" -resize 256x256 "$OUTPUT_DIR/quantum-pi-forge-logo-256.png"
echo "  ✓ 256x256"

convert "$MASTER_LOGO" -resize 128x128 "$OUTPUT_DIR/quantum-pi-forge-logo-128.png"
echo "  ✓ 128x128"

convert "$MASTER_LOGO" -resize 64x64 "$OUTPUT_DIR/quantum-pi-forge-logo-64.png"
echo "  ✓ 64x64"

convert "$MASTER_LOGO" -resize 32x32 "$OUTPUT_DIR/quantum-pi-forge-logo-32.png"
echo "  ✓ 32x32"

convert "$MASTER_LOGO" -resize 16x16 "$OUTPUT_DIR/quantum-pi-forge-logo-16.png"
echo "  ✓ 16x16"

echo ""
echo "Generating social media formats..."

# Social media sizes
convert "$MASTER_LOGO" -resize 1200x1200 "$OUTPUT_DIR/quantum-pi-forge-logo-social.png"
echo "  ✓ 1200x1200 (social square)"

convert "$MASTER_LOGO" -resize 1200x630 -gravity center -extent 1200x630 "$OUTPUT_DIR/quantum-pi-forge-logo-banner.png"
echo "  ✓ 1200x630 (social banner)"

echo ""
echo "Generating favicon formats..."

# Favicon
convert "$MASTER_LOGO" -resize 32x32 "$OUTPUT_DIR/favicon-32.png"
convert "$MASTER_LOGO" -resize 16x16 "$OUTPUT_DIR/favicon-16.png"
convert "$OUTPUT_DIR/favicon-32.png" "$OUTPUT_DIR/favicon-16.png" "$OUTPUT_DIR/favicon.ico"
echo "  ✓ favicon.ico"

echo ""

# Optional: SVG generation (requires potrace)
if command -v potrace &> /dev/null; then
    echo "Generating SVG (vector format)..."
    convert "$MASTER_LOGO" -flatten -monochrome "$OUTPUT_DIR/temp.pbm"
    potrace "$OUTPUT_DIR/temp.pbm" -s -o "$OUTPUT_DIR/quantum-pi-forge-logo.svg"
    rm "$OUTPUT_DIR/temp.pbm"
    echo "  ✓ SVG generated"
else
    echo -e "${YELLOW}⚠ Skipping SVG generation (potrace not installed)${NC}"
    echo "  Install with: sudo apt-get install potrace"
fi

echo ""
echo -e "${GREEN}🎉 Success! All logo variations generated in $OUTPUT_DIR/${NC}"
echo ""
echo "Generated files:"
ls -lh "$OUTPUT_DIR"/*.png "$OUTPUT_DIR"/*.ico 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'

echo ""
echo "Next steps:"
echo "  1. Review the generated files"
echo "  2. git add logos/"
echo "  3. git commit -m 'Add logo variations'"
echo "  4. git push"