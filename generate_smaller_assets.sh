#!/bin/bash
set -e

# Move logo.png so capacitor-assets doesn't use it automatically
mv assets/logo.png assets/logo_backup.png

# Trim transparent edges to get the true logo bounds
magick assets/logo_backup.png -trim +repage assets/logo_trimmed.png

# Create icon-foreground.png: scale trimmed logo to fit within 550x550, then pad to 1024x1024
magick assets/logo_trimmed.png -resize 550x550 -background none -gravity center -extent 1024x1024 assets/icon-foreground.png
# Create icon-background.png: white 1024x1024
magick -size 1024x1024 canvas:white assets/icon-background.png

# For splash screen (capacitor-assets scales this up/down, standard is 2732x2732)
# We want the logo to be about 30% of the splash screen width. 30% of 2732 is ~820.
# Let's scale trimmed logo to fit 820x820, pad to 2732x2732 white.
magick assets/logo_trimmed.png -resize 820x820 -background white -gravity center -extent 2732x2732 assets/splash.png
magick assets/logo_trimmed.png -resize 820x820 -background white -gravity center -extent 2732x2732 assets/splash-dark.png

# Run generation
npx capacitor-assets generate --android

# Restore logo.png and cleanup
mv assets/logo_backup.png assets/logo.png
rm assets/logo_trimmed.png assets/icon-foreground.png assets/icon-background.png assets/splash.png assets/splash-dark.png
