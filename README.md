# SonicEQ – Audio Equalizer

SonicEQ is a Chrome extension that lets you customize audio playback with a real-time 10-band equalizer. Adjust frequencies, explore presets, visualize audio, and personalize sound for each browser tab.

## Features

- **10-Band Equalizer:** Adjust frequencies from 31 Hz to 16 kHz.
- **21 Built-in Presets:** Choose from Bass Boost, Pop, Rock, Jazz, Classical, Podcast, and more.
- **Custom Presets:** Create, edit, duplicate, and manage your own EQ profiles.
- **Real-Time Visualization:** View live EQ response curves and audio spectrum.
- **Preamp & Limiter:** Fine-tune output levels and reduce clipping.
- **Per-Tab Audio Control:** Apply equalization independently to browser tabs.
- **Import & Export:** Backup and restore presets and settings using JSON.
- **Multilingual Interface:** Supports English and Vietnamese.
- **Customizable Settings:** Configure EQ range, audio behavior, theme, and preferences.

## Technology Stack

| Category | Technology |
|---|---|
| Language | TypeScript |
| Frontend | React 18 |
| Build Tool | Vite 7 |
| Audio Processing | Web Audio API |
| Platform | Chrome Extension Manifest V3 |
| Icons | Lucide React |
| Storage | Chrome Storage API |

## Architecture

SonicEQ uses a modular architecture to separate the user interface, background processes, and audio processing.

- **Popup:** Main interface for controlling EQ, presets, and audio visualization.
- **Options Page:** Advanced settings and preset management.
- **Background Service Worker:** Manages tab capture, extension lifecycle, and communication.
- **Offscreen Document:** Handles audio streams and processing independently of the popup.
- **Audio Engine:** Manages audio sources, equalizer filters, and visualization.

## Project Structure

```text
.
├── public/
│   ├── _locales/
│   ├── icons/
│   └── manifest.json
├── scripts/
├── src/
│   ├── audio/
│   ├── background/
│   ├── hooks/
│   ├── i18n/
│   ├── offscreen/
│   ├── options/
│   ├── popup/
│   ├── presets/
│   ├── store/
│   ├── styles/
│   ├── types/
│   └── utils/
├── offscreen.html
├── options.html
├── popup.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Requirements

- Node.js (LTS version compatible with Vite 7).
- npm.
- Chrome 116+ or a compatible Chromium-based browser.

## Installation

**1. Clone the repository**

```bash
git clone <repository-url>
cd SonicEQ
```

**2. Install dependencies**

```bash
npm install
```

**3. Build the extension**

```bash
npm run build
```

The production build will be generated in the `dist/` directory.

**4. Load the extension**

1. Open `chrome://extensions/`.
2. Enable Developer mode.
3. Click **Load unpacked**.
4. Select the `dist/` directory.

## Usage

1. Open a browser tab playing audio.
2. Click the SonicEQ extension icon.
3. Select **Enable EQ for this tab**.
4. Choose a preset or customize the frequency bands.
5. Adjust preamp and audio settings to your preference.
6. Save custom presets for future use.

Audio processing continues independently of the popup window.

## Development

Start the development build in watch mode:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Run TypeScript type checking:

```bash
npm run typecheck
```

Verify the fullscreen bridge:

```bash
npm run verify:fullscreen
```

After rebuilding, reload the unpacked extension from `chrome://extensions/`.

## Data & Configuration

SonicEQ stores user preferences and EQ configurations locally using Chrome Storage.

- `chrome.storage.local`: EQ settings, presets, favorites, and application state.
- `chrome.storage.session`: Active tab capture registry.

No API keys, external accounts, or `.env` configuration are required.

Settings and presets can be imported or exported as JSON files.

## Troubleshooting

| Issue | Solution |
|---|---|
| EQ cannot be enabled | Make sure the current tab is a supported regular webpage. |
| Audio capture fails | Open the extension popup and manually enable EQ. |
| Audio becomes silent | Try stopping and restarting audio capture. |
| Changes are not reflected | Rebuild the extension and reload it. |
| Import fails | Check that the JSON file contains valid settings or preset data. |
| Fullscreen behavior issues | Reload the extension and enable EQ again on the target tab. |

**Note:** Chrome restricted pages, extension pages, and the Chrome Web Store cannot be captured.

## Security & Privacy

- Audio processing is handled locally using the Web Audio API.
- No external API keys or credentials are required.
- User settings are stored in Chrome extension storage.
- Imported configurations are validated before being applied.
- The extension does not declare broad host permissions.

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

## Contributing

Contributions, bug reports, and feature suggestions are welcome.

Before submitting changes, run:

```bash
npm run typecheck
npm run build
```

If you modify fullscreen bridge functionality, also run:

```bash
npm run verify:fullscreen
```