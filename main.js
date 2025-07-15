const app = {
    content: {},
    activeGame: 'nocturnals',
    
    async init() {
        try {
            this.content = await fetch('content.json').then(r => r.json());
        } catch (e) {
            console.error('Failed to load content:', e);
            this.content = { news: [], faq: [], policies: [] };
        }
        
        this.bindEvents();
        this.render();
        this.handleHash();
    },
    
    bindEvents() {
        // Simplified event handling
        document.addEventListener('click', e => {
            const t = e.target;
            
            // Modal close
            if (t.closest('.modal-close') || t.classList.contains('modal')) {
                this.closeModal();
            }
            // Content links
            else if (t.closest('[data-id]')) {
                e.preventDefault();
                this.openModal(t.closest('[data-id]').dataset.id);
            }
            // Hash links
            else if (t.href?.includes('#')) {
                const hash = t.href.split('#')[1];
                if (hash && !document.getElementById(hash)) {
                    e.preventDefault();
                    this.openModal(hash);
                }
            }
            // Game toggle
            else if (t.classList.contains('toggle-btn') && !t.classList.contains('active')) {
                this.switchGame(t.dataset.game);
            }
        });
        
        // Search
        const search = document.querySelector('.search-box');
        if (search) {
            let timeout;
            search.addEventListener('input', e => {
                clearTimeout(timeout);
                timeout = setTimeout(() => this.renderFaq(e.target.value), 300);
            });
        }
        
        // Hash change
        window.addEventListener('hashchange', () => this.handleHash());
        
        // Escape key
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') this.closeModal();
        });
    },
    
    handleHash() {
        const hash = location.hash.slice(1);
        if (!hash) return;
        
        const section = document.getElementById(hash);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        } else {
            this.openModal(hash);
        }
    },
    
    openModal(id) {
        const item = this.findItem(id);
        if (!item) return;
        
        document.getElementById('modal-title').textContent = item.title;
        document.getElementById('modal-body').innerHTML = this.formatContent(item);
        document.getElementById('modal').classList.add('active');
        document.body.style.overflow = 'hidden';
        history.pushState(null, null, `#${id}`);
    },
    
    closeModal() {
        document.getElementById('modal').classList.remove('active');
        document.body.style.overflow = '';
        history.pushState(null, null, location.pathname);
    },
    
    findItem(id) {
        // Check all content arrays
        for (const items of Object.values(this.content)) {
            const item = items?.find?.(i => i.id === id);
            if (item) return item;
        }
        return null;
    },
    
    formatContent(item) {
        let html = '';
        if (item.date) html += `<p class="modal-date">${this.formatDate(item.date)}</p>`;
        if (item.image) html += `<img src="${item.image}" alt="${item.title}" class="modal-image">`;
        if (item.summary && item.summary !== item.title) html += `<p class="modal-summary">${item.summary}</p>`;
        html += item.body;
        return html;
    },
    
    switchGame(game) {
        document.querySelector('.toggle-btn.active').classList.remove('active');
        document.querySelector(`[data-game="${game}"]`).classList.add('active');
        this.activeGame = game;
        document.querySelector('.search-box').value = '';
        this.renderFaq();
    },
    
    render() {
        this.renderNews();
        this.renderFaq();
    },
    
    renderNews() {
        const grid = document.querySelector('.news-grid');
        if (!grid || !this.content.news) return;
        
        grid.innerHTML = this.content.news.map((item, i) =>
            `<article class="news-card news-${i + 1}" data-id="${item.id}" 
                     style="background-image: url('${item.image || ''}')">
                <div class="news-content">
                    <h3>${item.title}</h3>
                    <p>${item.summary || ''}</p>
                </div>
            </article>`
        ).join('');
    },
    
    renderFaq(search = '') {
        const results = document.getElementById('faq-results');
        if (!results || !this.content.faq) return;
        
        const items = this.content.faq.filter(item => {
            if (item.game && item.game !== this.activeGame) return false;
            if (!search) return true;
            
            const s = search.toLowerCase();
            return item.title.toLowerCase().includes(s) || 
                   item.body.toLowerCase().includes(s);
        });
        
        const filtered = search ? items : items.slice(0, 6);
        
        results.innerHTML = filtered.map(item =>
            `<div class="faq-item" data-id="${item.id}">
                <h4>${this.highlight(item.title, search)}</h4>
                <p>${this.highlight(
                    item.body.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
                    search
                )}</p>
            </div>`
        ).join('');
        
        document.querySelector('.support-info').style.display = filtered.length ? 'none' : 'block';
        document.querySelector('.support-contact').style.display = filtered.length ? 'block' : 'none';
    },
    
    highlight(text, term) {
        if (!term) return text;
        const regex = new RegExp(`(${term})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    },
    
    formatDate(dateStr) {
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());