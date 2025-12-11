# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Project Overview

This is a static website for Cowboy Toad Games, a game development studio. The
site is built with vanilla HTML, CSS, and JavaScript and serves as a company
homepage with news, community links, and support for their games "Nocturnals"
and "Nocturnals: Cacti Coast".

## Architecture

The website uses a simple, modern architecture:

- **Static Site**: No build process or package management - pure HTML/CSS/JS
- **Content Management**: Content is managed through Contentful headless CMS and
  fetched via their Content Delivery API
- **Modal System**: Uses native HTML `<dialog>` elements for content modals
- **Hash Routing**: Simple hash-based routing for sections and modals
- **Responsive Design**: Mobile-first CSS with CSS Grid and Flexbox

## Key Files

- `index.html` - Main HTML structure with semantic sections, includes Contentful
  CDN script
- `main.js` - Core application logic, event handling, content rendering, and
  Contentful API integration
- `styles.css` - Complete CSS styling with CSS custom properties
- `images/` - Static assets including logos, backgrounds, and modal images
- `nocturnalsalpha/` - Contains a separate game demo/alpha build

## Code Structure

### JavaScript (`main.js`)

- Contentful client initialization and API integration
- Data transformation layer to convert Contentful entries to website format
- Single `app` object with methods for initialization, event handling, and
  rendering
- Modal system handles both hash-based and click-based navigation
- Search functionality for FAQ with debounced input
- Game switching for context-sensitive FAQ display

### CSS (`styles.css`)

- CSS custom properties for theming (dark color scheme)
- Responsive grid layouts using CSS Grid and Flexbox
- Utility classes for common patterns
- Modal styling uses modern CSS features like `::backdrop`

### Content Management (Contentful CMS)

- Content is managed through Contentful's web interface
- Three content types: News Article, FAQ Entry, and Policy
- Each content type includes relevant fields (title, body, images, dates, etc.)
- Game-specific content is filtered based on active game selection
- Rich text editing with asset management built into Contentful

## Development Workflow

This is a static site - no build process is required. Changes can be made
directly to the files and tested in live preview.

### Content Management

- Content is managed through Contentful's web interface at
  [contentful.com](https://contentful.com)
- Create and edit news articles, FAQ entries, and policies using Contentful's
  rich text editor
- Images and assets are uploaded and managed within Contentful
- Content changes are published immediately and appear on the website after
  cache refresh

### Contentful Setup

- Space ID and Access Token are configured in `main.js` at the top of the file
- The access token is a read-only Content Delivery API token, designed to be
  public-facing (not a security issue)
- Three content types must be created in Contentful: `newsArticle`, `faqEntry`,
  and `policy`
- Each content type should have the fields specified in the implementation plan

## Deployment

The site is deployed as a static site with GitHub Pages.

## Production Readiness Notes

**Security**:

- Contentful access token in `main.js` is intentionally public (read-only
  Content Delivery API)
- All external links properly secured with `target="_blank"` and
  `rel="noopener"`

**Performance & Browser Support**:

- Uses modern baseline CSS features (`:has()`, `@starting-style`) - no fallbacks
  needed
- Hero background image loads above-the-fold, lazy loading not beneficial
- Site serves efficiently as static files

**SEO & Social Media**:

- OG image uses SVG format which is acceptable for most modern platforms
- Comprehensive meta tags and structured data implemented
- Sitemap.xml included for search engine indexing

**Code Quality**:

- Semantic HTML structure with proper accessibility attributes
- Mobile-first responsive design with CSS Grid and Flexbox
- Error handling implemented throughout JavaScript
- Content is easily maintainable through Contentful CMS
