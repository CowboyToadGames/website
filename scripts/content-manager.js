class ContentManager {
    constructor() {
        this.content = {
            news: [],
            faq: {},
            policies: []
        };
    }

    async load() {
        try {
            const [news, faq, policies] = await Promise.all([
                this.fetchJSON('data/news.json'),
                this.fetchJSON('data/faq.json'),
                this.fetchJSON('data/policies.json'),
            ]);
            this.content = { news, faq, policies };
            return true;
        } catch (error) {
            console.error("Failed to load site content:", error);
            return false;
        }
    }

    async fetchJSON(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for url: ${url}`);
        }
        return response.json();
    }

    getContentItem(type, id) {
        if (type === 'faq') {
            for (const gameKey in this.content.faq) {
                const item = this.content.faq[gameKey].find(entry => entry.id === id);
                if (item) return item;
            }
            return null;
        }
        return this.content[type]?.find(item => item.id === id) || null;
    }

    findItemById(id) {
        const newsItem = this.content.news.find(item => item.id === id);
        if (newsItem) return { type: 'news', item: newsItem };

        const policyItem = this.content.policies.find(item => item.id === id);
        if (policyItem) return { type: 'policies', item: policyItem };

        for (const gameKey in this.content.faq) {
            const faqItem = this.content.faq[gameKey].find(item => item.id === id);
            if (faqItem) return { type: 'faq', item: faqItem };
        }

        return null;
    }

    getNews() {
        return this.content.news;
    }

    getFaq(game) {
        return this.content.faq[game] || [];
    }

    getPolicies() {
        return this.content.policies;
    }
}