/**
 * Netflix-Inspired Frontend - Main Application
 * Core application structure and initialization
 */

// Application State Management
const AppState = {
  currentModal: null,
  mobileMenuOpen: false,
  scrollPositions: {},
  contentData: null,
  isLoading: false
};

// Application Configuration
const AppConfig = {
  breakpoints: {
    mobile: 640,
    tablet: 1024,
    desktop: 1280
  },
  animation: {
    duration: 300,
    easing: 'ease-in-out'
  },
  content: {
    itemsPerRow: {
      mobile: 2,
      tablet: 4,
      desktop: 6
    }
  }
};

/**
 * Netflix Frontend Application Class
 * Manages the entire application lifecycle and component interactions
 */
class NetflixApp {
  constructor() {
    this.init();
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      console.log('🎬 Initializing Netflix Frontend Application...');
      
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
      } else {
        this.onDOMReady();
      }
    } catch (error) {
      console.error('❌ Application initialization failed:', error);
      this.handleError(error);
    }
  }

  /**
   * Handle DOM ready event
   */
  async onDOMReady() {
    try {
      console.log('📄 DOM ready, setting up components...');
      
      // Initialize core components
      this.setupNavigation();
      this.setupHeroSection();
      this.setupModalSystem();
      this.setupEventListeners();
      this.setupResponsiveHandlers();
      
      // Load content data
      await this.loadContentData();
      
      // Initialize content rows
      this.initializeContentRows();
      
      console.log('✅ Application initialized successfully');
    } catch (error) {
      console.error('❌ DOM ready setup failed:', error);
      this.handleError(error);
    }
  }

  /**
   * Setup navigation component
   */
  setupNavigation() {
    const navbar = document.querySelector('.navbar');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (!navbar || !mobileMenuToggle || !mobileMenu) {
      console.warn('⚠️ Navigation elements not found');
      return;
    }

    // Mobile menu toggle functionality
    mobileMenuToggle.addEventListener('click', () => {
      this.toggleMobileMenu();
    });

    // Close mobile menu when clicking on links
    const mobileMenuLinks = mobileMenu.querySelectorAll('a');
    mobileMenuLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.closeMobileMenu();
      });
    });

    // Handle scroll effects on navigation
    this.setupNavigationScrollEffects();
    
    console.log('🧭 Navigation setup complete');
  }

  /**
   * Setup navigation scroll effects
   */
  setupNavigationScrollEffects() {
    const navbar = document.querySelector('.navbar');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      
      // Add/remove scrolled class based on scroll position
      if (currentScrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
      
      lastScrollY = currentScrollY;
    });
  }

  /**
   * Toggle mobile menu
   */
  toggleMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    
    AppState.mobileMenuOpen = !AppState.mobileMenuOpen;
    
    if (AppState.mobileMenuOpen) {
      mobileMenu.classList.remove('-translate-y-full');
      mobileMenu.classList.add('translate-y-0');
      mobileMenuToggle.setAttribute('aria-expanded', 'true');
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      mobileMenu.classList.remove('translate-y-0');
      mobileMenu.classList.add('-translate-y-full');
      mobileMenuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  }

  /**
   * Close mobile menu
   */
  closeMobileMenu() {
    if (AppState.mobileMenuOpen) {
      this.toggleMobileMenu();
    }
  }

  /**
   * Setup hero section
   */
  setupHeroSection() {
    const heroSection = document.querySelector('.hero');
    const playButton = document.querySelector('.btn-play');
    const infoButton = document.querySelector('.btn-info');
    
    if (!heroSection) {
      console.warn('⚠️ Hero section not found');
      return;
    }

    // Hero button event listeners
    if (playButton) {
      playButton.addEventListener('click', () => {
        const heroData = AppState.contentData?.hero;
        this.handlePlayAction(heroData?.id || 'hero-featured');
      });
    }

    if (infoButton) {
      infoButton.addEventListener('click', () => {
        const heroData = AppState.contentData?.hero;
        this.handleInfoAction(heroData?.id || 'hero-featured');
      });
    }
    
    console.log('🦸 Hero section setup complete');
  }

  /**
   * Setup modal system
   */
  setupModalSystem() {
    const modalOverlay = document.querySelector('.modal-overlay');
    
    if (!modalOverlay) {
      console.warn('⚠️ Modal overlay not found');
      return;
    }

    // Close modal when clicking overlay
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        this.closeModal();
      }
    });

    // Close modal with escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && AppState.currentModal) {
        this.closeModal();
      }
    });
    
    console.log('🎭 Modal system setup complete');
  }

  /**
   * Setup global event listeners
   */
  setupEventListeners() {
    // Handle window resize
    window.addEventListener('resize', this.debounce(() => {
      this.handleResize();
    }, 250));

    // Handle visibility change (tab switching)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Pause any ongoing animations or videos
        this.pauseActiveContent();
      }
    });
    
    console.log('👂 Global event listeners setup complete');
  }

  /**
   * Setup responsive handlers
   */
  setupResponsiveHandlers() {
    // Close mobile menu on desktop resize
    window.addEventListener('resize', () => {
      if (window.innerWidth >= AppConfig.breakpoints.tablet && AppState.mobileMenuOpen) {
        this.closeMobileMenu();
      }
    });
  }

  /**
   * Load content data from JSON file
   */
  async loadContentData() {
    try {
      AppState.isLoading = true;
      console.log('📊 Loading content data...');
      
      const response = await fetch('/data/content.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      AppState.contentData = await response.json();
      
      // Load hero content
      this.loadHeroContent();
      
      console.log('✅ Content data loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load content data:', error);
      AppState.contentData = this.getPlaceholderContent();
      this.loadHeroContent(); // Load placeholder hero content
    } finally {
      AppState.isLoading = false;
    }
  }

  /**
   * Get placeholder content data
   */
  getPlaceholderContent() {
    return {
      hero: {
        id: 'hero-featured',
        title: 'Featured Content',
        description: 'Discover amazing stories and unforgettable characters in this featured content.',
        backdrop: 'https://via.placeholder.com/1920x1080/141414/ffffff?text=Featured+Content',
        year: 2024,
        rating: 8.5,
        duration: '2h 15m',
        genres: ['Action', 'Drama', 'Thriller']
      },
      categories: [
        {
          id: 'trending',
          title: 'Trending Now',
          items: []
        },
        {
          id: 'popular-movies',
          title: 'Popular Movies',
          items: []
        },
        {
          id: 'tv-shows',
          title: 'TV Shows',
          items: []
        },
        {
          id: 'my-list',
          title: 'My List',
          items: []
        }
      ]
    };
  }

  /**
   * Load hero content into the hero section
   */
  loadHeroContent() {
    const heroData = AppState.contentData?.hero;
    if (!heroData) {
      console.warn('⚠️ No hero data available');
      return;
    }

    // Update hero background image
    const heroBackgroundImg = document.getElementById('hero-background-image');
    if (heroBackgroundImg && heroData.backdrop) {
      heroBackgroundImg.src = heroData.backdrop;
      heroBackgroundImg.alt = `${heroData.title} backdrop`;
    }

    // Update hero title
    const heroTitle = document.getElementById('hero-title');
    if (heroTitle) {
      heroTitle.textContent = heroData.title;
    }

    // Update hero description
    const heroDescription = document.querySelector('.hero-description');
    if (heroDescription) {
      heroDescription.textContent = heroData.description;
    }

    // Update hero metadata
    const ratingElement = document.querySelector('.hero-meta .rating');
    const yearElement = document.querySelector('.hero-meta .year');
    const durationElement = document.querySelector('.hero-meta .duration');
    const genresElement = document.querySelector('.hero-meta .genres');

    if (ratingElement && heroData.rating) {
      ratingElement.querySelector('svg + *').textContent = heroData.rating;
    }
    if (yearElement) {
      yearElement.textContent = heroData.year;
    }
    if (durationElement) {
      durationElement.textContent = heroData.duration;
    }
    if (genresElement && heroData.genres) {
      genresElement.textContent = heroData.genres.join(' • ');
    }

    // Update button aria-labels
    const playButton = document.querySelector('.btn-play');
    const infoButton = document.querySelector('.btn-info');
    
    if (playButton) {
      playButton.setAttribute('aria-label', `Play ${heroData.title}`);
    }
    if (infoButton) {
      infoButton.setAttribute('aria-label', `More information about ${heroData.title}`);
    }

    console.log('🦸 Hero content loaded successfully');
  }

  /**
   * Initialize content rows
   */
  initializeContentRows() {
    const contentContainer = document.getElementById('content-container');
    
    if (!contentContainer || !AppState.contentData) {
      console.warn('⚠️ Content container or data not available');
      return;
    }

    // Clear existing content
    contentContainer.innerHTML = '';

    // Create placeholder content rows
    AppState.contentData.categories.forEach(category => {
      const rowElement = this.createContentRow(category);
      contentContainer.appendChild(rowElement);
    });
    
    console.log('🎬 Content rows initialized');
  }

  /**
   * Create a content row element
   */
  createContentRow(category) {
    const rowElement = document.createElement('section');
    rowElement.className = 'content-row';
    rowElement.innerHTML = `
      <h2 class="row-title text-2xl font-bold mb-4 px-4">${category.title}</h2>
      <div class="row-container relative px-4">
        <button class="scroll-btn scroll-left" aria-label="Scroll left">‹</button>
        <div class="content-slider" data-category="${category.id}">
          ${this.createPlaceholderCards(6)}
        </div>
        <button class="scroll-btn scroll-right" aria-label="Scroll right">›</button>
      </div>
    `;

    // Add scroll functionality
    this.setupRowScrolling(rowElement, category.id);
    
    return rowElement;
  }

  /**
   * Create placeholder content cards
   */
  createPlaceholderCards(count) {
    let cardsHTML = '';
    
    for (let i = 1; i <= count; i++) {
      cardsHTML += `
        <div class="content-card" data-content-id="placeholder-${i}" tabindex="0" role="button" aria-label="Content item ${i}">
          <img src="https://via.placeholder.com/200x300/333333/ffffff?text=Content+${i}" 
               alt="Content ${i}" 
               loading="lazy">
          <div class="card-info">
            <h3>Content Title ${i}</h3>
            <p>Genre • 2024</p>
          </div>
        </div>
      `;
    }
    
    return cardsHTML;
  }

  /**
   * Setup row scrolling functionality
   */
  setupRowScrolling(rowElement, categoryId) {
    const slider = rowElement.querySelector('.content-slider');
    const leftBtn = rowElement.querySelector('.scroll-left');
    const rightBtn = rowElement.querySelector('.scroll-right');
    
    if (!slider || !leftBtn || !rightBtn) return;

    const scrollAmount = 300;

    leftBtn.addEventListener('click', () => {
      slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    rightBtn.addEventListener('click', () => {
      slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    // Setup content card click handlers
    const contentCards = slider.querySelectorAll('.content-card');
    contentCards.forEach(card => {
      card.addEventListener('click', () => {
        const contentId = card.dataset.contentId;
        this.openModal(contentId);
      });

      // Keyboard support
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const contentId = card.dataset.contentId;
          this.openModal(contentId);
        }
      });
    });
  }

  /**
   * Handle play action
   */
  handlePlayAction(contentId) {
    console.log(`🎬 Play action for content: ${contentId}`);
    // Placeholder for play functionality
    alert('Play functionality will be implemented in future tasks');
  }

  /**
   * Handle info action
   */
  handleInfoAction(contentId) {
    console.log(`ℹ️ Info action for content: ${contentId}`);
    this.openModal(contentId);
  }

  /**
   * Open modal with content details
   */
  openModal(contentId) {
    console.log(`🎭 Opening modal for content: ${contentId}`);
    
    const modalOverlay = document.querySelector('.modal-overlay');
    const modalContent = document.querySelector('.modal-content');
    
    if (!modalOverlay || !modalContent) {
      console.warn('⚠️ Modal elements not found');
      return;
    }

    // Set current modal state
    AppState.currentModal = contentId;
    
    // Populate modal content (placeholder)
    modalContent.innerHTML = this.createModalContent(contentId);
    
    // Show modal
    modalOverlay.classList.remove('hidden');
    
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
    
    // Focus management
    const closeButton = modalContent.querySelector('.modal-close');
    if (closeButton) {
      closeButton.focus();
      closeButton.addEventListener('click', () => this.closeModal());
    }
  }

  /**
   * Create modal content HTML
   */
  createModalContent(contentId) {
    return `
      <button class="modal-close" aria-label="Close modal">×</button>
      <div class="modal-header relative">
        <img src="https://via.placeholder.com/800x450/333333/ffffff?text=Content+Backdrop" 
             alt="Content backdrop" 
             class="w-full h-64 object-cover">
        <div class="modal-info absolute bottom-4 left-4 right-4">
          <h2 id="modal-title" class="text-3xl font-bold mb-2">Content Title</h2>
          <div class="modal-meta flex items-center space-x-4 text-sm text-gray-300">
            <span class="rating flex items-center">
              <svg class="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
              8.5
            </span>
            <span class="year">2024</span>
            <span class="duration">2h 15m</span>
          </div>
        </div>
      </div>
      <div class="modal-body p-6">
        <p class="description text-gray-200 mb-4 leading-relaxed">
          This is a placeholder description for the selected content. In a real implementation, 
          this would contain the actual movie or show description loaded from the content data.
        </p>
        <div class="cast mb-4">
          <span class="font-semibold text-white">Cast:</span>
          <span class="text-gray-300">Actor 1, Actor 2, Actor 3</span>
        </div>
        <div class="genres mb-6">
          <span class="font-semibold text-white">Genres:</span>
          <span class="text-gray-300">Action, Drama, Thriller</span>
        </div>
        <div class="modal-actions flex flex-wrap gap-4">
          <button class="btn-play bg-white text-black px-6 py-2 rounded font-semibold flex items-center space-x-2 hover:bg-gray-200 transition-colors">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path>
            </svg>
            <span>Play</span>
          </button>
          <button class="btn-list bg-gray-600 text-white px-6 py-2 rounded font-semibold flex items-center space-x-2 hover:bg-gray-500 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            <span>My List</span>
          </button>
          <button class="btn-like bg-gray-600 text-white px-6 py-2 rounded font-semibold flex items-center space-x-2 hover:bg-gray-500 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path>
            </svg>
            <span>Like</span>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Close modal
   */
  closeModal() {
    const modalOverlay = document.querySelector('.modal-overlay');
    
    if (!modalOverlay) return;
    
    // Hide modal
    modalOverlay.classList.add('hidden');
    
    // Reset state
    AppState.currentModal = null;
    
    // Restore background scrolling
    document.body.style.overflow = '';
    
    console.log('🎭 Modal closed');
  }

  /**
   * Handle window resize
   */
  handleResize() {
    console.log('📐 Window resized, updating layout...');
    
    // Close mobile menu on desktop
    if (window.innerWidth >= AppConfig.breakpoints.tablet && AppState.mobileMenuOpen) {
      this.closeMobileMenu();
    }
    
    // Update content row layouts if needed
    this.updateContentRowLayouts();
  }

  /**
   * Update content row layouts
   */
  updateContentRowLayouts() {
    // Placeholder for responsive layout updates
    console.log('🔄 Updating content row layouts');
  }

  /**
   * Pause active content (videos, animations)
   */
  pauseActiveContent() {
    console.log('⏸️ Pausing active content');
    // Placeholder for pausing functionality
  }

  /**
   * Handle application errors
   */
  handleError(error) {
    console.error('💥 Application Error:', error);
    
    // Show user-friendly error message
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-message fixed top-4 right-4 bg-red-600 text-white p-4 rounded shadow-lg z-50';
    errorContainer.innerHTML = `
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
        </svg>
        <span>Something went wrong. Please refresh the page.</span>
      </div>
    `;
    
    document.body.appendChild(errorContainer);
    
    // Auto-remove error message after 5 seconds
    setTimeout(() => {
      if (errorContainer.parentNode) {
        errorContainer.parentNode.removeChild(errorContainer);
      }
    }, 5000);
  }

  /**
   * Utility: Debounce function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Initialize the application when the script loads
const netflixApp = new NetflixApp();

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NetflixApp;
}