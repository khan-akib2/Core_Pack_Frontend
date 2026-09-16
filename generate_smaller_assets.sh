#!/bin/bash
set -e

# Move logo.png so capacitor-assets doesn't use it automatically
mv assets/logo.png assets/logo_backup.png

# Create icon-foreground.png for launcher icon (original logo scaled on white canvas)
magick assets/logo_backup.png -resize 550x550 -background white -gravity center -extent 1024x1024 assets/icon-foreground.png
# Create icon-background.png (white 1024x1024)
magick -size 1024x1024 canvas:white assets/icon-background.png

# For splash screen (standard size 2732x2732) on clean white background #FFFFFF
# Scale original logo to ~820px (~30% of 2732px screen width) on white background
magick assets/logo_backup.png -resize 820x820 -background white -gravity center -extent 2732x2732 assets/splash.png
magick assets/logo_backup.png -resize 820x820 -background white -gravity center -extent 2732x2732 assets/splash-dark.png

# Create Android 12+ system splash icon (ic_splash_logo.png: 1024x1024 white canvas with exact logo centered)
magick assets/logo_backup.png -resize 440x440 -background white -gravity center -extent 1024x1024 android/app/src/main/res/drawable/ic_splash_logo.png

# Run generation
npx capacitor-assets generate --android

# Restore original logo.png and cleanup
mv assets/logo_backup.png assets/logo.png
rm -f android/app/src/main/res/drawable-*/ic_splash_logo.png
rm -f assets/icon-foreground.png assets/icon-background.png assets/splash.png assets/splash-dark.png







