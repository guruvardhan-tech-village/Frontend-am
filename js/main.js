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
      
      // Load saved My List from storage
      this.loadMyListFromStorage();
      
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
      
      const response = await fetch('./data/content.json');
      if (!response.ok) {
        throw new Error(`Failed to load content: ${response.status} ${response.statusText}`);
      }
      
      const contentData = await response.json();
      
      // Validate content data structure
      if (!this.validateContentData(contentData)) {
        throw new Error('Invalid content data structure');
      }
      
      AppState.contentData = contentData;
      
      // Load hero content
      this.loadHeroContent();
      
      console.log('✅ Content data loaded successfully');
      console.log(`📊 Loaded ${this.getTotalContentCount()} content items across ${contentData.categories.length} categories`);
    } catch (error) {
      console.error('❌ Failed to load content data:', error);
      this.handleContentLoadError(error);
    } finally {
      AppState.isLoading = false;
    }
  }

  /**
   * Validate content data structure
   */
  validateContentData(data) {
    if (!data || typeof data !== 'object') {
      console.error('Content data is not a valid object');
      return false;
    }

    // Check for required hero section
    if (!data.hero || !data.hero.id || !data.hero.title) {
      console.error('Hero section is missing or invalid');
      return false;
    }

    // Check for categories array
    if (!Array.isArray(data.categories)) {
      console.error('Categories is not an array');
      return false;
    }

    // Validate each category
    for (const category of data.categories) {
      if (!category.id || !category.title || !Array.isArray(category.items)) {
        console.error(`Invalid category structure: ${category.id}`);
        return false;
      }

      // Validate content items in category
      for (const item of category.items) {
        if (!this.validateContentItem(item)) {
          console.error(`Invalid content item in category ${category.id}:`, item);
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Validate individual content item
   */
  validateContentItem(item) {
    const requiredFields = ['id', 'title', 'description', 'poster', 'year', 'rating', 'type', 'category'];
    
    for (const field of requiredFields) {
      if (!item.hasOwnProperty(field) || item[field] === null || item[field] === undefined) {
        console.error(`Content item missing required field: ${field}`);
        return false;
      }
    }

    // Validate specific field types
    if (typeof item.rating !== 'number' || item.rating < 0 || item.rating > 10) {
      console.error('Invalid rating value');
      return false;
    }

    if (typeof item.year !== 'number' || item.year < 1900 || item.year > new Date().getFullYear() + 5) {
      console.error('Invalid year value');
      return false;
    }

    if (!['movie', 'tv-show'].includes(item.type)) {
      console.error('Invalid content type');
      return false;
    }

    return true;
  }

  /**
   * Handle content loading errors
   */
  handleContentLoadError(error) {
    console.error('Content loading failed, using fallback data:', error);
    
    // Use placeholder content as fallback
    AppState.contentData = this.getPlaceholderContent();
    this.loadHeroContent();
    
    // Show user notification
    this.showNotification('Unable to load content. Using offline data.', 'warning');
  }

  /**
   * Get total content count across all categories
   */
  getTotalContentCount() {
    if (!AppState.contentData || !AppState.contentData.categories) {
      return 0;
    }
    
    return AppState.contentData.categories.reduce((total, category) => {
      return total + (category.items ? category.items.length : 0);
    }, 0);
  }

  /**
   * Get content by ID across all categories
   */
  getContentById(contentId) {
    if (!AppState.contentData) {
      return null;
    }

    // Check hero content first
    if (AppState.contentData.hero && AppState.contentData.hero.id === contentId) {
      return AppState.contentData.hero;
    }

    // Search through all categories
    for (const category of AppState.contentData.categories) {
      const item = category.items.find(item => item.id === contentId);
      if (item) {
        return item;
      }
    }

    return null;
  }

  /**
   * Get content by category
   */
  getContentByCategory(categoryId) {
    if (!AppState.contentData || !AppState.contentData.categories) {
      return [];
    }

    const category = AppState.contentData.categories.find(cat => cat.id === categoryId);
    return category ? category.items : [];
  }

  /**
   * Search content by title or description
   */
  searchContent(query) {
    if (!AppState.contentData || !query) {
      return [];
    }

    const searchTerm = query.toLowerCase();
    const results = [];

    // Search through all categories
    for (const category of AppState.contentData.categories) {
      for (const item of category.items) {
        if (item.title.toLowerCase().includes(searchTerm) || 
            item.description.toLowerCase().includes(searchTerm) ||
            item.genres.some(genre => genre.toLowerCase().includes(searchTerm))) {
          results.push(item);
        }
      }
    }

    return results;
  }

  /**
   * Add content to My List
   */
  addToMyList(contentId) {
    const content = this.getContentById(contentId);
    if (!content) {
      console.error('Content not found:', contentId);
      return false;
    }

    const myListCategory = AppState.contentData.categories.find(cat => cat.id === 'my-list');
    if (!myListCategory) {
      console.error('My List category not found');
      return false;
    }

    // Check if already in list
    const alreadyInList = myListCategory.items.some(item => item.id === contentId);
    if (alreadyInList) {
      console.log('Content already in My List:', contentId);
      return false;
    }

    // Add to My List
    myListCategory.items.push(content);
    console.log('Added to My List:', content.title);
    
    // Save to localStorage for persistence
    this.saveMyListToStorage();
    
    return true;
  }

  /**
   * Remove content from My List
   */
  removeFromMyList(contentId) {
    const myListCategory = AppState.contentData.categories.find(cat => cat.id === 'my-list');
    if (!myListCategory) {
      return false;
    }

    const initialLength = myListCategory.items.length;
    myListCategory.items = myListCategory.items.filter(item => item.id !== contentId);
    
    const removed = myListCategory.items.length < initialLength;
    if (removed) {
      console.log('Removed from My List:', contentId);
      this.saveMyListToStorage();
    }
    
    return removed;
  }

  /**
   * Save My List to localStorage
   */
  saveMyListToStorage() {
    try {
      const myListCategory = AppState.contentData.categories.find(cat => cat.id === 'my-list');
      if (myListCategory) {
        localStorage.setItem('netflix-my-list', JSON.stringify(myListCategory.items));
      }
    } catch (error) {
      console.error('Failed to save My List to storage:', error);
    }
  }

  /**
   * Load My List from localStorage
   */
  loadMyListFromStorage() {
    try {
      const savedMyList = localStorage.getItem('netflix-my-list');
      if (savedMyList) {
        const myListItems = JSON.parse(savedMyList);
        const myListCategory = AppState.contentData.categories.find(cat => cat.id === 'my-list');
        if (myListCategory && Array.isArray(myListItems)) {
          myListCategory.items = myListItems;
          console.log(`Loaded ${myListItems.length} items from saved My List`);
        }
      }
    } catch (error) {
      console.error('Failed to load My List from storage:', error);
    }
  }

  /**
   * Show notification to user
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 p-4 rounded shadow-lg z-50 ${
      type === 'error' ? 'bg-red-600' : 
      type === 'warning' ? 'bg-yellow-600' : 
      type === 'success' ? 'bg-green-600' : 'bg-blue-600'
    } text-white`;
    
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <span>${message}</span>
        <button class="ml-2 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
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

    // Create content rows from actual data
    AppState.contentData.categories.forEach(category => {
      const rowElement = this.createContentRow(category);
      contentContainer.appendChild(rowElement);
    });
    
    console.log('🎬 Content rows initialized with real data');
  }

  /**
   * Create a content row element
   */
  createContentRow(category) {
    const rowElement = document.createElement('section');
    rowElement.className = 'content-row mb-8';
    rowElement.setAttribute('role', 'region');
    rowElement.setAttribute('aria-labelledby', `row-title-${category.id}`);
    
    rowElement.innerHTML = `
      <h2 id="row-title-${category.id}" class="row-title text-2xl font-bold mb-4 text-white">${category.title}</h2>
      <div class="row-container relative">
        <button class="scroll-btn scroll-left" 
                aria-label="Scroll ${category.title} left" 
                tabindex="0">
          <span aria-hidden="true">‹</span>
        </button>
        <div class="content-slider" 
             data-category="${category.id}"
             role="group"
             aria-label="${category.title} content">
          ${this.createContentCards(category.items)}
        </div>
        <button class="scroll-btn scroll-right" 
                aria-label="Scroll ${category.title} right" 
                tabindex="0">
          <span aria-hidden="true">›</span>
        </button>
      </div>
    `;

    // Add scroll functionality
    this.setupRowScrolling(rowElement, category.id);
    
    return rowElement;
  }

  /**
   * Create content cards from actual data
   */
  createContentCards(items) {
    if (!items || items.length === 0) {
      return '<div class="text-gray-400 px-4 py-8 text-center">No content available</div>';
    }

    return items.map(item => `
      <div class="content-card" 
           data-content-id="${item.id}" 
           tabindex="0" 
           role="button" 
           aria-label="View details for ${item.title}">
        <div class="relative">
          <img src="${item.poster}" 
               alt="${item.title} poster" 
               loading="lazy"
               onerror="this.src='https://via.placeholder.com/200x300/333333/ffffff?text=No+Image'">
          <div class="card-overlay">
            <div class="card-info">
              <h3>${item.title}</h3>
              <p>${item.genres.join(' • ')} • ${item.year}</p>
              <div class="rating">
                <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <span>${item.rating}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  /**
   * Setup row scrolling functionality
   */
  setupRowScrolling(rowElement, categoryId) {
    const slider = rowElement.querySelector('.content-slider');
    const leftBtn = rowElement.querySelector('.scroll-left');
    const rightBtn = rowElement.querySelector('.scroll-right');
    
    if (!slider || !leftBtn || !rightBtn) return;

    // Store scroll position for this category
    AppState.scrollPositions[categoryId] = 0;

    // Calculate scroll amount based on viewport width and card size
    const getScrollAmount = () => {
      const viewportWidth = window.innerWidth;
      const cardWidth = viewportWidth < 640 ? 150 : viewportWidth < 1024 ? 180 : 200;
      const gap = viewportWidth < 640 ? 12 : viewportWidth < 1024 ? 16 : 20;
      const cardsToScroll = viewportWidth < 640 ? 2 : viewportWidth < 1024 ? 3 : 4;
      return (cardWidth + gap) * cardsToScroll;
    };

    // Enhanced smooth scroll function
    const smoothScrollTo = (targetPosition, duration = 300) => {
      const startPosition = slider.scrollLeft;
      const distance = targetPosition - startPosition;
      const startTime = performance.now();

      const animateScroll = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeInOutCubic = progress < 0.5 
          ? 4 * progress * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        slider.scrollLeft = startPosition + distance * easeInOutCubic;
        
        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        } else {
          // Update scroll position state
          AppState.scrollPositions[categoryId] = slider.scrollLeft;
          this.updateScrollButtons(slider, leftBtn, rightBtn);
        }
      };

      requestAnimationFrame(animateScroll);
    };

    // Scroll left handler
    leftBtn.addEventListener('click', () => {
      const scrollAmount = getScrollAmount();
      const targetPosition = Math.max(0, slider.scrollLeft - scrollAmount);
      smoothScrollTo(targetPosition);
    });

    // Scroll right handler
    rightBtn.addEventListener('click', () => {
      const scrollAmount = getScrollAmount();
      const maxScroll = slider.scrollWidth - slider.clientWidth;
      const targetPosition = Math.min(maxScroll, slider.scrollLeft + scrollAmount);
      smoothScrollTo(targetPosition);
    });

    // Keyboard navigation for scroll buttons
    leftBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        leftBtn.click();
      }
    });

    rightBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        rightBtn.click();
      }
    });

    // Touch/swipe support for mobile devices
    this.setupTouchScrolling(slider, categoryId);

    // Update scroll button visibility on scroll
    slider.addEventListener('scroll', this.debounce(() => {
      AppState.scrollPositions[categoryId] = slider.scrollLeft;
      this.updateScrollButtons(slider, leftBtn, rightBtn);
    }, 50));

    // Handle resize events to recalculate scroll positions
    window.addEventListener('resize', this.debounce(() => {
      this.updateScrollButtons(slider, leftBtn, rightBtn);
    }, 250));

    // Initial scroll button state
    this.updateScrollButtons(slider, leftBtn, rightBtn);

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
   * Setup touch/swipe scrolling for mobile devices
   */
  setupTouchScrolling(slider, categoryId) {
    let startX = 0;
    let startY = 0;
    let startScrollLeft = 0;
    let isScrolling = false;
    let isDragging = false;
    let startTime = 0;
    let velocityX = 0;
    let lastX = 0;
    let lastTime = 0;

    // Touch start handler
    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startScrollLeft = slider.scrollLeft;
      startTime = performance.now();
      lastX = startX;
      lastTime = startTime;
      isScrolling = false;
      isDragging = false;
      velocityX = 0;
      
      // Prevent default to avoid conflicts with native scrolling
      slider.style.scrollBehavior = 'auto';
    };

    // Touch move handler
    const handleTouchMove = (e) => {
      if (!e.touches[0]) return;
      
      const touch = e.touches[0];
      const currentX = touch.clientX;
      const currentY = touch.clientY;
      const currentTime = performance.now();
      
      const deltaX = startX - currentX;
      const deltaY = startY - currentY;
      
      // Determine if this is a horizontal scroll gesture
      if (!isScrolling && !isDragging) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        
        if (absX > absY && absX > 10) {
          // Horizontal scrolling detected
          isScrolling = true;
          isDragging = true;
          e.preventDefault();
        } else if (absY > absX && absY > 10) {
          // Vertical scrolling detected, let it pass through
          return;
        }
      }
      
      if (isScrolling && isDragging) {
        e.preventDefault();
        
        // Calculate velocity for momentum scrolling
        const timeDelta = currentTime - lastTime;
        if (timeDelta > 0) {
          velocityX = (lastX - currentX) / timeDelta;
        }
        
        // Update scroll position
        const newScrollLeft = startScrollLeft + deltaX;
        slider.scrollLeft = Math.max(0, Math.min(slider.scrollWidth - slider.clientWidth, newScrollLeft));
        
        lastX = currentX;
        lastTime = currentTime;
      }
    };

    // Touch end handler with momentum scrolling
    const handleTouchEnd = (e) => {
      if (!isDragging) return;
      
      const currentTime = performance.now();
      const duration = currentTime - startTime;
      
      // Apply momentum scrolling if gesture was fast enough
      if (Math.abs(velocityX) > 0.5 && duration < 300) {
        const momentum = velocityX * 200; // Adjust momentum factor
        const targetScrollLeft = slider.scrollLeft + momentum;
        const maxScroll = slider.scrollWidth - slider.clientWidth;
        const finalScrollLeft = Math.max(0, Math.min(maxScroll, targetScrollLeft));
        
        // Smooth scroll to final position
        this.smoothScrollToPosition(slider, finalScrollLeft, 400);
      }
      
      // Reset scroll behavior
      setTimeout(() => {
        slider.style.scrollBehavior = 'smooth';
      }, 100);
      
      // Update scroll buttons after touch interaction
      setTimeout(() => {
        AppState.scrollPositions[categoryId] = slider.scrollLeft;
        const leftBtn = slider.parentElement.querySelector('.scroll-left');
        const rightBtn = slider.parentElement.querySelector('.scroll-right');
        this.updateScrollButtons(slider, leftBtn, rightBtn);
      }, 50);
      
      isDragging = false;
      isScrolling = false;
    };

    // Mouse events for desktop drag scrolling
    const handleMouseDown = (e) => {
      startX = e.clientX;
      startScrollLeft = slider.scrollLeft;
      isDragging = true;
      slider.style.cursor = 'grabbing';
      slider.style.scrollBehavior = 'auto';
      e.preventDefault();
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      
      const deltaX = startX - e.clientX;
      const newScrollLeft = startScrollLeft + deltaX;
      slider.scrollLeft = Math.max(0, Math.min(slider.scrollWidth - slider.clientWidth, newScrollLeft));
    };

    const handleMouseUp = () => {
      if (!isDragging) return;
      
      isDragging = false;
      slider.style.cursor = 'grab';
      
      setTimeout(() => {
        slider.style.scrollBehavior = 'smooth';
      }, 100);
      
      // Update scroll buttons
      setTimeout(() => {
        AppState.scrollPositions[categoryId] = slider.scrollLeft;
        const leftBtn = slider.parentElement.querySelector('.scroll-left');
        const rightBtn = slider.parentElement.querySelector('.scroll-right');
        this.updateScrollButtons(slider, leftBtn, rightBtn);
      }, 50);
    };

    // Add event listeners
    slider.addEventListener('touchstart', handleTouchStart, { passive: false });
    slider.addEventListener('touchmove', handleTouchMove, { passive: false });
    slider.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // Desktop drag scrolling
    slider.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Prevent context menu on long press
    slider.addEventListener('contextmenu', (e) => {
      if (isDragging) {
        e.preventDefault();
      }
    });
    
    // Set initial cursor style
    slider.style.cursor = 'grab';
  }

  /**
   * Smooth scroll to specific position
   */
  smoothScrollToPosition(element, targetPosition, duration = 300) {
    const startPosition = element.scrollLeft;
    const distance = targetPosition - startPosition;
    const startTime = performance.now();

    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      
      element.scrollLeft = startPosition + distance * easeOutCubic;
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  }

  /**
   * Update scroll button visibility based on scroll position
   */
  updateScrollButtons(slider, leftBtn, rightBtn) {
    if (!slider || !leftBtn || !rightBtn) return;
    
    const scrollLeft = slider.scrollLeft;
    const scrollWidth = slider.scrollWidth;
    const clientWidth = slider.clientWidth;
    const tolerance = 2; // Small tolerance for floating point precision
    
    // Show/hide left button
    if (scrollLeft <= tolerance) {
      leftBtn.style.opacity = '0.3';
      leftBtn.style.pointerEvents = 'none';
      leftBtn.disabled = true;
      leftBtn.setAttribute('aria-hidden', 'true');
    } else {
      leftBtn.style.opacity = '';
      leftBtn.style.pointerEvents = '';
      leftBtn.disabled = false;
      leftBtn.setAttribute('aria-hidden', 'false');
    }
    
    // Show/hide right button
    if (scrollLeft + clientWidth >= scrollWidth - tolerance) {
      rightBtn.style.opacity = '0.3';
      rightBtn.style.pointerEvents = 'none';
      rightBtn.disabled = true;
      rightBtn.setAttribute('aria-hidden', 'true');
    } else {
      rightBtn.style.opacity = '';
      rightBtn.style.pointerEvents = '';
      rightBtn.disabled = false;
      rightBtn.setAttribute('aria-hidden', 'false');
    }
    
    // Update ARIA labels with current position
    const currentPosition = Math.round((scrollLeft / (scrollWidth - clientWidth)) * 100);
    leftBtn.setAttribute('aria-label', `Scroll left (currently at ${currentPosition}%)`);
    rightBtn.setAttribute('aria-label', `Scroll right (currently at ${currentPosition}%)`);
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

    // Get content data
    const content = this.getContentById(contentId);
    if (!content) {
      console.error('Content not found:', contentId);
      this.showNotification('Content not found', 'error');
      return;
    }

    // Set current modal state
    AppState.currentModal = contentId;
    
    // Show loading state first
    this.showModalLoadingState(modalContent);
    
    // Show modal overlay
    modalOverlay.classList.remove('hidden');
    modalOverlay.setAttribute('aria-hidden', 'false');
    
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
    
    // Add modal-open class to body for additional styling if needed
    document.body.classList.add('modal-open');
    
    // Populate modal content with real data after a brief delay for smooth transition
    setTimeout(() => {
      modalContent.innerHTML = this.createModalContent(content);
      
      // Setup modal interactions
      this.setupModalInteractions(content);
      
      // Focus management
      const closeButton = modalContent.querySelector('.modal-close');
      if (closeButton) {
        closeButton.focus();
      }
      
      // Announce to screen readers
      this.announceModalOpen(content.title);
    }, 100);
  }

  /**
   * Show modal loading state
   */
  showModalLoadingState(modalContent) {
    modalContent.innerHTML = `
      <div class="modal-placeholder p-8 text-center text-gray-400">
        <div class="loading-spinner mx-auto mb-4"></div>
        <p>Loading content details...</p>
      </div>
    `;
  }

  /**
   * Setup modal interactions and event listeners
   */
  setupModalInteractions(content) {
    const modalOverlay = document.querySelector('.modal-overlay');
    const modalContent = document.querySelector('.modal-content');
    const closeButton = modalContent.querySelector('.modal-close');
    
    // Remove any existing event listeners to prevent duplicates
    this.removeModalEventListeners();
    
    // Close button click handler
    if (closeButton) {
      this.modalCloseHandler = () => this.closeModal();
      closeButton.addEventListener('click', this.modalCloseHandler);
    }
    
    // Click outside to close (overlay click)
    this.modalOverlayClickHandler = (e) => {
      if (e.target === modalOverlay) {
        this.closeModal();
      }
    };
    modalOverlay.addEventListener('click', this.modalOverlayClickHandler);
    
    // Escape key to close
    this.modalKeydownHandler = (e) => {
      if (e.key === 'Escape' && AppState.currentModal) {
        e.preventDefault();
        this.closeModal();
      }
      
      // Trap focus within modal
      if (e.key === 'Tab') {
        this.trapFocusInModal(e, modalContent);
      }
    };
    document.addEventListener('keydown', this.modalKeydownHandler);
    
    // Setup modal action buttons
    this.setupModalActions(content);
    
    // Setup focus trap
    this.setupModalFocusTrap(modalContent);
  }

  /**
   * Remove modal event listeners to prevent memory leaks
   */
  removeModalEventListeners() {
    if (this.modalCloseHandler) {
      const closeButton = document.querySelector('.modal-close');
      if (closeButton) {
        closeButton.removeEventListener('click', this.modalCloseHandler);
      }
    }
    
    if (this.modalOverlayClickHandler) {
      const modalOverlay = document.querySelector('.modal-overlay');
      if (modalOverlay) {
        modalOverlay.removeEventListener('click', this.modalOverlayClickHandler);
      }
    }
    
    if (this.modalKeydownHandler) {
      document.removeEventListener('keydown', this.modalKeydownHandler);
    }
  }

  /**
   * Setup focus trap within modal for accessibility
   */
  setupModalFocusTrap(modalContent) {
    const focusableElements = modalContent.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    this.modalFocusableElements = Array.from(focusableElements);
    this.modalFirstFocusable = this.modalFocusableElements[0];
    this.modalLastFocusable = this.modalFocusableElements[this.modalFocusableElements.length - 1];
  }

  /**
   * Trap focus within modal
   */
  trapFocusInModal(e, modalContent) {
    if (!this.modalFocusableElements || this.modalFocusableElements.length === 0) {
      return;
    }
    
    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === this.modalFirstFocusable) {
        e.preventDefault();
        this.modalLastFocusable.focus();
      }
    } else {
      // Tab
      if (document.activeElement === this.modalLastFocusable) {
        e.preventDefault();
        this.modalFirstFocusable.focus();
      }
    }
  }

  /**
   * Announce modal opening to screen readers
   */
  announceModalOpen(contentTitle) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `Modal opened for ${contentTitle}. Press Escape to close.`;
    
    document.body.appendChild(announcement);
    
    // Remove announcement after screen reader has time to read it
    setTimeout(() => {
      if (announcement.parentNode) {
        announcement.parentNode.removeChild(announcement);
      }
    }, 1000);
  }

  /**
   * Setup modal action button event listeners
   */
  setupModalActions(content) {
    const playButton = document.querySelector('.modal .btn-play');
    const listButton = document.querySelector('.modal .btn-list');
    const likeButton = document.querySelector('.modal .btn-like');

    // Remove existing event listeners to prevent duplicates
    if (this.modalPlayHandler) {
      playButton?.removeEventListener('click', this.modalPlayHandler);
    }
    if (this.modalListHandler) {
      listButton?.removeEventListener('click', this.modalListHandler);
    }
    if (this.modalLikeHandler) {
      likeButton?.removeEventListener('click', this.modalLikeHandler);
    }

    if (playButton) {
      this.modalPlayHandler = () => {
        this.handlePlayAction(content.id);
      };
      playButton.addEventListener('click', this.modalPlayHandler);
    }

    if (listButton) {
      const isInMyList = this.getContentByCategory('my-list').some(item => item.id === content.id);
      
      // Update button appearance based on My List status
      this.updateMyListButton(listButton, isInMyList);

      this.modalListHandler = () => {
        const currentlyInList = this.getContentByCategory('my-list').some(item => item.id === content.id);
        
        if (currentlyInList) {
          const success = this.removeFromMyList(content.id);
          if (success) {
            this.showNotification(`Removed "${content.title}" from My List`, 'success');
            this.updateMyListButton(listButton, false);
            
            // Update the content row if My List is visible
            this.refreshMyListRow();
          }
        } else {
          const success = this.addToMyList(content.id);
          if (success) {
            this.showNotification(`Added "${content.title}" to My List`, 'success');
            this.updateMyListButton(listButton, true);
            
            // Update the content row if My List is visible
            this.refreshMyListRow();
          }
        }
      };
      listButton.addEventListener('click', this.modalListHandler);
    }

    if (likeButton) {
      this.modalLikeHandler = () => {
        // Toggle like state (placeholder functionality)
        const isLiked = likeButton.classList.contains('liked');
        
        if (isLiked) {
          likeButton.classList.remove('liked');
          likeButton.innerHTML = `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path>
            </svg>
            <span>Like</span>
          `;
          this.showNotification('Removed like', 'info');
        } else {
          likeButton.classList.add('liked');
          likeButton.innerHTML = `
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path>
            </svg>
            <span>Liked</span>
          `;
          this.showNotification('Added like', 'success');
        }
      };
      likeButton.addEventListener('click', this.modalLikeHandler);
    }
  }

  /**
   * Update My List button appearance
   */
  updateMyListButton(button, isInList) {
    if (!button) return;
    
    if (isInList) {
      button.classList.add('in-list');
      button.innerHTML = `
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
        </svg>
        <span>In My List</span>
      `;
      button.setAttribute('aria-label', 'Remove from My List');
    } else {
      button.classList.remove('in-list');
      button.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        <span>My List</span>
      `;
      button.setAttribute('aria-label', 'Add to My List');
    }
  }

  /**
   * Refresh My List content row
   */
  refreshMyListRow() {
    const myListSlider = document.querySelector('[data-category="my-list"]');
    if (myListSlider) {
      const myListCategory = AppState.contentData.categories.find(cat => cat.id === 'my-list');
      if (myListCategory) {
        myListSlider.innerHTML = this.createContentCards(myListCategory.items);
        
        // Re-setup content card click handlers for the refreshed content
        const contentCards = myListSlider.querySelectorAll('.content-card');
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
    }
  }

  /**
   * Create modal content HTML with real data
   */
  createModalContent(content) {
    const backdropImage = content.backdrop || content.poster;
    const castList = content.cast ? content.cast.join(', ') : 'Cast information not available';
    const genreList = content.genres ? content.genres.join(', ') : 'Genre information not available';

    return `
      <button class="modal-close absolute top-4 right-4 z-20 bg-black bg-opacity-50 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-75 transition-all" aria-label="Close modal">×</button>
      <div class="modal-header relative">
        <img src="${backdropImage}" 
             alt="${content.title} backdrop" 
             class="w-full h-64 md:h-80 object-cover"
             onerror="this.src='https://via.placeholder.com/800x450/333333/ffffff?text=${encodeURIComponent(content.title)}'">
        <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        <div class="modal-info absolute bottom-4 left-4 right-4">
          <h2 id="modal-title" class="text-3xl md:text-4xl font-bold mb-2 text-white">${content.title}</h2>
          <div class="modal-meta flex items-center space-x-4 text-sm text-gray-300">
            <span class="rating flex items-center">
              <svg class="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
              ${content.rating}
            </span>
            <span class="year">${content.year}</span>
            <span class="duration">${content.duration}</span>
            <span class="type capitalize">${content.type.replace('-', ' ')}</span>
          </div>
        </div>
      </div>
      <div class="modal-body p-6">
        <p class="description text-gray-200 mb-4 leading-relaxed text-lg">
          ${content.description}
        </p>
        <div class="cast mb-4">
          <span class="font-semibold text-white">Cast:</span>
          <span class="text-gray-300"> ${castList}</span>
        </div>
        <div class="genres mb-6">
          <span class="font-semibold text-white">Genres:</span>
          <span class="text-gray-300"> ${genreList}</span>
        </div>
        <div class="modal-actions flex flex-wrap gap-4">
          <button class="btn-play bg-white text-black px-6 py-3 rounded font-semibold flex items-center space-x-2 hover:bg-gray-200 transition-colors">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path>
            </svg>
            <span>Play</span>
          </button>
          <button class="btn-list bg-gray-600 text-white px-6 py-3 rounded font-semibold flex items-center space-x-2 hover:bg-gray-500 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            <span>My List</span>
          </button>
          <button class="btn-like bg-gray-600 text-white px-6 py-3 rounded font-semibold flex items-center space-x-2 hover:bg-gray-500 transition-colors">
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
    
    // Remove event listeners to prevent memory leaks
    this.removeModalEventListeners();
    
    // Hide modal
    modalOverlay.classList.add('hidden');
    modalOverlay.setAttribute('aria-hidden', 'true');
    
    // Reset state
    AppState.currentModal = null;
    
    // Restore background scrolling
    document.body.style.overflow = '';
    document.body.classList.remove('modal-open');
    
    // Announce to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = 'Modal closed';
    
    document.body.appendChild(announcement);
    
    // Remove announcement after screen reader has time to read it
    setTimeout(() => {
      if (announcement.parentNode) {
        announcement.parentNode.removeChild(announcement);
      }
    }, 1000);
    
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

  /**
   * Show modal loading state
   */
  showModalLoadingState(modalContent) {
    modalContent.innerHTML = `
      <div class="modal-placeholder p-8 text-center text-gray-400">
        <div class="loading-spinner mx-auto mb-4"></div>
        <p>Loading content details...</p>
      </div>
    `;
  }

  /**
   * Setup modal interactions and event listeners
   */
  setupModalInteractions(content) {
    const modalOverlay = document.querySelector('.modal-overlay');
    const modalContent = document.querySelector('.modal-content');
    const closeButton = modalContent.querySelector('.modal-close');
    
    // Remove any existing event listeners to prevent duplicates
    this.removeModalEventListeners();
    
    // Close button click handler
    if (closeButton) {
      this.modalCloseHandler = () => this.closeModal();
      closeButton.addEventListener('click', this.modalCloseHandler);
    }
    
    // Click outside to close (overlay click)
    this.modalOverlayClickHandler = (e) => {
      if (e.target === modalOverlay) {
        this.closeModal();
      }
    };
    modalOverlay.addEventListener('click', this.modalOverlayClickHandler);
    
    // Escape key to close
    this.modalKeydownHandler = (e) => {
      if (e.key === 'Escape' && AppState.currentModal) {
        e.preventDefault();
        this.closeModal();
      }
      
      // Trap focus within modal
      if (e.key === 'Tab') {
        this.trapFocusInModal(e, modalContent);
      }
    };
    document.addEventListener('keydown', this.modalKeydownHandler);
    
    // Setup modal action buttons
    this.setupModalActions(content);
    
    // Setup focus trap
    this.setupModalFocusTrap(modalContent);
  }

  /**
   * Remove modal event listeners to prevent memory leaks
   */
  removeModalEventListeners() {
    if (this.modalCloseHandler) {
      const closeButton = document.querySelector('.modal-close');
      if (closeButton) {
        closeButton.removeEventListener('click', this.modalCloseHandler);
      }
    }
    
    if (this.modalOverlayClickHandler) {
      const modalOverlay = document.querySelector('.modal-overlay');
      if (modalOverlay) {
        modalOverlay.removeEventListener('click', this.modalOverlayClickHandler);
      }
    }
    
    if (this.modalKeydownHandler) {
      document.removeEventListener('keydown', this.modalKeydownHandler);
    }
  }

  /**
   * Setup focus trap within modal for accessibility
   */
  setupModalFocusTrap(modalContent) {
    const focusableElements = modalContent.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    this.modalFocusableElements = Array.from(focusableElements);
    this.modalFirstFocusable = this.modalFocusableElements[0];
    this.modalLastFocusable = this.modalFocusableElements[this.modalFocusableElements.length - 1];
  }

  /**
   * Trap focus within modal
   */
  trapFocusInModal(e, modalContent) {
    if (!this.modalFocusableElements || this.modalFocusableElements.length === 0) {
      return;
    }
    
    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === this.modalFirstFocusable) {
        e.preventDefault();
        this.modalLastFocusable.focus();
      }
    } else {
      // Tab
      if (document.activeElement === this.modalLastFocusable) {
        e.preventDefault();
        this.modalFirstFocusable.focus();
      }
    }
  }

  /**
   * Announce modal opening to screen readers
   */
  announceModalOpen(contentTitle) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `Modal opened for ${contentTitle}. Press Escape to close.`;
    
    document.body.appendChild(announcement);
    
    // Remove announcement after screen reader has time to read it
    setTimeout(() => {
      if (announcement.parentNode) {
        announcement.parentNode.removeChild(announcement);
      }
    }, 1000);
  }

  /**
   * Update My List button appearance
   */
  updateMyListButton(button, isInList) {
    if (!button) return;
    
    if (isInList) {
      button.classList.add('in-list');
      button.innerHTML = `
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
        </svg>
        <span>In My List</span>
      `;
      button.setAttribute('aria-label', 'Remove from My List');
    } else {
      button.classList.remove('in-list');
      button.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        <span>My List</span>
      `;
      button.setAttribute('aria-label', 'Add to My List');
    }
  }

  /**
   * Refresh My List content row
   */
  refreshMyListRow() {
    const myListSlider = document.querySelector('[data-category="my-list"]');
    if (myListSlider) {
      const myListCategory = AppState.contentData.categories.find(cat => cat.id === 'my-list');
      if (myListCategory) {
        myListSlider.innerHTML = this.createContentCards(myListCategory.items);
        
        // Re-setup content card click handlers for the refreshed content
        const contentCards = myListSlider.querySelectorAll('.content-card');
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
    }
  }
}

// Initialize the application when the script loads
const netflixApp = new NetflixApp();

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NetflixApp;
}