// Enhanced Game database with grid layout for featured/popular games and swipe for others

// Unified pointer events for cards
function initializeCardInteractions() {
  const gameCards = document.querySelectorAll(".game-card");
  gameCards.forEach((card) => {
    // Use pointer events for better cross-device compatibility
    card.addEventListener("pointerdown", handleCardPress);
    card.addEventListener("pointerup", handleCardRelease);
    card.addEventListener("pointercancel", handleCardRelease);
    card.addEventListener("pointerleave", handleCardRelease);
  });
}

function handleCardPress(e) {
  e.currentTarget.style.transform = "scale(0.95)";
  e.currentTarget.style.transition = "transform 0.1s ease";
}

function handleCardRelease(e) {
  e.currentTarget.style.transform = "scale(1)";
  e.currentTarget.style.transition = "transform 0.2s ease";
}

// Enhanced Netflix-style swipe functionality with smooth transitions
class SwipeHandler {
  constructor(container) {
    this.container = container;
    this.startX = 0;
    this.startY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.isDragging = false;
    this.isScrolling = false;
    this.threshold = 30; // minimum swipe distance
    this.restraint = 100; // maximum distance in perpendicular direction
    this.allowedTime = 500; // maximum time for swipe
    this.startTime = 0;
    this.initialTranslate = 0;
    this.currentTranslate = 0;
    this.animationId = null;
    this.velocity = 0;
    this.lastMoveTime = 0;
    this.lastMoveX = 0;

    this.initializeSwipe();
    this.setupContainer();
  }

  setupContainer() {
    // Ensure smooth hardware acceleration
    this.container.style.willChange = "transform";
    this.container.style.transform = "translateX(0px)";
    this.container.style.transition = "none";
  }

  initializeSwipe() {
    // Touch events with improved passive handling
    this.container.addEventListener(
      "touchstart",
      this.handleTouchStart.bind(this),
      { passive: false }
    );
    this.container.addEventListener(
      "touchmove",
      this.handleTouchMove.bind(this),
      { passive: false }
    );
    this.container.addEventListener(
      "touchend",
      this.handleTouchEnd.bind(this),
      { passive: false }
    );

    // Mouse events for desktop
    this.container.addEventListener(
      "mousedown",
      this.handleMouseDown.bind(this)
    );
    this.container.addEventListener(
      "mousemove",
      this.handleMouseMove.bind(this)
    );
    this.container.addEventListener("mouseup", this.handleMouseUp.bind(this));
    this.container.addEventListener(
      "mouseleave",
      this.handleMouseUp.bind(this)
    );

    // Prevent context menu on long press
    this.container.addEventListener("contextmenu", (e) => {
      if (this.isDragging) e.preventDefault();
    });
  }

  handleTouchStart(e) {
    this.startTouch(e.touches[0].clientX, e.touches[0].clientY);
  }

  handleTouchMove(e) {
    if (!this.isDragging) return;

    this.currentX = e.touches[0].clientX;
    this.currentY = e.touches[0].clientY;

    // Determine if this is a horizontal swipe
    const deltaX = Math.abs(this.currentX - this.startX);
    const deltaY = Math.abs(this.currentY - this.startY);

    if (deltaX > deltaY && deltaX > 5) {
      e.preventDefault(); // Prevent vertical scrolling
      this.isScrolling = true;
      this.updateSwipePosition();
    }
  }

  handleTouchEnd(e) {
    this.endTouch();
  }

  handleMouseDown(e) {
    e.preventDefault();
    this.startTouch(e.clientX, e.clientY);
  }

  handleMouseMove(e) {
    if (!this.isDragging) return;

    this.currentX = e.clientX;
    this.currentY = e.clientY;

    const deltaX = Math.abs(this.currentX - this.startX);
    const deltaY = Math.abs(this.currentY - this.startY);

    if (deltaX > deltaY && deltaX > 5) {
      e.preventDefault();
      this.isScrolling = true;
      this.updateSwipePosition();
    }
  }

  handleMouseUp(e) {
    this.endTouch();
  }

  startTouch(x, y) {
    this.startX = x;
    this.startY = y;
    this.currentX = x;
    this.currentY = y;
    this.isDragging = true;
    this.isScrolling = false;
    this.startTime = Date.now();
    this.lastMoveTime = this.startTime;
    this.lastMoveX = x;
    this.initialTranslate = this.getTranslateX(this.container.style.transform);
    this.currentTranslate = this.initialTranslate;
    this.velocity = 0;

    // Stop any ongoing animations
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    this.container.style.transition = "none";
  }

