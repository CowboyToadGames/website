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

	querySelector: (selector) => {
		try {
			return document.querySelector(selector);
		} catch (e) {
			console.warn(`Invalid selector: ${selector}`);
			return null;
		}
	},

	sanitizeHTML: (str) => {
		const div = document.createElement("div");
		div.textContent = str;
		return div.innerHTML;
	},

	formatDate: (dateStr) => {
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

	highlight: (text, term) => {
		if (!term || !text) return text;
		try {
			const regex = new RegExp(
				`(${term.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")})`,
				"gi"
			);
			return text.replace(regex, "<mark>$1</mark>");
		} catch (e) {
			console.warn("Error highlighting text:", e);
			return text;
		}
	},
};

// Content management
const contentManager = {
	content: { news: [], faq: [], policies: [] },
	isLoaded: false,

	load: async () => {
		if (contentManager.isLoaded) return contentManager.content;

		try {
			const response = await fetch("content.json");
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			contentManager.content = await response.json();
			contentManager.isLoaded = true;
			return contentManager.content;
		} catch (e) {
			console.error("Failed to load content:", e);
			contentManager.content = { news: [], faq: [], policies: [] };
			contentManager.isLoaded = true;
			return contentManager.content;
		}
	},

	findItem: (id) => {
		try {
			for (const items of Object.values(contentManager.content)) {
				if (Array.isArray(items)) {
					const item = items.find((i) => i.id === id);
					if (item) return item;
				}
			}
		} catch (e) {
			console.warn(`Error finding item ${id}:`, e);
		}
		return null;
	},

	getFilteredFaq: (game, searchTerm = "") => {
		try {
			const items = contentManager.content.faq.filter((item) => {
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
	},
};

// Modal management
const modal = {
	open: (contentId) => {
		const dialog = document.getElementById("modal");
		const item = contentManager.findItem(contentId);

		if (!item || !dialog) return false;

		document.getElementById("modal-title").textContent = item.title;
		document.getElementById("modal-body").innerHTML = modal.formatContent(item);


		// Calculate scrollbar width and prevent layout shift
		const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
		document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
		
		document.body.classList.add("no-scroll");
		dialog.showModal();


		history.pushState(null, null, `#${contentId}`);
		return true;
	},

	close: () => {
		const dialog = document.getElementById("modal");
		if (dialog?.open) {
			document.body.classList.remove("no-scroll");
			document.documentElement.style.removeProperty('--scrollbar-width');
			dialog.close();


			history.pushState(null, null, location.pathname);
		}
	},

	formatContent: (item) => {
		let html = "";
		if (item.date)
			html += `<p class="modal-date">${utils.formatDate(item.date)}</p>`;
		if (item.image)
			html += `<img src="${item.image}" alt="${utils.sanitizeHTML(
				item.title
			)}" class="modal-image" loading="lazy">`;
		if (item.summary && item.summary !== item.title)
			html += `<p class="modal-summary">${item.summary}</p>`;
		html += item.body;
		return html;
	},
};

// Search functionality
const search = {
	searchBox: null,
	renderCallback: null,
	debouncedSearch: null,

	init: (renderCallback) => {
		search.renderCallback = renderCallback;
		search.debouncedSearch = utils.debounce(search.performSearch, 300);
		search.searchBox = utils.querySelector(".search-box");
		if (search.searchBox) {
			search.searchBox.addEventListener("input", (e) => {
				search.debouncedSearch(e.target.value);
			});
		}
	},

	performSearch: (term) => {
		if (search.renderCallback) {
			search.renderCallback(term);
		}
	},

	clear: () => {
		if (search.searchBox) {
			search.searchBox.value = "";
		}
	},
};

// Event handling
const initEvents = (app) => {
	// Single click handler for all modal and game interactions
	document.addEventListener("click", (e) => {
		const target = e.target;

		// Modal close
		if (target.closest(".modal-close")) {
			modal.close();
			return;
		}

		// Backdrop click to close modal
		const modalElement = document.getElementById("modal");
		if (target === modalElement && modalElement.open) {
			modal.close();
			return;
		}

		// Content links with data-id
		const dataIdElement = target.closest("[data-id]");
		if (dataIdElement) {
			e.preventDefault();
			modal.open(dataIdElement.dataset.id);
			return;
		}

		// Hash links that don't match page sections
		if (target.href?.includes("#")) {
			const hash = target.href.split("#")[1];
			if (hash && !document.getElementById(hash)) {
				e.preventDefault();
				modal.open(hash);
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


	// Hash change handling
	window.addEventListener("hashchange", () => {
		const hash = location.hash.slice(1);
		if (!hash) return;

		const section = document.getElementById(hash);
		if (section) {
			section.scrollIntoView({ behavior: "smooth" });
		} else {
			modal.open(hash);
		}
	});
}

// Main application
const app = {
	activeGame: "nocturnals",

	init: async () => {
		try {
			await contentManager.load();
			search.init(app.renderFaq);
			initEvents(app);
			app.render();
			app.handleInitialHash();
		} catch (e) {
			console.error("Failed to initialize app:", e);
		}
	},

	handleInitialHash: () => {
		const hash = location.hash.slice(1);
		if (!hash) return;

		const section = document.getElementById(hash);
		if (section) {
			section.scrollIntoView({ behavior: "smooth" });
		} else {
			modal.open(hash);
		}
	},

	switchGame: (game) => {
		if (!game) return;

		try {
			const currentActive = utils.querySelector(".toggle-btn.active");
			const newActive = utils.querySelector(`[data-game="${game}"]`);

			if (currentActive) currentActive.classList.remove("active");
			if (newActive) newActive.classList.add("active");

			app.activeGame = game;
			search.clear();
			app.renderFaq();
		} catch (e) {
			console.error("Error switching game:", e);
		}
	},

	render: () => {
		app.renderNews();
		app.renderFaq();
	},

	renderNews: () => {
		const grid = utils.querySelector(".news-grid");
		if (!grid || !contentManager.content.news) return;

		try {
			grid.innerHTML = contentManager.content.news
				.map((item) => {
					const gameLogoSrc = app.getGameLogo(item.game);
					const gameLogoHtml = gameLogoSrc
						? `<img src="${gameLogoSrc}" alt="${item.game} logo" class="game-logo" loading="lazy">`
						: "";

					return `<article class="news-card" data-id="${item.id}" 
                         style="background-image: url('${item.image || ""}')"
>
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
	},

	getGameLogo: (game) => {
		const logoMap = {
			nocturnals: "images/nocturnals-logo.svg",
			"nocturnals-cacti-coast": "images/ncc-logo.svg",
		};
		return logoMap[game] || null;
	},

	renderFaq: (searchTerm = "") => {
		const results = document.getElementById("faq-results");

		if (!results) return;

		try {
			const items = contentManager.getFilteredFaq(
				app.activeGame,
				searchTerm
			);

			results.innerHTML = items
				.map(
					(item) =>
						`<div class="faq-item" data-id="${item.id
						}">
                    <h4>${utils.highlight(
							item.title,
							searchTerm
						)}</h4>
                    <p>${utils.highlight(
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
	},
};

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", app.init);
