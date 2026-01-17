/**
 * Jest Test Setup
 * Global test configuration and utilities
 */

// Mock fetch for content loading tests
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock performance.now for animation tests
global.performance = {
  now: jest.fn(() => Date.now()),
};

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn((id) => clearTimeout(id));

// Mock IntersectionObserver for lazy loading tests
global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
}));

// Setup DOM environment
beforeEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Reset localStorage mock
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  
  // Reset fetch mock
  fetch.mockClear();
  
  // Clear document body
  document.body.innerHTML = '';
  document.head.innerHTML = '';
  
  // Reset any global state
  if (typeof window !== 'undefined') {
    window.scrollTo = jest.fn();
    window.innerWidth = 1024;
    window.innerHeight = 768;
  }
});

// Cleanup after each test
afterEach(() => {
  // Remove any event listeners
  document.removeEventListener = jest.fn();
  window.removeEventListener = jest.fn();
  
  // Clear any timers
  jest.clearAllTimers();
});

// Global test utilities
global.testUtils = {
  // Create mock content data
  createMockContentData: () => ({
    hero: {
      id: 'hero-test',
      title: 'Test Hero',
      description: 'Test hero description',
      poster: 'test-poster.jpg',
      backdrop: 'test-backdrop.jpg',
      year: 2024,
      rating: 8.5,
      duration: '2h 15m',
      genres: ['Action', 'Drama'],
      cast: ['Actor 1', 'Actor 2'],
      type: 'movie',
      category: 'featured'
    },
    categories: [
      {
        id: 'trending',
        title: 'Trending Now',
        items: [
          {
            id: 'test-1',
            title: 'Test Movie 1',
            description: 'Test description 1',
            poster: 'test-poster-1.jpg',
            backdrop: 'test-backdrop-1.jpg',
            year: 2024,
            rating: 8.0,
            duration: '2h',
            genres: ['Action'],
            cast: ['Actor 1'],
            type: 'movie',
            category: 'trending'
          }
        ]
      }
    ]
  }),
  
  // Create DOM elements for testing
  createTestHTML: () => {
    document.body.innerHTML = `
      <nav class="navbar">
        <div class="nav-brand">
          <img src="logo.svg" alt="Netflix" />
        </div>
        <ul class="nav-menu">
          <li><a href="#home" class="nav-link">Home</a></li>
        </ul>
        <button class="mobile-menu-toggle">Menu</button>
        <div class="mobile-menu">
          <ul>
            <li><a href="#home">Home</a></li>
          </ul>
        </div>
      </nav>
      
      <main class="main-content">
        <section class="hero">
          <div class="hero-content">
            <h1 class="hero-title">Test Title</h1>
            <p class="hero-description">Test description</p>
            <div class="hero-actions">
              <button class="btn-play">Play</button>
              <button class="btn-info">More Info</button>
            </div>
          </div>
        </section>
        
        <section class="content-rows">
          <div id="content-container"></div>
        </section>
      </main>
      
      <div class="modal-overlay hidden">
        <div class="modal-content">
          <div class="modal-placeholder">Loading...</div>
        </div>
      </div>
    `;
  },
  
  // Wait for async operations
  waitFor: (condition, timeout = 1000) => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const check = () => {
        if (condition()) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Timeout waiting for condition'));
        } else {
          setTimeout(check, 10);
        }
      };
      check();
    });
  }
};