class CowboyToadWebsite {
    constructor() {
        this.contentManager = new ContentManager();
        this.uiManager = new UIManager(this.contentManager);
        this.modalManager = new ModalManager(this.contentManager, null); // Router will be set after creation
        this.router = new Router(this.contentManager, this.modalManager);
        
        // Set router reference in modal manager
        this.modalManager.router = this.router;
    }

    async init() {
        this.uiManager.init();
        
        const contentLoaded = await this.contentManager.load();
        if (!contentLoaded) {
            this.uiManager.showError();
            return;
        }

        this.modalManager.init();
        this.router.init();
        this.uiManager.renderNews();
        this.uiManager.renderFaq();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new CowboyToadWebsite();
    app.init();
});