  updateSwipePosition() {
    const now = Date.now();
    const deltaX = this.currentX - this.startX;

    // Calculate velocity for momentum
    if (now - this.lastMoveTime > 0) {
      this.velocity =
        (this.currentX - this.lastMoveX) / (now - this.lastMoveTime);
    }

    this.lastMoveTime = now;
    this.lastMoveX = this.currentX;

    // Apply damping at boundaries
    const newTranslate = this.initialTranslate + deltaX;
    const dampedTranslate = this.applyBoundaryDamping(newTranslate);

    this.currentTranslate = dampedTranslate;
    this.container.style.transform = `translateX(${dampedTranslate}px)`;
  }

  applyBoundaryDamping(translate) {
    const containerWidth = this.container.offsetWidth;
    const scrollWidth = this.container.scrollWidth;
    const maxTranslate = 0;
    const minTranslate = -(scrollWidth - containerWidth);

    // Apply rubber band effect at boundaries
    if (translate > maxTranslate) {
      const excess = translate - maxTranslate;
      return maxTranslate + excess * 0.3;
    } else if (translate < minTranslate) {
      const excess = minTranslate - translate;
      return minTranslate - excess * 0.3;
    }

    return translate;
  }

  endTouch() {
    if (!this.isDragging) return;

    const deltaX = this.currentX - this.startX;
    const deltaY = this.currentY - this.startY;
    const elapsedTime = Date.now() - this.startTime;

    this.isDragging = false;

    // Enhanced swipe detection with velocity consideration
    const isValidSwipe =
      (elapsedTime <= this.allowedTime &&
        Math.abs(deltaX) >= this.threshold &&
        Math.abs(deltaY) <= this.restraint) ||
      (Math.abs(this.velocity) > 0.5 && Math.abs(deltaX) > 10);

    if (isValidSwipe) {
      if (deltaX > 0 || this.velocity > 0) {
        this.swipeRight();
      } else {
        this.swipeLeft();
      }
    } else {
      this.snapToPosition();
    }

    setTimeout(() => {
      this.isScrolling = false;
    }, 100);
  }

  swipeLeft() {
    const containerWidth = this.container.offsetWidth;
    const scrollWidth = this.container.scrollWidth;
    const cardWidth = this.getCardWidth();
    const containerPadding = this.getContainerPadding();
    const availableWidth = containerWidth - containerPadding;

    // Calculate how many cards can fit fully in the viewport
    const cardsVisible = Math.floor(availableWidth / cardWidth);

    // For mobile, show 1-2 cards at a time, for desktop show more
    const isMobile = containerWidth < 768;
    const swipeCards = isMobile
      ? Math.max(1, Math.floor(cardsVisible * 0.5))
      : Math.max(1, Math.floor(cardsVisible * 0.7));
    const swipeDistance = cardWidth * swipeCards;

    let newTranslate = this.currentTranslate - swipeDistance;

    // Add momentum based on velocity
    if (Math.abs(this.velocity) > 0.5) {
      newTranslate -= this.velocity * 80;
    }

    // Ensure we don't go beyond the last card
    const maxScroll = scrollWidth - containerWidth + containerPadding;
    const minTranslate = -maxScroll;
    newTranslate = Math.max(newTranslate, minTranslate);

    this.animateToPosition(newTranslate);
  }

  swipeRight() {
    const cardWidth = this.getCardWidth();
    const containerWidth = this.container.offsetWidth;
    const containerPadding = this.getContainerPadding();
    const availableWidth = containerWidth - containerPadding;

    const cardsVisible = Math.floor(availableWidth / cardWidth);
    const isMobile = containerWidth < 768;
    const swipeCards = isMobile
      ? Math.max(1, Math.floor(cardsVisible * 0.5))
      : Math.max(1, Math.floor(cardsVisible * 0.7));
    const swipeDistance = cardWidth * swipeCards;

    let newTranslate = this.currentTranslate + swipeDistance;

    // Add momentum based on velocity
    if (Math.abs(this.velocity) > 0.5) {
      newTranslate += this.velocity * 80;
    }

    // Don't go beyond the first card
    newTranslate = Math.min(newTranslate, 0);

    this.animateToPosition(newTranslate);
  }

