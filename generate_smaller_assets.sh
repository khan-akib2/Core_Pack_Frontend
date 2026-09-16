#!/bin/bash
set -e

# Move logo.png so capacitor-assets doesn't use it automatically
mv assets/logo.png assets/logo_backup.png

# Perform a 100% lossless crop of outer white canvas ONLY (700x212+162+406) without resizing logo pixels
magick assets/logo_backup.png -crop 700x212+162+406 +repage assets/logo_cropped.png

# Create icon-foreground.png for launcher icon (original logo scaled on transparent canvas)
magick assets/logo_backup.png -resize 550x550 -background none -gravity center -extent 1024x1024 assets/icon-foreground.png
# Create icon-background.png (white 1024x1024)
magick -size 1024x1024 canvas:white assets/icon-background.png

# Create wide white rounded panel (740px x 260px, 24px corner radius)
magick -size 740x260 xc:none -draw "fill white roundrectangle 0,0,740,260,24,24" assets/container_bg.png
magick assets/container_bg.png assets/logo_cropped.png -gravity center -composite assets/logo_panel.png

# For Capacitor splash screen (standard size 2732x2732) on dark background #090D16
magick assets/logo_panel.png -resize 820x -background "#090D16" -gravity center -extent 2732x2732 assets/splash.png
magick assets/logo_panel.png -resize 820x -background "#090D16" -gravity center -extent 2732x2732 assets/splash-dark.png

# Create Android 12+ system splash icon (ic_splash_logo.png: 1024x1024 on #090D16 canvas with exact logo centered)
magick assets/logo_backup.png -resize 440x440 -background "#090D16" -gravity center -extent 1024x1024 android/app/src/main/res/drawable/ic_splash_logo.png

# Run generation
npx capacitor-assets generate --android

# Restore original logo.png and cleanup
mv assets/logo_backup.png assets/logo.png
rm -f android/app/src/main/res/drawable-*/ic_splash_logo.png
rm -f assets/logo_cropped.png assets/container_bg.png assets/logo_panel.png assets/icon-foreground.png assets/icon-background.png assets/splash.png assets/splash-dark.png








