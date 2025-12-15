# Notification Sounds

This directory contains audio files used for notification sounds.

## Default Notification Sound

The system expects a file named `notification.mp3` in this directory.

If you don't have a custom sound, you can:
1. Download a free notification sound from sites like [Freesound.org](https://freesound.org)
2. Use an online tool to generate a simple beep sound
3. Create a silent placeholder file if you don't want sounds

## Supported Formats

- MP3 (recommended)
- WAV
- OGG

## Adding Your Custom Sound

1. Place your audio file in this directory
2. Name it `notification.mp3` or update the path in `notificationService.ts`
3. Keep the file size small (< 100KB) for best performance

## Creating a Simple Notification Sound

You can create a simple beep using online tools like:
- [Online Tone Generator](https://onlinetonegenerator.com/)
- [Beep Generator](https://www.beepgen.com/)

Export as MP3, duration 0.5-1 second, frequency around 800-1000 Hz.
