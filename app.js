class CowboyToadWebsite {
    constructor() {
        this.content = {
            news: [],
            faq: {},
            policies: []
        };
        this.activeFaqGame = 'nocturnals';
        this.searchTimeout = null;
        this.elements = {
            newsGrid: document.querySelector('.news-grid'),
            gameToggle: document.querySelector('.game-toggle'),
            faqSearchBox: document.querySelector('.search-box'),
            faqResultsContainer: document.getElementById('faq-results'),
            supportInfo: document.querySelector('.support-info'),
            supportContact: document.querySelector('.support-contact'),
            modal: null, // Will be created dynamically
            modalTitle: null,
            modalBody: null,
            header: document.querySelector('.header'),
        };
    }

    async init() {
        if (this.elements.newsGrid) this.elements.newsGrid.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div></div>';
        if (this.elements.faqResultsContainer) this.elements.faqResultsContainer.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div></div>';

        try {
            const [news, faq, policies] = await Promise.all([
                this.fetchJSON('data/news.json'),
                this.fetchJSON('data/faq.json'),
                this.fetchJSON('data/policies.json'),
            ]);
            this.content = { news, faq, policies };
        } catch (error) {
            console.error("Failed to load site content:", error);
            if (this.elements.newsGrid) this.elements.newsGrid.innerHTML = '<p>Could not load news.</p>';
            if (this.elements.faqResultsContainer) this.elements.faqResultsContainer.innerHTML = '<p>Could not load FAQ.</p>';
            return;
        }

        this.createModal();
        this.bindEvents();
        this.renderNews();
        this.renderFaq();
    }

    async fetchJSON(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for url: ${url}`);
        }
        return response.json();
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            const modalTrigger = e.target.closest('[data-modal]');
            if (modalTrigger) {
                e.preventDefault();
                const type = modalTrigger.dataset.modal;
                const id = modalTrigger.dataset.id;
                this.openModal(type, id);
            }
        });

        if (this.elements.gameToggle) {
            this.elements.gameToggle.addEventListener('click', this.handleFaqToggle.bind(this));
        }
        if (this.elements.faqSearchBox) {
            this.elements.faqSearchBox.addEventListener('keyup', this.handleFaqSearch.bind(this));
        }

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const headerHeight = this.elements.header.offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight;
                    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                }
            });
        });

        this.elements.modal.querySelector('.modal-close').addEventListener('click', () => this.closeModal());
        this.elements.modal.addEventListener('click', (e) => {
            if (e.target === this.elements.modal) this.closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.elements.modal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    renderNews() {
        if (!this.elements.newsGrid) return;
        const newsHtml = this.content.news.map((item, index) => `
            <article class="news-card news-${index + 1}" data-modal="news" data-id="${item.id}" style="background-image: url('${item.image}')">
                <div class="news-content">
                    <h3>${item.title}</h3>
                    <p>${item.summary}</p>
                </div>
            </article>
        `).join('');
        this.elements.newsGrid.innerHTML = newsHtml || '<p>No news available at the moment.</p>';
    }

    renderFaq(searchTerm = '') {
        if (!this.elements.faqResultsContainer) return;

        const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
        const faqItems = this.content.faq[this.activeFaqGame] || [];
        const filteredItems = lowerCaseSearchTerm ?
            faqItems.filter(item =>
                item.title.toLowerCase().includes(lowerCaseSearchTerm) ||
                item.body.toLowerCase().includes(lowerCaseSearchTerm)
            ) :
            faqItems.slice(0, 6); // Show first 6 by default

        if (filteredItems.length > 0) {
            const faqHtml = filteredItems.map(item => {
                const title = this.highlightMatch(item.title, lowerCaseSearchTerm);
                const body = this.highlightMatch(item.body.replace(/<[^>]*>/g, '').substring(0, 150) + '...', lowerCaseSearchTerm);
                return `
                    <div class="faq-item" data-modal="faq" data-id="${item.id}">
                        <h4>${title}</h4>
                        <p>${body}</p>
                    </div>`;
            }).join('');
            this.elements.faqResultsContainer.innerHTML = faqHtml;
            this.elements.supportInfo.style.display = 'none';
            this.elements.supportContact.style.display = 'block';
        } else {
            this.elements.faqResultsContainer.innerHTML = '';
            this.elements.supportInfo.style.display = 'block';
            this.elements.supportContact.style.display = 'none';
        }
    }

    handleFaqToggle(e) {
        const button = e.target.closest('.toggle-btn');
        if (!button || button.classList.contains('active')) return;

        this.elements.gameToggle.querySelector('.active').classList.remove('active');
        button.classList.add('active');

        this.activeFaqGame = button.dataset.game;
        this.elements.faqSearchBox.value = '';
        this.renderFaq();
    }

    handleFaqSearch(e) {
        clearTimeout(this.searchTimeout);
        const query = e.target.value;

        if (query.trim()) {
            this.elements.faqResultsContainer.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><p>Searching...</p></div>';
        }

        this.searchTimeout = setTimeout(() => {
            this.renderFaq(query);
        }, 300); // 300ms debounce delay
    }

    createModal() {
        const modalHTML = `
            <div id="content-modal" class="modal-overlay">
                <div class="modal-container">
                    <div class="modal-header">
                        <h2 id="modal-title"></h2>
                        <button class="modal-close" aria-label="Close modal"><i class="ti ti-x"></i></button>
                    </div>
                    <div class="modal-content"><div id="modal-body"></div></div>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.elements.modal = document.getElementById('content-modal');
        this.elements.modalTitle = document.getElementById('modal-title');
        this.elements.modalBody = document.getElementById('modal-body');
    }

    openModal(type, id) {
        const item = this.getContentItem(type, id);
        if (!item) {
            console.error(`Content not found: ${type}/${id}`);
            return;
        }

        this.elements.modalTitle.textContent = item.title || 'Details';
        let bodyHtml = '';
        switch (type) {
            case 'news':
                bodyHtml = `<p class="modal-date">${this.formatDate(item.date)}</p><div class="modal-body-content">${item.body}</div>`;
                break;
            case 'faq':
            case 'policies':
                bodyHtml = `<div class="modal-body-content">${item.body}</div>`;
                break;
            default:
                bodyHtml = '<p>Unable to load this content.</p>';
        }
        this.elements.modalBody.innerHTML = bodyHtml;

        this.elements.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.elements.modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    getContentItem(type, id) {
        if (type === 'faq') {
            // Search across all game FAQs
            for (const gameKey in this.content.faq) {
                const item = this.content.faq[gameKey].find(entry => entry.id === id);
                if (item) return item;
            }
            return null;
        }
        return this.content[type]?.find(item => item.id === id) || null;
    }

    highlightMatch(text, term) {
        if (!term) return text;
        const regex = new RegExp(`(${term})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC'
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new CowboyToadWebsite();
    app.init();
});