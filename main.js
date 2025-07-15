// Simple app with working hash routing
class CowboyToadWebsite {
    constructor() {
        this.content = {};
        this.modal = null;
        this.activeFaqGame = 'nocturnals';
    }

    async init() {
        // Load content
        await this.loadContent();

        // Create modal
        this.createModal();

        // Bind events
        this.bindEvents();

        // Render content
        this.renderNews();
        this.renderFaq();

        // Handle initial hash
        this.handleHash();
    }

    async loadContent() {
        try {
            const [news, faq, policies] = await Promise.all([
                fetch('data/news.json').then(r => r.json()),
                fetch('data/faq.json').then(r => r.json()),
                fetch('data/policies.json').then(r => r.json())
            ]);
            this.content = { news, faq, policies };
        } catch (error) {
            console.error('Failed to load content:', error);
        }
    }

    createModal() {
        const modalHTML = `
            <div id="modal" class="modal-overlay">
                <div class="modal-container">
                    <div class="modal-header">
                        <h2 id="modal-title"></h2>
                        <button id="modal-close" class="modal-close"><i class="ti ti-x"></i></button>
                    </div>
                    <div class="modal-content">
                        <div id="modal-body"></div>
                    </div>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('modal');
    }

    bindEvents() {
        // Hash change
        window.addEventListener('hashchange', () => this.handleHash());

        // Modal close
        document.getElementById('modal-close').addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.closeModal();
            }
        });

        // Modal triggers
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('[data-modal]');
            if (trigger) {
                e.preventDefault();
                const type = trigger.dataset.modal;
                const id = trigger.dataset.id;
                this.openModal(type, id);
            }
        });

        // Section navigation
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (link && !link.dataset.modal) {
                e.preventDefault();
                const section = link.getAttribute('href').slice(1);
                this.scrollToSection(section);
            }
        });

        // FAQ search
        const searchBox = document.querySelector('.search-box');
        if (searchBox) {
            let timeout;
            searchBox.addEventListener('input', (e) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => this.renderFaq(e.target.value), 300);
            });
        }

        // FAQ game toggle
        const gameToggle = document.querySelector('.game-toggle');
        if (gameToggle) {
            gameToggle.addEventListener('click', (e) => {
                const button = e.target.closest('.toggle-btn');
                if (button && !button.classList.contains('active')) {
                    gameToggle.querySelector('.active').classList.remove('active');
                    button.classList.add('active');
                    this.activeFaqGame = button.dataset.game;
                    document.querySelector('.search-box').value = '';
                    this.renderFaq();
                }
            });
        }
    }

    handleHash() {
        const hash = window.location.hash.slice(1);
        if (!hash) return;

        // Check if it's a modal hash
        if (this.isModalHash(hash)) {
            this.handleModalHash(hash);
        } else {
            // Section navigation
            this.scrollToSection(hash);
        }
    }

    isModalHash(hash) {
        // Simple check: if hash contains content that exists, it's a modal
        return this.findContentByHash(hash) !== null;
    }

    findContentByHash(hash) {
        // Check news
        const newsItem = this.content.news?.find(item => item.id === hash);
        if (newsItem) return { type: 'news', item: newsItem };

        // Check policies
        if (hash === 'privacy' || hash === 'privacy-policy') {
            const item = this.content.policies?.find(p => p.id === 'privacy-policy');
            if (item) return { type: 'policies', item };
        }
        if (hash === 'terms' || hash === 'terms-of-use') {
            const item = this.content.policies?.find(p => p.id === 'terms-of-use');
            if (item) return { type: 'policies', item };
        }

        // Check FAQ
        for (const game in this.content.faq || {}) {
            const faqItem = this.content.faq[game].find(item => item.id === hash);
            if (faqItem) return { type: 'faq', item: faqItem };
        }

        return null;
    }

    handleModalHash(hash) {
        const content = this.findContentByHash(hash);
        if (content) {
            this.showModal(content.type, content.item);
        }
    }

    openModal(type, id) {
        let item;

        if (type === 'news') {
            item = this.content.news?.find(n => n.id === id);
        } else if (type === 'policies') {
            item = this.content.policies?.find(p => p.id === id);
        } else if (type === 'faq') {
            for (const game in this.content.faq || {}) {
                item = this.content.faq[game].find(f => f.id === id);
                if (item) break;
            }
        }

        if (item) {
            // Set hash
            let hash = id;
            if (type === 'policies' && id === 'privacy-policy') hash = 'privacy';
            if (type === 'policies' && id === 'terms-of-use') hash = 'terms';

            history.pushState(null, null, `#${hash}`);
            this.showModal(type, item);
        }
    }

    showModal(type, item) {
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');

        title.textContent = item.title;

        let content = '';
        if (type === 'news') {
            content = `<p class="modal-date">${this.formatDate(item.date)}</p>${item.body}`;
        } else {
            content = item.body;
        }

        body.innerHTML = content;
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
        history.pushState(null, null, window.location.pathname);
    }

    scrollToSection(sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const top = element.offsetTop - headerHeight;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    }

    renderNews() {
        const grid = document.querySelector('.news-grid');
        if (!grid || !this.content.news) return;

        const html = this.content.news.map((item, index) => `
            <article class="news-card news-${index + 1}" data-modal="news" data-id="${item.id}" 
                     style="background-image: url('${item.image}')">
                <div class="news-content">
                    <h3>${item.title}</h3>
                    <p>${item.summary}</p>
                </div>
            </article>
        `).join('');

        grid.innerHTML = html;
    }

    renderFaq(searchTerm = '') {
        const container = document.getElementById('faq-results');
        const supportInfo = document.querySelector('.support-info');
        const supportContact = document.querySelector('.support-contact');

        if (!container || !this.content.faq) return;

        const items = this.content.faq[this.activeFaqGame] || [];
        const filtered = searchTerm
            ? items.filter(item =>
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.body.toLowerCase().includes(searchTerm.toLowerCase())
            )
            : items.slice(0, 6);

        if (filtered.length > 0) {
            const html = filtered.map(item => `
                <div class="faq-item" data-modal="faq" data-id="${item.id}">
                    <h4>${this.highlightText(item.title, searchTerm)}</h4>
                    <p>${this.highlightText(this.stripHtml(item.body).substring(0, 150) + '...', searchTerm)}</p>
                </div>
            `).join('');

            container.innerHTML = html;
            supportInfo.style.display = 'none';
            supportContact.style.display = 'block';
        } else {
            container.innerHTML = '';
            supportInfo.style.display = 'block';
            supportContact.style.display = 'none';
        }
    }

    highlightText(text, term) {
        if (!term) return text;
        const regex = new RegExp(`(${term})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    stripHtml(html) {
        return html.replace(/<[^>]*>/g, '');
    }

    formatDate(dateStr) {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    const app = new CowboyToadWebsite();
    app.init();
});