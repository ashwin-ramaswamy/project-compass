// App State
let articles = [];
let currentIndex = 0;
let touchStartX = 0;
let touchEndX = 0;

// DOM Elements
const loadingEl = document.getElementById('loading');
const emptyEl = document.getElementById('empty');
const cardEl = document.getElementById('card');
const headlineEl = document.getElementById('headline');
const counterEl = document.getElementById('counter');
const timestampEl = document.getElementById('timestamp');
const compassViewEl = document.getElementById('compass-view');
const summaryViewEl = document.getElementById('summary-view');
const summaryTextEl = document.getElementById('summary-text');

// Initialize App
async function init() {
  await loadArticles();

  if (articles.length === 0) {
    showState('empty');
  } else {
    showState('card');
    displayArticle(currentIndex);
  }

  setupEventListeners();
}

// Load articles from Google Sheets
async function loadArticles() {
  try {
    const response = await fetch(CONFIG.SHEET_URL);
    const data = await response.json();

    if (data && data.articles && data.articles.length > 0) {
      articles = data.articles.reverse(); // Most recent first
    }
  } catch (error) {
    console.error('Error loading articles:', error);
  }
}

// Display current article
function displayArticle(index) {
  if (index < 0 || index >= articles.length) return;

  const article = articles[index];

  headlineEl.textContent = article.title || 'Untitled';
  counterEl.textContent = `${index + 1}/${articles.length}`;

  if (article.timestamp) {
    const date = new Date(article.timestamp);
    timestampEl.textContent = date.toLocaleDateString();
  }

  // Reset to compass view
  compassViewEl.classList.remove('hidden');
  summaryViewEl.classList.add('hidden');

  currentIndex = index;
}

// Summarize article
async function summarizeArticle() {
  const article = articles[currentIndex];

  // Show loading state
  summaryTextEl.textContent = 'Generating summary...';
  compassViewEl.classList.add('hidden');
  summaryViewEl.classList.remove('hidden');

  try {
    const response = await fetch(`${CONFIG.BACKEND_URL}/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: article.url })
    });

    const data = await response.json();

    if (data.summary) {
      summaryTextEl.textContent = data.summary;
    } else if (data.error) {
      summaryTextEl.textContent = `Error: ${data.error}`;
    }
  } catch (error) {
    summaryTextEl.textContent = `Failed to generate summary: ${error.message}`;
    console.error('Error:', error);
  }
}

// Navigate to next article
function nextArticle() {
  if (currentIndex < articles.length - 1) {
    displayArticle(currentIndex + 1);
  }
}

// Navigate to previous article
function prevArticle() {
  if (currentIndex > 0) {
    displayArticle(currentIndex - 1);
  }
}

// Show/hide states
function showState(state) {
  loadingEl.classList.add('hidden');
  emptyEl.classList.add('hidden');
  cardEl.classList.add('hidden');

  if (state === 'loading') loadingEl.classList.remove('hidden');
  if (state === 'empty') emptyEl.classList.remove('hidden');
  if (state === 'card') cardEl.classList.remove('hidden');
}

// Setup Event Listeners
function setupEventListeners() {
  // Click headline to open URL
  headlineEl.addEventListener('click', () => {
    const article = articles[currentIndex];
    if (article && article.url) {
      window.open(article.url, '_blank');
    }
  });

  // Click compass to summarize
  compassViewEl.addEventListener('click', summarizeArticle);

  // Keyboard navigation (arrow keys)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      prevArticle();
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextArticle();
    }
  });

  // Touch gestures for mobile swiping
  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });
}

// Handle swipe gesture
function handleSwipe() {
  const swipeThreshold = 50;
  const diff = touchStartX - touchEndX;

  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      // Swipe left - next article
      nextArticle();
    } else {
      // Swipe right - previous article
      prevArticle();
    }
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
