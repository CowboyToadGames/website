function toggleGame(event, gameKey) {
    document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Clear search when switching games
    const searchBox = document.querySelector('.search-box');
    searchBox.value = '';
    
    // Show default FAQs for the selected game
    showDefaultFAQs(gameKey);
}

let searchTimeout;
function searchFAQ(query) {
    clearTimeout(searchTimeout);
    
    const resultsContainer = document.getElementById('faq-results');
    const activeBtn = document.querySelector('.toggle-btn.active');
    const gameKey = activeBtn.getAttribute('data-game');
    
    if (query.trim() === '') {
        showDefaultFAQs(gameKey);
        return;
    }
    
    // Show loading state
    showLoadingState();
    
    searchTimeout = setTimeout(() => {
        filterAndDisplayFAQ(gameKey, query.toLowerCase());
    }, 500);
}

function showDefaultFAQs(gameKey) {
    const items = faqData[gameKey] || faqData.nocturnals;
    const defaultItems = items.slice(0, 6);
    const container = document.getElementById('faq-results');
    
    container.innerHTML = defaultItems.map(item => `
        <div class="faq-item">
            <h4>${item.question}</h4>
            <p>${item.answer}</p>
        </div>
    `).join('');
}

function showLoadingState() {
    const container = document.getElementById('faq-results');
    container.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Searching...</p>
        </div>
    `;
}

function filterAndDisplayFAQ(gameKey, searchTerm) {
    const items = faqData[gameKey] || faqData.nocturnals;
    
    const filteredItems = items.filter(item =>
        item.question.toLowerCase().includes(searchTerm) ||
        item.answer.toLowerCase().includes(searchTerm)
    );

    const container = document.getElementById('faq-results');
    const contactSupport = document.querySelector('.support-contact');
    const supportInfo = document.querySelector('.support-info');

    if (filteredItems.length === 0) {
        // No results found - show full support info with transition
        container.innerHTML = '';
        contactSupport.style.display = 'none';
        supportInfo.style.display = 'block';
        supportInfo.style.opacity = '0';
        setTimeout(() => {
            supportInfo.style.opacity = '1';
        }, 10);
    } else {
        // Show filtered results with highlighted matches
        container.innerHTML = filteredItems.map(item => `
            <div class="faq-item">
                <h4>${highlightMatch(item.question, searchTerm)}</h4>
                <p>${highlightMatch(item.answer, searchTerm)}</p>
            </div>
        `).join('');

        // Show with transition
        container.style.opacity = '0';
        setTimeout(() => {
            container.style.opacity = '1';
        }, 10);

        contactSupport.style.display = 'block';
        supportInfo.style.display = 'none';
    }
}

function highlightMatch(text, searchTerm) {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

function clearSearch() {
    const searchBox = document.querySelector('.search-box');
    const activeBtn = document.querySelector('.toggle-btn.active');
    const gameKey = activeBtn.getAttribute('data-game');
    
    searchBox.value = '';
    showDefaultFAQs(gameKey);
    searchBox.focus();
}

const faqData = {
    'nocturnals': [
        { question: 'How do I start playing?', answer: 'Download the game and follow installation instructions.' },
        { question: 'What are the system requirements?', answer: 'Windows 10+, 4GB RAM, DirectX 11 graphics.' },
        { question: 'How do I report bugs?', answer: 'Use Discord or email team@cowboytoad.games' },
        { question: 'Can I play with friends?', answer: 'Yes, the game supports local multiplayer for up to 4 players.' },
        { question: 'How do I save my progress?', answer: 'Progress is automatically saved at checkpoints.' },
        { question: 'What controls do I use?', answer: 'Use WASD to move, Space to jump, and mouse to interact.' },
        { question: 'How do I change graphics settings?', answer: 'Access the settings menu from the main menu or pause screen.' },
        { question: 'Can I use a controller?', answer: 'Yes, Xbox and PlayStation controllers are supported.' }
    ],
    'nocturnals-cacti-coast': [
        { question: 'When will Cacti Coast be released?', answer: 'The game is currently in development. Wishlist on Steam for updates!' },
        { question: 'Will my Nocturnals save carry over?', answer: 'Save data compatibility is being considered for the final release.' },
        { question: 'What new features are planned?', answer: 'New biomes, characters, and gameplay mechanics are being developed.' },
        { question: 'Can I play the beta?', answer: 'Beta access will be announced to Discord members first.' },
        { question: 'What platforms will it support?', answer: 'Initially PC, with console versions planned for later.' },
        { question: 'Will there be new multiplayer modes?', answer: 'Yes, online multiplayer is planned for Cacti Coast.' }
    ]
};

// Initialize - show default FAQs for Nocturnals
document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('.support-info').style.display = 'none';
    showDefaultFAQs('nocturnals');
});