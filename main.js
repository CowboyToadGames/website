// Utility functions
const utils = {
	debounce(func, wait) {
		let timeout;
		return function executedFunction(...args) {
			const later = () => {
				clearTimeout(timeout);
				func(...args);
			};
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
		};
	},

	safeQuerySelector(selector) {
		try {
			return document.querySelector(selector);
		} catch (e) {
			console.warn(`Invalid selector: ${selector}`);
			return null;
		}
	},

	sanitizeHTML(str) {
		const div = document.createElement("div");
		div.textContent = str;
		return div.innerHTML;
	},

	formatDate(dateStr) {
		try {
			return new Date(dateStr).toLocaleDateString("en-GB", {
				day: "numeric",
				month: "long",
				year: "numeric",
			});
		} catch (e) {
			console.warn(`Invalid date: ${dateStr}`);
			return dateStr;
		}
	},
};

// Content management
class ContentManager {
	constructor() {
		this.content = { news: [], faq: [], policies: [] };
		this.isLoaded = false;
	}

	async load() {
		if (this.isLoaded) return this.content;

		try {
			const response = await fetch("content.json");
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			this.content = await response.json();
			this.isLoaded = true;
			return this.content;
		} catch (e) {
			console.error("Failed to load content:", e);
			this.content = { news: [], faq: [], policies: [] };
			this.isLoaded = true;
			return this.content;
		}
	}

	findItem(id) {
		try {
			for (const items of Object.values(this.content)) {
				if (Array.isArray(items)) {
					const item = items.find((i) => i.id === id);
					if (item) return item;
				}
			}
		} catch (e) {
			console.warn(`Error finding item ${id}:`, e);
		}
		return null;
	}

	getFilteredFaq(game, searchTerm = "") {
		try {
			const items = this.content.faq.filter((item) => {
				if (item.game && item.game !== game) return false;
				if (!searchTerm) return true;

				const term = searchTerm.toLowerCase();
				return (
					item.title.toLowerCase().includes(term) ||
					item.body.toLowerCase().includes(term)
				);
			});

			return searchTerm ? items : items.slice(0, 6);
		} catch (e) {
			console.warn("Error filtering FAQ:", e);
			return [];
		}
	}
}

// Modal management
function openModal(contentId, contentManager) {
	const dialog = document.getElementById("modal");
	const item = contentManager.findItem(contentId);

	if (!item || !dialog) return false;

	document.getElementById("modal-title").textContent = item.title;
	document.getElementById("modal-body").innerHTML = formatModalContent(item);

	// Store the previously focused element
	dialog.previousFocus = document.activeElement;

	// Calculate scrollbar width and prevent layout shift
	const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
	document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
	
	document.body.classList.add("no-scroll");
	dialog.showModal();

	// Focus the close button for accessibility
	const closeButton = dialog.querySelector(".modal-close");
	if (closeButton) closeButton.focus();

	history.pushState(null, null, `#${contentId}`);
	return true;
}

function closeModal() {
	const dialog = document.getElementById("modal");
	if (dialog?.open) {
		document.body.classList.remove("no-scroll");
		document.documentElement.style.removeProperty('--scrollbar-width');
		dialog.close();

		// Restore focus to previously focused element
		if (
			dialog.previousFocus &&
			typeof dialog.previousFocus.focus === "function"
		) {
			dialog.previousFocus.focus();
		}

		history.pushState(null, null, location.pathname);
	}
}

function formatModalContent(item) {
	let html = "";
	if (item.date)
		html += `<p class="modal-date">${utils.formatDate(item.date)}</p>`;
	if (item.image)
		html += `<img src="${item.image}" alt="${utils.sanitizeHTML(
			item.title
		)}" class="modal-image">`;
	if (item.summary && item.summary !== item.title)
		html += `<p class="modal-summary">${item.summary}</p>`;
	html += item.body;
	return html;
}

// Search functionality
class SearchManager {
	constructor(contentManager, renderCallback) {
		this.contentManager = contentManager;
		this.renderCallback = renderCallback;
		this.searchBox = null;
		this.debouncedSearch = utils.debounce(this.performSearch.bind(this), 300);
		this.init();
	}

	init() {
		this.searchBox = utils.safeQuerySelector(".search-box");
		if (this.searchBox) {
			this.searchBox.addEventListener("input", (e) => {
				this.debouncedSearch(e.target.value);
			});
		}
	}

	performSearch(term) {
		if (this.renderCallback) {
			this.renderCallback(term);
		}
	}

	clear() {
		if (this.searchBox) {
			this.searchBox.value = "";
		}
	}

