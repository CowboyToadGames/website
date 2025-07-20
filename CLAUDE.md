# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static website for Cowboy Toad Games, a game development studio. The site is built with vanilla HTML, CSS, and JavaScript and serves as a company homepage with news, community links, and support for their games "Nocturnals" and "Nocturnals: Cacti Coast".

## Architecture

The website uses a simple, modern architecture:

- **Static Site**: No build process or package management - pure HTML/CSS/JS
- **Content Management**: All content (news, FAQ, policies) is stored in `content.json`
- **Modal System**: Uses native HTML `<dialog>` elements for content modals
- **Hash Routing**: Simple hash-based routing for sections and modals
- **Responsive Design**: Mobile-first CSS with CSS Grid and Flexbox

## Key Files

- `index.html` - Main HTML structure with semantic sections
- `main.js` - Core application logic, event handling, and content rendering
- `styles.css` - Complete CSS styling with CSS custom properties
- `content.json` - All dynamic content (news articles, FAQ entries, policies)
- `images/` - Static assets including logos, backgrounds, and modal images
- `nocturnalsalpha/` - Contains a separate game demo/alpha build

## Code Structure

### JavaScript (`main.js`)
- Single `app` object with methods for initialization, event handling, and rendering
- Content is fetched from `content.json` on page load
- Modal system handles both hash-based and click-based navigation
- Search functionality for FAQ with debounced input
- Game switching for context-sensitive FAQ display

### CSS (`styles.css`)
- CSS custom properties for theming (dark color scheme)
- Responsive grid layouts using CSS Grid and Flexbox
- Utility classes for common patterns
- Modal styling uses modern CSS features like `::backdrop`

### Content (`content.json`)
- Structured data for news articles, FAQ entries, and legal policies
- Each item has `id`, `title`, `body` (HTML), and optional `image`, `date`, `game` fields
- Game-specific content is filtered based on active game selection

## Development Workflow

This is a static site - no build process is required. Changes can be made directly to the files and tested in live preview.

## Deployment

The site is deployed as a static site with GitHub Pages.

## Notes

- All external links use proper `target="_blank"` and `rel="noopener"` attributes
- The design follows modern web standards with semantic HTML and accessible navigation
- Content is designed to be easily maintainable through the JSON structure