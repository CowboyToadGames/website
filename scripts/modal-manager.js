class ModalManager {
    constructor(contentManager, router) {
        this.contentManager = contentManager;
        this.router = router;
        this.elements = {
            modal: null,
            modalTitle: null,
            modalBody: null
        };
    }

    init() {
        this.create();
        this.bindEvents();
    }

    create() {
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

    bindEvents() {
        document.addEventListener('click', (e) => {
            const modalTrigger = e.target.closest('[data-modal]');
            if (modalTrigger) {
                e.preventDefault();
                const type = modalTrigger.dataset.modal;
                const id = modalTrigger.dataset.id;
                this.open(type, id);
            }
        });

        this.elements.modal.querySelector('.modal-close').addEventListener('click', () => this.close());
        this.elements.modal.addEventListener('click', (e) => {
            if (e.target === this.elements.modal) this.close();
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.elements.modal.classList.contains('active')) {
                this.close();
            }
        });
    }

    open(type, id) {
        const item = this.contentManager.getContentItem(type, id);
        if (!item) {
            console.error(`Content not found: ${type}/${id}`);
            return;
        }

        this.router.setModalHash(type, id);

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

    close() {
        this.elements.modal.classList.remove('active');
        document.body.style.overflow = '';
        this.router.clearHash();
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