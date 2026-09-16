#!/bin/bash
set -e

# Move logo.png so capacitor-assets doesn't use it automatically
mv assets/logo.png assets/logo_backup.png

# Trim surrounding empty whitespace to get exact logo bounds without modifying logo graphics (700x212)
magick assets/logo_backup.png -trim +repage assets/logo_trimmed.png

# Create wide horizontal white rounded rectangle container (740x260, 2.85:1 ratio, 24px radius)
magick -size 740x260 xc:none -draw "fill white roundrectangle 0,0,740,260,24,24" assets/container_bg.png
magick assets/container_bg.png assets/logo_trimmed.png -gravity center -composite assets/logo_horizontal_container.png

# Create icon-foreground.png: scale logo container to fit within 550x550, pad to 1024x1024
magick assets/logo_horizontal_container.png -resize 550x550 -background none -gravity center -extent 1024x1024 assets/icon-foreground.png
# Create icon-background.png: white 1024x1024
magick -size 1024x1024 canvas:white assets/icon-background.png

# For splash screen (standard size 2732x2732)
# Scale horizontal container to ~950px wide on dark #090D16 background
magick assets/logo_horizontal_container.png -resize 950x950 -background "#090D16" -gravity center -extent 2732x2732 assets/splash.png
magick assets/logo_horizontal_container.png -resize 950x950 -background "#090D16" -gravity center -extent 2732x2732 assets/splash-dark.png

# Create Android 12+ system splash icon (ic_splash_logo.png: 1024x1024 transparent canvas with horizontal rounded logo container centered)
magick assets/logo_horizontal_container.png -resize 560x560 -background none -gravity center -extent 1024x1024 android/app/src/main/res/drawable/ic_splash_logo.png

# Run generation
npx capacitor-assets generate --android

# Restore original logo.png and cleanup
mv assets/logo_backup.png assets/logo.png
rm -f android/app/src/main/res/drawable-*/ic_splash_logo.png
rm -f assets/logo_trimmed.png assets/container_bg.png assets/logo_horizontal_container.png assets/icon-foreground.png assets/icon-background.png assets/splash.png assets/splash-dark.png




