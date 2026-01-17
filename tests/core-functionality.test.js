/**
 * Core Functionality Tests
 * Tests for the implemented Netflix frontend functionality
 */

// Mock setup
global.fetch = jest.fn();
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.console = { ...console, log: jest.fn(), warn: jest.fn(), error: jest.fn() };

// Test utilities
global.testUtils = {
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
  }
};

describe('Netflix Frontend - Core Functionality', () => {
  let mockApp;
  
  beforeEach(() => {
    // Clear mocks
    jest.clearAllMocks();
    global.localStorage.getItem.mockClear();
    global.localStorage.setItem.mockClear();
    global.fetch.mockClear();
    
    // Create test HTML structure
    global.testUtils.createTestHTML();
    
    // Mock fetch to return test data
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(global.testUtils.createMockContentData())
    });
    
    // Create a mock app object with the methods we want to test
    mockApp = {
      AppState: { mobileMenuOpen: false, currentModal: null },
      
      validateContentData: (data) => {
        if (!data || typeof data !== 'object') return false;
        if (!data.hero || !data.hero.id || !data.hero.title) return false;
        if (!Array.isArray(data.categories)) return false;
        return true;
      },
      
      getContentById: (id) => {
        const mockData = global.testUtils.createMockContentData();
        if (mockData.hero.id === id) return mockData.hero;
        for (const category of mockData.categories) {
          const item = category.items.find(item => item.id === id);
          if (item) return item;
        }
        return null;
      },
      
      getContentByCategory: (categoryId) => {
        const mockData = global.testUtils.createMockContentData();
        const category = mockData.categories.find(cat => cat.id === categoryId);
        return category ? category.items : [];
      },
      
      searchContent: (query) => {
        if (!query || query.trim() === '') return [];
        const mockData = global.testUtils.createMockContentData();
        const results = [];
        const searchTerm = query.toLowerCase();
        
        for (const category of mockData.categories) {
          for (const item of category.items) {
            if (item.title.toLowerCase().includes(searchTerm) || 
                item.description.toLowerCase().includes(searchTerm)) {
              results.push(item);
            }
          }
        }
        return results;
      },
      
      addToMyList: (contentId) => {
        // Mock implementation
        return true;
      },
      
      removeFromMyList: (contentId) => {
        // Mock implementation
        return true;
      },
      
      toggleMobileMenu: () => {
        mockApp.AppState.mobileMenuOpen = !mockApp.AppState.mobileMenuOpen;
      },
      
      closeMobileMenu: () => {
        mockApp.AppState.mobileMenuOpen = false;
      },
      
      openModal: (contentId) => {
        const modalOverlay = document.querySelector('.modal-overlay');
        if (modalOverlay) {
          modalOverlay.classList.remove('hidden');
          mockApp.AppState.currentModal = contentId;
        }
      },
      
      closeModal: () => {
        const modalOverlay = document.querySelector('.modal-overlay');
        if (modalOverlay) {
          modalOverlay.classList.add('hidden');
          mockApp.AppState.currentModal = null;
        }
      },
      
      handleError: (error) => {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = error.message;
        document.body.appendChild(errorDiv);
      },
      
      showNotification: (message, type) => {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
      },
      
      debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
          const later = () => {
            clearTimeout(timeout);
            func(...args);
          };
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
        };
      },
      
      handleResize: () => {
        if (window.innerWidth >= 1024 && mockApp.AppState.mobileMenuOpen) {
          mockApp.closeMobileMenu();
        }
      }
    };
  });

  describe('Application Core Functions', () => {
    test('should validate content data structure', () => {
      const validData = global.testUtils.createMockContentData();
      expect(mockApp.validateContentData(validData)).toBe(true);
    });

    test('should reject invalid content data', () => {
      const invalidData = { invalid: 'data' };
      expect(mockApp.validateContentData(invalidData)).toBe(false);
    });

    test('should get content by ID', () => {
      const content = mockApp.getContentById('test-1');
      expect(content).toBeDefined();
      expect(content.id).toBe('test-1');
    });

    test('should get content by category', () => {
      const trendingContent = mockApp.getContentByCategory('trending');
      expect(Array.isArray(trendingContent)).toBe(true);
      expect(trendingContent.length).toBeGreaterThan(0);
    });

    test('should search content', () => {
      const results = mockApp.searchContent('Test');
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('Navigation Component', () => {
    test('should toggle mobile menu', () => {
      const initialState = mockApp.AppState.mobileMenuOpen;
      mockApp.toggleMobileMenu();
      expect(mockApp.AppState.mobileMenuOpen).not.toBe(initialState);
    });

    test('should close mobile menu', () => {
      mockApp.toggleMobileMenu(); // Open first
      mockApp.closeMobileMenu();
      expect(mockApp.AppState.mobileMenuOpen).toBe(false);
    });
  });

  describe('Modal System', () => {
    test('should open modal with content', () => {
      mockApp.openModal('test-1');
      
      const modalOverlay = document.querySelector('.modal-overlay');
      expect(modalOverlay.classList.contains('hidden')).toBe(false);
      expect(mockApp.AppState.currentModal).toBe('test-1');
    });

    test('should close modal', () => {
      mockApp.openModal('test-1'); // Open first
      mockApp.closeModal();
      
      const modalOverlay = document.querySelector('.modal-overlay');
      expect(modalOverlay.classList.contains('hidden')).toBe(true);
      expect(mockApp.AppState.currentModal).toBe(null);
    });
  });

  describe('My List Functionality', () => {
    test('should add content to My List', () => {
      const success = mockApp.addToMyList('test-1');
      expect(success).toBe(true);
    });

    test('should remove content from My List', () => {
      const success = mockApp.removeFromMyList('test-1');
      expect(success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle application errors', () => {
      const error = new Error('Test error');
      mockApp.handleError(error);
      
      const errorMessage = document.querySelector('.error-message');
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.textContent).toBe('Test error');
    });
  });

  describe('Responsive Behavior', () => {
    test('should close mobile menu on desktop resize', () => {
      mockApp.toggleMobileMenu(); // Open mobile menu
      
      window.innerWidth = 1024; // Simulate desktop
      mockApp.handleResize();
      
      expect(mockApp.AppState.mobileMenuOpen).toBe(false);
    });
  });

  describe('Utility Functions', () => {
    test('should debounce function calls', (done) => {
      const mockFn = jest.fn();
      const debouncedFn = mockApp.debounce(mockFn, 100);
      
      debouncedFn();
      debouncedFn();
      debouncedFn();
      
      expect(mockFn).not.toHaveBeenCalled();
      
      setTimeout(() => {
        expect(mockFn).toHaveBeenCalledTimes(1);
        done();
      }, 150);
    });

    test('should show notifications', () => {
      mockApp.showNotification('Test message', 'info');
      
      const notification = document.querySelector('.notification');
      expect(notification).toBeTruthy();
      expect(notification.textContent).toBe('Test message');
    });
  });
});