  snapToPosition() {
    const cardWidth = this.getCardWidth();
    const containerWidth = this.container.offsetWidth;
    const scrollWidth = this.container.scrollWidth;
    const maxTranslate = 0;
    const minTranslate = -(scrollWidth - containerWidth);

    // Snap to nearest card position
    let snapPosition =
      Math.round(this.currentTranslate / cardWidth) * cardWidth;
    snapPosition = Math.max(Math.min(snapPosition, maxTranslate), minTranslate);

    this.animateToPosition(snapPosition);
  }

  animateToPosition(targetTranslate) {
    const startTranslate = this.currentTranslate;
    const distance = targetTranslate - startTranslate;
    const duration = 400; // ms
    const startTime = Date.now();

    this.container.style.transition = "none";

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth easing function
      const easeProgress = this.easeOutCubic(progress);
      const currentTranslate = startTranslate + distance * easeProgress;

      this.container.style.transform = `translateX(${currentTranslate}px)`;
      this.currentTranslate = currentTranslate;

      if (progress < 1) {
        this.animationId = requestAnimationFrame(animate);
      } else {
        this.animationId = null;
      }
    };

    animate();
  }

  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  getCardWidth() {
    const card = this.container.querySelector(".game-card");
    if (!card) return 200;

    const cardRect = card.getBoundingClientRect();
    const cardStyle = window.getComputedStyle(card);
    const marginLeft = parseFloat(cardStyle.marginLeft) || 0;
    const marginRight = parseFloat(cardStyle.marginRight) || 0;

    return cardRect.width + marginLeft + marginRight;
  }

  getContainerPadding() {
    const containerStyle = window.getComputedStyle(this.container);
    const paddingLeft = parseFloat(containerStyle.paddingLeft) || 0;
    const paddingRight = parseFloat(containerStyle.paddingRight) || 0;
    return paddingLeft + paddingRight;
  }

  getTranslateX(transform) {
    if (!transform || transform === "none") return 0;
    const matrix = transform.match(/matrix.*\((.+)\)/);
    if (matrix) {
      return parseFloat(matrix[1].split(", ")[4]) || 0;
    }
    const translateX = transform.match(/translateX\((.+?)px\)/);
    return translateX ? parseFloat(translateX[1]) : 0;
  }
}

// Throttle function to prevent overload
function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Game database
const games = {
  featured: [
    {
      name: "Red Light Green Light",
      description: "Classic childhood game with survival twist",
      url: "./games/red-light-green-light.html",
      image: "./images/dollgame.jpg",
      rating: "98%",
      category: "popularGames",
      // featured: true,
    },
    {
      name: "Rock Paper Scissors",
      description:
        "Outsmart your opponent in the fast-paced classic — Rock, Paper, Scissors! Choose wisely and win the showdown.",
      url: "./games/rcs.html",
      image: "./images/rock_paper_scissors.jpg",
      rating: "95%",
      category: "action",
    },
    {
      name: "Tic-Tac-Toe",
      description:
        "Outsmart your opponent in this classic game of Xs and Os. Line up three to win!",
      url: "./games/tic-tac-toe.html",
      image: "./images/tic-tac-toe.jpg",
      rating: "92%",
      category: "action",
    },
  ],
  popular: [
    {
      name: "Red Light Green Light",
      description: "Classic childhood game with survival twist",
      url: "./games/red-light-green-light.html",
      image: "./images/squidlogo.jpg",
      rating: "98%",
      category: "action",
      // featured: true,
    },
    {
      name: "Tic Tac Toe",
      description: "Classic strategy game for two players",
      url: "./games/tic-tac-toe.html",
      image: "./images/tic 2.jpg",
      rating: "87%",
      category: "classic",
    },
  ],
  classic: [
    {
      name: "Rock Paper Scissors",
      description:
        "Outsmart your opponent in the fast-paced classic — Rock, Paper, Scissors! Choose wisely and win the showdown.",
      url: "./games/rcs.html",
      image: "./images/rock_paper_scissors.jpg",
      rating: "95%",
      category: "action",
    },
  ],
};

// Create game card with improved accessibility
function createGameCard(game, isFeatured = false) {
  const card = document.createElement("a");
  card.href = game.url;
  card.className = isFeatured ? "game-card featured-game" : "game-card";
  card.setAttribute("aria-label", `Play ${game.name} - ${game.description}`);
  card.innerHTML = `
      <img src="${game.image}" alt="${
    game.name
  }" class="game-image" loading="lazy">
      <div class="game-info">
          <h3 class="game-title">${game.name}</h3>
          <p class="game-description">${game.description}</p>
          <div class="game-meta">
              <span class="game-rating" aria-label="Rating: ${game.rating}">${
    game.rating
  }</span>
              <span class="game-category">${
                game.category.charAt(0).toUpperCase() + game.category.slice(1)
              }</span>
          </div>
      </div>
  `;
  return card;
}