	highlight(text, term) {
		if (!term || !text) return text;
		try {
			const regex = new RegExp(
				`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
				"gi"
			);
			return text.replace(regex, "<mark>$1</mark>");
		} catch (e) {
			console.warn("Error highlighting text:", e);
			return text;
		}
	}
}

// Event handling
function initEvents(app) {
	// Single click handler for all modal and game interactions
	document.addEventListener("click", (e) => {
		const target = e.target;

		// Modal close
		if (target.closest(".modal-close")) {
			closeModal();
			return;
		}

		// Backdrop click to close modal
		const modal = document.getElementById("modal");
		if (target === modal && modal.open) {
			closeModal();
			return;
		}

		// Content links with data-id
		const dataIdElement = target.closest("[data-id]");
		if (dataIdElement) {
			e.preventDefault();
			openModal(dataIdElement.dataset.id, app.contentManager);
			return;
		}

		// Hash links that don't match page sections
		if (target.href?.includes("#")) {
			const hash = target.href.split("#")[1];
			if (hash && !document.getElementById(hash)) {
				e.preventDefault();
				openModal(hash, app.contentManager);
				return;
			}
		}

		// Game toggle
		if (
			target.classList.contains("toggle-btn") &&
			!target.classList.contains("active")
		) {
			app.switchGame(target.dataset.game);
			return;
		}
	});

	// Enhanced keyboard navigation
	document.addEventListener("keydown", (e) => {
		const modal = document.getElementById("modal");

		// Escape key closes modal
		if (e.key === "Escape" && modal?.open) {
			closeModal();
			return;
		}

		// Enter/Space on modal triggers (for accessibility)
		if ((e.key === "Enter" || e.key === " ") && e.target.closest("[data-id]")) {
			e.preventDefault();
			const element = e.target.closest("[data-id]");
			openModal(element.dataset.id, app.contentManager);
			return;
		}

		// Tab trap within modal
		if (e.key === "Tab" && modal?.open) {
			const focusableElements = modal.querySelectorAll(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);
			const firstElement = focusableElements[0];
			const lastElement = focusableElements[focusableElements.length - 1];

			if (e.shiftKey && document.activeElement === firstElement) {
				e.preventDefault();
				lastElement.focus();
			} else if (!e.shiftKey && document.activeElement === lastElement) {
				e.preventDefault();
				firstElement.focus();
			}
		}
	});

	// Hash change handling
	window.addEventListener("hashchange", () => {
		const hash = location.hash.slice(1);
		if (!hash) return;

		const section = document.getElementById(hash);
		if (section) {
			section.scrollIntoView({ behavior: "smooth" });
		} else {
			openModal(hash, app.contentManager);
		}
	});
}

// Main application
class App {
	constructor() {
		this.activeGame = "nocturnals";
		this.contentManager = new ContentManager();
		this.searchManager = new SearchManager(
			this.contentManager,
			this.renderFaq.bind(this)
		);
	}

	async init() {
		try {
			await this.contentManager.load();
			initEvents(this);
			this.render();
			this.handleInitialHash();
		} catch (e) {
			console.error("Failed to initialize app:", e);
		}
	}

	handleInitialHash() {
		const hash = location.hash.slice(1);
		if (!hash) return;

		const section = document.getElementById(hash);
		if (section) {
			section.scrollIntoView({ behavior: "smooth" });
		} else {
			openModal(hash, this.contentManager);
		}
	}

	switchGame(game) {
		if (!game) return;

		try {
			const currentActive = utils.safeQuerySelector(".toggle-btn.active");
			const newActive = utils.safeQuerySelector(`[data-game="${game}"]`);

			if (currentActive) currentActive.classList.remove("active");
			if (newActive) newActive.classList.add("active");

			this.activeGame = game;
			this.searchManager.clear();
			this.renderFaq();
		} catch (e) {
			console.error("Error switching game:", e);
		}
	}

	render() {
		this.renderNews();
		this.renderFaq();
	}

	renderNews() {
		const grid = utils.safeQuerySelector(".news-grid");
		if (!grid || !this.contentManager.content.news) return;

		try {
			grid.innerHTML = this.contentManager.content.news
				.map((item, i) => {
					const gameLogoSrc = this.getGameLogo(item.game);
					const gameLogoHtml = gameLogoSrc
						? `<img src="${gameLogoSrc}" alt="${item.game} logo" class="game-logo">`
						: "";

					return `<article class="news-card news-${i + 1}" data-id="${item.id}" 
                         style="background-image: url('${item.image || ""}')"
                         role="button" tabindex="0" aria-label="Read ${utils.sanitizeHTML(
						item.title
					)}">
                    <div class="news-content">
                        ${gameLogoHtml}
                        <h3>${utils.sanitizeHTML(item.title)}</h3>
                        <p>${utils.sanitizeHTML(item.summary || "")}</p>
                    </div>
                </article>`;
				})
				.join("");
		} catch (e) {
			console.error("Error rendering news:", e);
		}
	}

	getGameLogo(game) {
		const logoMap = {
			nocturnals: "images/nocturnals-logo.png",
			"nocturnals-cacti-coast": "images/ncc-logo.png",
		};
		return logoMap[game] || null;
	}

	renderFaq(searchTerm = "") {
		const results = document.getElementById("faq-results");

		if (!results) return;

		try {
			const items = this.contentManager.getFilteredFaq(
				this.activeGame,
				searchTerm
			);

			results.innerHTML = items
				.map(
					(item) =>
						`<div class="faq-item" data-id="${item.id
						}" role="button" tabindex="0" aria-label="Read ${item.title}">
                    <h4>${this.searchManager.highlight(
							item.title,
							searchTerm
						)}</h4>
                    <p>${this.searchManager.highlight(
							item.body.replace(/<[^>]*>/g, "").substring(0, 150) +
							"...",
							searchTerm
						)}</p>
                </div>`
				)
				.join("");
		} catch (e) {
			console.error("Error rendering FAQ:", e);
		}
	}
}

// Initialize app when DOM is ready
const app = new App();
document.addEventListener("DOMContentLoaded", () => app.init());
