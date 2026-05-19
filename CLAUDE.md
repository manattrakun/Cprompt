# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Veo3 Unlocked is a Chrome Extension (Manifest V3) that provides a sidebar assistant for automating tasks on a video generation website. The extension uses the Chrome Side Panel API.

## Architecture

```
├── manifest.json      # Extension configuration (Manifest V3)
├── background.js      # Service worker - handles extension lifecycle and side panel
├── sidebar.html       # Main UI rendered in the side panel
├── sidebar.css        # Styles with CSS variables for theming (red/white theme)
├── sidebar.js         # Main logic - DOM manipulation, chrome.scripting API calls
├── config.js          # Delay configuration for randomized timing
├── generate-icons.html # Icon generator tool (open in browser)
└── icons/             # Extension icons (16, 32, 48, 128 PNG)
```

## Key Features

### Password Protection
- Uses hash-based password verification stored in localStorage
- Password: `p1veo3` (Base64 encoded in code)
- Auth state persisted with timestamp

### UGC Video Prompt Generator
- Uses Gemini API (`gemini-2.0-flash-lite`) to analyze product images
- Generates YAML-formatted video prompts with: dialogue, emotion, voice_type, action, character, setting, camera
- System prompt defined in `getUGCSystemPrompt()` function

### Automation Flow
The "รันอัตโนมัติ" button executes a 5-step automation with double loop (images × rounds):

1. **Generate Prompt** - Calls Gemini API with product image
2. **Fill Prompt** - Injects text into `#PINHOLE_TEXT_AREA_ELEMENT_ID`
3. **Upload Image** - Clicks upload, selects Portrait orientation, confirms crop
4. **Click Create** - Triggers video generation with retry logic
5. **Download Multi** - Downloads specified number of clips (720p)

Stop button allows cancellation mid-automation via `shouldStopAutomation` flag.

## Chrome APIs Used

- `chrome.sidePanel` - Opens sidebar UI
- `chrome.scripting.executeScript` - Injects and runs code in active tab
- `chrome.tabs.query` - Gets active tab info
- `localStorage` - Stores settings (Gemini API key, auth state)

## Delay Configuration (config.js)

All automated actions use randomized delays:
- `actionMin/actionMax`: 2-3 seconds between UI actions
- `afterConfirmMin/afterConfirmMax`: 5-8 seconds after confirm buttons
- `automation.afterClickCreate`: 120-150 seconds (video generation wait time)

## DOM Targeting Strategy

Target website uses dynamic class names (styled-components pattern like `sc-xxxxx`). Multiple fallback strategies:
1. Specific CSS selectors (may break if site updates)
2. Finding elements by text content (e.g., "Crop and Save", "Portrait")
3. Finding elements by icon text (Google Symbols font: `<i>download</i>`)
4. Finding elements by `role` attribute (e.g., `[role="menuitem"]`)
5. Position-based search (finding buttons near video elements)

## Development

### Loading the Extension
1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" → Select project folder
4. Click extension icon to open side panel

### After Code Changes
- `sidebar.js`, `sidebar.css`, `sidebar.html`: Refresh the side panel
- `manifest.json`, `background.js`: Click reload button in chrome://extensions/

### Generating Icons
1. Open `generate-icons.html` in browser
2. Click "Download All Icons" button
3. Move downloaded files to `icons/` folder

## Language

User communication should be in Thai (ภาษาไทย).