// Check if a section should use grid layout
function isGridSection(sectionId) {
  return sectionId === "featuredGames" || sectionId === "popularGames";
}

// Populate game sections with error handling
function populateGames() {
  try {
    const sections = {
      featuredGames: games.featured,
      popularGames: games.popular,
      classicGames: games.classic,
      newGames: games.new || [],
    };

    Object.entries(sections).forEach(([sectionId, gameList]) => {
      const container = document.getElementById(sectionId);
      if (container && gameList) {
        gameList.forEach((game) => {
          container.appendChild(createGameCard(game, game.featured));
        });
      }
    });

    // Initialize layout handlers
    initializeLayoutHandlers();
  } catch (error) {
    console.error("Error populating games:", error);
  }
}

// Initialize layout handlers - grid for featured/popular, swipe for others
function initializeLayoutHandlers() {
  const gameRows = document.querySelectorAll(".games-row");

  gameRows.forEach((row) => {
    const sectionId = row.id;

    if (isGridSection(sectionId)) {
      // Set up grid layout for featured and popular games
      setupGridLayout(row);
    } else {
      // Set up swipe layout for other sections
      setupSwipeLayout(row);
    }
  });

  // Add CSS for both layouts
  addLayoutStyles();
}

// Setup grid layout for featured and popular games
function setupGridLayout(row) {
  row.classList.add("games-grid");
  row.style.display = "grid";
  row.style.overflowX = "visible";
  row.style.overflowY = "visible";
  row.style.cursor = "default";
  row.style.transform = "none";
  row.style.willChange = "auto";

  // Remove any existing transform
  row.style.transform = "translateX(0px)";
}

// Setup swipe layout for other sections
function setupSwipeLayout(row) {
  row.classList.add("games-swipe");
  row.style.display = "flex";
  row.style.gap = "12px";
  row.style.overflowX = "hidden";
  row.style.overflowY = "visible";
  row.style.willChange = "transform";
  row.style.cursor = "grab";

  // Mobile-specific adjustments
  if (window.innerWidth < 768) {
    row.style.paddingLeft = "16px";
    row.style.paddingRight = "16px";
    row.style.gap = "8px";
  } else {
    row.style.paddingLeft = "20px";
    row.style.paddingRight = "20px";
    row.style.gap = "16px";
  }

  // Add active cursor during drag
  row.addEventListener("mousedown", () => {
    row.style.cursor = "grabbing";
  });

  row.addEventListener("mouseup", () => {
    row.style.cursor = "grab";
  });

  row.addEventListener("mouseleave", () => {
    row.style.cursor = "grab";
  });

  // Initialize swipe handler
  new SwipeHandler(row);
}

// Add dynamic CSS for both grid and swipe layouts
function addLayoutStyles() {
  const existingStyle = document.getElementById("layout-styles");
  if (existingStyle) existingStyle.remove();

  const style = document.createElement("style");
  style.id = "layout-styles";

  style.textContent = `
    /* Grid Layout Styles for Featured and Popular Games */
    .games-grid {
      display: grid !important;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      padding: 20px;
    }
    
    .games-grid .game-card {
      flex: none !important;
      width: 100%;
      min-width: auto !important;
      max-width: none !important;
    }
    
    /* Responsive grid adjustments */
    @media (max-width: 480px) {
      .games-grid {
        grid-template-columns: 1fr;
        gap: 16px;
        padding: 16px;
      }
    }
    
    @media (min-width: 481px) and (max-width: 768px) {
      .games-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
        padding: 16px;
      }
    }
    
    @media (min-width: 769px) and (max-width: 1024px) {
      .games-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 18px;
        padding: 18px;
      }
    }
    
    @media (min-width: 1025px) {
      .games-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
        padding: 20px;
      }
    }
    
    /* Swipe Layout Styles for Other Sections */
    .games-swipe {
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
    }
    
    .games-swipe .game-card {
      scroll-snap-align: start;
    }
    
    @media (max-width: 767px) {
      .games-swipe {
        padding-left: 16px !important;
        padding-right: 16px !important;
        gap: 8px !important;
      }
      
      .games-swipe .game-card {
        flex: 0 0 calc(45vw - 12px);
        min-width: 160px;
        max-width: 200px;
      }
      
      .games-swipe .game-card .game-image {
        width: 100%;
        height: auto;
        aspect-ratio: 16/9;
        object-fit: cover;
      }
    }
    
    @media (min-width: 768px) {
      .games-swipe {
        padding-left: 20px !important;
        padding-right: 20px !important;
        gap: 16px !important;
      }
      
      .games-swipe .game-card {
        flex: 0 0 auto;
        min-width: 200px;
        max-width: 280px;
      }
    }
    
    /* General game card styles */
    .game-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      border-radius: 12px;
      overflow: hidden;
      background: #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .game-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }
    
    .game-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
      display: block;
    }
    
    .game-info {
      padding: 16px;
    }
    
    .game-title {
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: #333;
    }
    
    .game-description {
      font-size: 0.9rem;
      color: #666;
      margin: 0 0 12px 0;
      line-height: 1.4;
    }
    
    .game-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
    }
    
    .game-rating {
      color: #4CAF50;
      font-weight: 600;
    }
    
    .game-category {
      color: #888;
      text-transform: capitalize;
    }
  `;

  document.head.appendChild(style);
}

