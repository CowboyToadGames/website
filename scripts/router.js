class Router {
    constructor(contentManager, modalManager) {
        this.contentManager = contentManager;
        this.modalManager = modalManager;
        this.headerElement = document.querySelector('.header');
    }

    init() {
        this.bindEvents();
        if (window.location.hash) {
            setTimeout(() => this.handleHashChange(), 100);
        }
    }

    bindEvents() {
        window.addEventListener('hashchange', () => this.handleHashChange());

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href').slice(1);
                this.navigateToSection(targetId);
            });
        });
    }

    handleHashChange() {
        const hash = window.location.hash.slice(1);
        if (!hash) return;

        if (this.isModalHash(hash)) {
            this.handleModalHash(hash);
        } else {
            this.navigateToSection(hash);
        }
    }

    isModalHash(hash) {
        return hash.includes('-') || ['privacy-policy', 'terms-of-use', 'privacy', 'terms'].includes(hash);
    }

    handleModalHash(hash) {
        let type, id;

        if (hash === 'privacy' || hash === 'privacy-policy') {
            type = 'policies';
            id = 'privacy-policy';
        } else if (hash === 'terms' || hash === 'terms-of-use') {
            type = 'policies';
            id = 'terms-of-use';
        } else if (hash.startsWith('news-')) {
            type = 'news';
            id = hash.substring(5);
        } else if (hash.startsWith('faq-')) {
            type = 'faq';
            id = hash.substring(4);
        } else {
            const item = this.contentManager.findItemById(hash);
            if (item) {
                type = item.type;
                id = hash;
            } else {
                return;
            }
        }

        this.modalManager.open(type, id);
    }

    navigateToSection(sectionId) {
        const targetElement = document.getElementById(sectionId);
        if (targetElement) {
            const headerHeight = this.headerElement.offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight;
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        }
    }

    setModalHash(type, id) {
        let hash;
        if (type === 'policies') {
            hash = id === 'privacy-policy' ? 'privacy' : 'terms';
        } else {
            hash = `${type}-${id}`;
        }
        history.replaceState(null, null, `#${hash}`);
    }

    clearHash() {
        history.replaceState(null, null, window.location.pathname);
    }
}