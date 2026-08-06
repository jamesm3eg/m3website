#!/usr/bin/env bash
#
# Downloads the photographs this site currently pulls from the old WordPress
# install, saves them into assets/img/, and rewrites the HTML to point there.
#
# Run it once from the repository root:
#
#     bash localise-images.sh
#
# Afterwards the site no longer depends on m3eg.com being online, which
# matters the moment you switch the domain over to GitHub Pages.
#
# Requires: curl (preinstalled on macOS and most Linux; on Windows use Git Bash).

set -euo pipefail

BASE="https://m3eg.com/wp-content/uploads"
mkdir -p assets/img

FILES=(
  "2023/06/service-wastewater.jpeg"
  "2023/06/service-stormwater.jpeg"
  "2023/06/service-stream.jpeg"
  "2023/06/service-constrution.jpeg"
  "2025/08/Forest-Park-Asset-Management-Photo-2-e1756149206803.jpg"
  "2025/08/JSMcDonnellBlvd_SiteRemediation_01-1-scaled-e1756147063308.jpg"
  "2023/07/marjorie.jpeg"
  "2023/07/marc.jpeg"
  "2023/07/todd.jpeg"
  "2023/07/mike.jpeg"
  "2025/08/Paolla-Website-Headshot-2025-e1756241996609.jpeg"
  "2025/08/Henry-Website-Headshot-2025-e1756241911634.jpeg"
)

echo "Downloading ${#FILES[@]} images..."
for path in "${FILES[@]}"; do
  name="$(basename "$path")"
  if curl -fsSL "$BASE/$path" -o "assets/img/$name"; then
    echo "  ok   $name"
  else
    echo "  FAIL $name  (download it manually into assets/img/)"
  fi
done

echo
echo "Rewriting image references in the HTML..."
for html in ./*.html; do
  # macOS sed and GNU sed disagree about -i, so write to a temp file instead.
  sed -E "s#https://m3eg\.com/wp-content/uploads/[0-9]{4}/[0-9]{2}/#assets/img/#g" \
    "$html" > "$html.tmp" && mv "$html.tmp" "$html"
done

echo "Done. Review with 'git diff', then commit."
