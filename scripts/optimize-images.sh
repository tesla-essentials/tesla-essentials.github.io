#!/bin/bash
#
# Tesla-Essentials.com — Image Optimization Helper
#
# Purpose: Keep image sizes under control as we expand model coverage (Model 3, Y, S, X, etc.).
#
# This project started with much better image discipline than the sister site (cyberoffroading).
# Let's keep it that way by running this script on new or replacement photos.
#
# Tools: ImageMagick (magick) + cwebp (both available on this machine)
#
# Usage:
#   ./scripts/optimize-images.sh images/products/new-category/my-photo.jpg
#
# Recommended output widths:
#   - Hero: 1600w or 2000w
#   - Product cards: 800w–1200w is usually plenty
#
set -euo pipefail

command -v magick >/dev/null 2>&1 || {
  echo "Error: ImageMagick ('magick') not found. Install with: brew install imagemagick"
  exit 1
}

if [ $# -eq 0 ]; then
  echo "Usage: $0 <image1.jpg> [image2.jpg ...]"
  exit 1
fi

JPEG_QUALITY=82
WEBP_QUALITY=80
LARGE_WIDTH=1600

echo "=== Tesla Essentials Image Optimizer ==="
echo

for input in "$@"; do
  if [ ! -f "$input" ]; then
    echo "Skipping (not found): $input"
    continue
  fi

  dir=$(dirname "$input")
  base=$(basename "$input")
  name="${base%.*}"

  echo "→ Processing: $input ($(du -h "$input" | cut -f1))"

  large_jpeg="$dir/${name}-${LARGE_WIDTH}.jpg"
  large_webp="$dir/${name}-${LARGE_WIDTH}.webp"

  magick "$input" \
    -resize "${LARGE_WIDTH}x>" \
    -strip \
    -interlace Plane \
    -quality "$JPEG_QUALITY" \
    "$large_jpeg"

  # Note: cwebp's -resize upscales smaller sources (no shrink-only mode), so use
  # magick's "Wx>" geometry for WebP as well.
  magick "$input" \
    -resize "${LARGE_WIDTH}x>" \
    -strip \
    -quality "$WEBP_QUALITY" \
    "$large_webp"

  echo "   Created:"
  echo "     $(du -h "$large_webp" | cut -f1)  $large_webp"
  echo "     $(du -h "$large_jpeg" | cut -f1)  $large_jpeg"
  echo
done

echo "Done. Remember to update the corresponding <img> tags with srcset when you use the new files."