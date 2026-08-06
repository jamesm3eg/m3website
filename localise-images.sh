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

set -uo pipefail

BASE="https://m3eg.com/wp-content/uploads"
PREFIX_RE="https://m3eg\\.com/wp-content/uploads/[0-9]{4}/[0-9]{2}/"

mkdir -p assets/img

FILES=(
  "2023/06/home-gallery-02-scaled.jpg"
  "2023/06/service-constrution.jpeg"
  "2023/06/service-stormwater.jpeg"
  "2023/06/service-stream.jpeg"
  "2023/06/service-wastewater.jpeg"
  "2023/07/1-scaled.jpg"
  "2023/07/12.jpeg"
  "2023/07/13.jpeg"
  "2023/07/14.jpeg"
  "2023/07/15.jpeg"
  "2023/07/17.jpeg"
  "2023/07/18.jpeg"
  "2023/07/2-scaled.jpg"
  "2023/07/20.jpeg"
  "2023/07/25-scaled.jpeg"
  "2023/07/3-scaled.jpeg"
  "2023/07/4-1-scaled.jpg"
  "2023/07/5-1-scaled.jpg"
  "2023/07/6-1-scaled.jpg"
  "2023/07/7.jpeg"
  "2023/07/8.jpeg"
  "2023/07/marc.jpeg"
  "2023/07/marjorie.jpeg"
  "2023/07/mike.jpeg"
  "2023/07/todd.jpeg"
  "2023/10/AdobeStock_258852985-scaled.jpeg"
  "2025/08/Forest-Park-Asset-Management-Photo-2-e1756149206803.jpg"
  "2025/08/Henry-Website-Headshot-2025-e1756241911634.jpeg"
  "2025/08/JSMcDonnellBlvd_SiteRemediation_01-1-scaled-e1756147063308.jpg"
  "2025/08/Paolla-Website-Headshot-2025-e1756241996609.jpeg"
)

fail=0
echo "Downloading ${#FILES[@]} images..."
for path in "${FILES[@]}"; do
  name="$(basename "$path")"
  if curl -fsSL --retry 2 "$BASE/$path" -o "assets/img/$name"; then
    printf '  ok    %s\n' "$name"
  else
    printf '  FAIL  %s\n' "$name"
    rm -f "assets/img/$name"
    fail=$((fail+1))
  fi
done

if [ "$fail" -gt 0 ]; then
  echo
  echo "$fail image(s) failed. Download those by hand into assets/img/ before"
  echo "continuing, or the rewrite below will leave broken images."
  echo "Press Ctrl-C to stop, or Enter to rewrite anyway."
  read -r _
fi

echo
echo "Rewriting image references..."

# Pages at the repository root point straight at assets/img/.
# Pages one directory down (key-staff/) need ../assets/img/ instead, so the
# two depths are rewritten separately. macOS sed and GNU sed disagree about
# -i, so each file is written via a temp file.
rewrite () {   # $1 = file, $2 = replacement prefix
  sed -E "s#${PREFIX_RE}#$2#g" "$1" > "$1.tmp" && mv "$1.tmp" "$1"
  printf '  %s\n' "$1"
}

for html in ./*.html; do
  [ -e "$html" ] || continue
  rewrite "$html" "assets/img/"
done

for html in ./*/*.html; do
  [ -e "$html" ] || continue
  rewrite "$html" "../assets/img/"
done

echo
echo "Done. Review with 'git diff', then commit."
echo
echo "Note: the gallery images on company.html use empty alt=\"\" attributes."
echo "Add real descriptions for accessibility and image search."