// Filter games with improved performance
function filterGames(category) {
  try {
    const buttons = document.querySelectorAll(".category-btn");
    buttons.forEach((btn) => btn.classList.remove("active"));

    // Use event delegation or find the clicked button
    const clickedButton =
      document.querySelector(`[data-category="${category}"]`) ||
      Array.from(buttons).find(
        (btn) => btn.textContent.toLowerCase() === category
      );
    if (clickedButton) {
      clickedButton.classList.add("active");
    }

    const allCards = document.querySelectorAll(".game-card");
    allCards.forEach((card) => {
      const categoryElement = card.querySelector(".game-category");
      if (categoryElement) {
        const gameCategory = categoryElement.textContent.toLowerCase();
        card.style.display =
          category === "all" || gameCategory === category ? "block" : "none";
      }
    });
  } catch (error) {
    console.error("Error filtering games:", error);
  }
}

// Enhanced search functionality with debouncing
function initializeSearch() {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;

  const debouncedSearch = throttle(function (searchTerm) {
    const allCards = document.querySelectorAll(".game-card");
    allCards.forEach((card) => {
      const titleElement = card.querySelector(".game-title");
      const descriptionElement = card.querySelector(".game-description");

      if (titleElement && descriptionElement) {
        const title = titleElement.textContent.toLowerCase();
        const description = descriptionElement.textContent.toLowerCase();

        const matches =
          title.includes(searchTerm) || description.includes(searchTerm);
        card.style.display = matches || searchTerm === "" ? "block" : "none";
      }
    });
  }, 300);

  searchInput.addEventListener("input", function (e) {
    const searchTerm = e.target.value.toLowerCase();
    debouncedSearch(searchTerm);
  });
}

// Prevent default touch behaviors on specific elements
function preventDefaultTouchBehavior() {
  document.addEventListener(
    "touchstart",
    function (e) {
      // Allow touch events on interactive elements
      if (e.target.matches("input, button, a, select, textarea")) {
        return;
      }
    },
    { passive: true }
  );

  document.addEventListener(
    "touchmove",
    function (e) {
      // Only prevent default if not scrolling vertically
      const touch = e.touches[0];
      if (touch) {
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        if (element && element.closest(".games-swipe")) {
          // Let the swipe handler manage this
          return;
        }
      }
    },
    { passive: true }
  );
}

// Initialize everything when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  try {
    populateGames();
    initializeCardInteractions();
    initializeSearch();
    preventDefaultTouchBehavior();

    // Add category filter event listeners
    const categoryButtons = document.querySelectorAll(".category-btn");
    categoryButtons.forEach((button) => {
      button.addEventListener("click", function (e) {
        e.preventDefault();
        const category =
          this.dataset.category || this.textContent.toLowerCase();
        filterGames(category);
      });
    });
  } catch (error) {
    console.error("Error initializing application:", error);
  }
});

// Handle window resize for responsive behavior with smooth transitions
window.addEventListener(
  "resize",
  throttle(function () {
    // Only reset transforms for swipe sections
    const swipeRows = document.querySelectorAll(".games-swipe");
    swipeRows.forEach((row) => {
      row.style.transition = "transform 0.3s ease";
      row.style.transform = "translateX(0px)";

      // Remove transition after animation
      setTimeout(() => {
        row.style.transition = "none";
      }, 300);
    });

    // Reinitialize layout styles
    addLayoutStyles();
  }, 250)
);

// Export for potential module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = { games, createGameCard, filterGames, SwipeHandler };
}
