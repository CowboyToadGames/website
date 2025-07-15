class UIManager {
    constructor(contentManager) {
        this.contentManager = contentManager;
        this.activeFaqGame = 'nocturnals';
        this.searchTimeout = null;
        this.elements = {
            newsGrid: document.querySelector('.news-grid'),
            gameToggle: document.querySelector('.game-toggle'),
            faqSearchBox: document.querySelector('.search-box'),
            faqResultsContainer: document.getElementById('faq-results'),
            supportInfo: document.querySelector('.support-info'),
            supportContact: document.querySelector('.support-contact')
        };
    }

    init() {
        this.showLoadingStates();
        this.bindEvents();
    }

    showLoadingStates() {
        if (this.elements.newsGrid) {
            this.elements.newsGrid.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div></div>';
        }
        if (this.elements.faqResultsContainer) {
            this.elements.faqResultsContainer.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div></div>';
        }
    }

    showError() {
        if (this.elements.newsGrid) {
            this.elements.newsGrid.innerHTML = '<p>Could not load news.</p>';
        }
        if (this.elements.faqResultsContainer) {
            this.elements.faqResultsContainer.innerHTML = '<p>Could not load FAQ.</p>';
        }
    }

    bindEvents() {
        if (this.elements.gameToggle) {
            this.elements.gameToggle.addEventListener('click', this.handleFaqToggle.bind(this));
        }
        if (this.elements.faqSearchBox) {
            this.elements.faqSearchBox.addEventListener('keyup', this.handleFaqSearch.bind(this));
        }
    }

    renderNews() {
        if (!this.elements.newsGrid) return;
        
        const news = this.contentManager.getNews();
        const newsHtml = news.map((item, index) => `
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
        const faqItems = this.contentManager.getFaq(this.activeFaqGame);
        const filteredItems = lowerCaseSearchTerm ?
            faqItems.filter(item =>
                item.title.toLowerCase().includes(lowerCaseSearchTerm) ||
                item.body.toLowerCase().includes(lowerCaseSearchTerm)
            ) :
            faqItems.slice(0, 6);

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
        }, 300);
    }

    highlightMatch(text, term) {
        if (!term) return text;
        const regex = new RegExp(`(${term})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
}