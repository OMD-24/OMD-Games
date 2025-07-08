// Enhanced Game database with mobile fixes and Netflix-style swipe functionality

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

// Netflix-style swipe functionality
class SwipeHandler {
  constructor(container) {
    this.container = container;
    this.startX = 0;
    this.startY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.isDragging = false;
    this.isScrolling = false;
    this.threshold = 50; // minimum swipe distance
    this.restraint = 100; // maximum distance in perpendicular direction
    this.allowedTime = 300; // maximum time for swipe
    this.startTime = 0;

    this.initializeSwipe();
  }

  initializeSwipe() {
    // Touch events
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

    if (deltaX > deltaY && deltaX > 10) {
      e.preventDefault(); // Prevent vertical scrolling
      this.isScrolling = true;
      this.updateSwipePosition();
    }
  }

  handleTouchEnd(e) {
    this.endTouch();
  }

  handleMouseDown(e) {
    this.startTouch(e.clientX, e.clientY);
  }

  handleMouseMove(e) {
    if (!this.isDragging) return;

    this.currentX = e.clientX;
    this.currentY = e.clientY;

    const deltaX = Math.abs(this.currentX - this.startX);
    const deltaY = Math.abs(this.currentY - this.startY);

    if (deltaX > deltaY && deltaX > 10) {
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
    this.container.style.transition = "none";
  }

  updateSwipePosition() {
    const deltaX = this.currentX - this.startX;
    const currentTransform = this.container.style.transform;
    const currentTranslate = this.getTranslateX(currentTransform);

    this.container.style.transform = `translateX(${
      currentTranslate + deltaX
    }px)`;
  }

  endTouch() {
    if (!this.isDragging) return;

    const deltaX = this.currentX - this.startX;
    const deltaY = this.currentY - this.startY;
    const elapsedTime = Date.now() - this.startTime;

    this.isDragging = false;
    this.container.style.transition = "transform 0.3s ease";

    // Check if it's a valid swipe
    if (
      elapsedTime <= this.allowedTime &&
      Math.abs(deltaX) >= this.threshold &&
      Math.abs(deltaY) <= this.restraint
    ) {
      if (deltaX > 0) {
        this.swipeRight();
      } else {
        this.swipeLeft();
      }
    } else {
      // Reset position
      this.resetPosition();
    }

    setTimeout(() => {
      this.isScrolling = false;
    }, 100);
  }

  swipeLeft() {
    const containerWidth = this.container.offsetWidth;
    const scrollWidth = this.container.scrollWidth;
    const currentTranslate = this.getTranslateX(this.container.style.transform);
    const cardWidth =
      this.container.querySelector(".game-card")?.offsetWidth || 200;

    const newTranslate = Math.max(
      currentTranslate - cardWidth * 2,
      -(scrollWidth - containerWidth)
    );
    this.container.style.transform = `translateX(${newTranslate}px)`;
  }

  swipeRight() {
    const currentTranslate = this.getTranslateX(this.container.style.transform);
    const cardWidth =
      this.container.querySelector(".game-card")?.offsetWidth || 200;

    const newTranslate = Math.min(currentTranslate + cardWidth * 2, 0);
    this.container.style.transform = `translateX(${newTranslate}px)`;
  }

  resetPosition() {
    const currentTranslate = this.getTranslateX(this.container.style.transform);
    this.container.style.transform = `translateX(${currentTranslate}px)`;
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
      category: "action",
      featured: true,
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
      featured: true,
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

    // Initialize swipe handlers for each game row
    initializeSwipeHandlers();
  } catch (error) {
    console.error("Error populating games:", error);
  }
}

// Initialize swipe handlers for game rows
function initializeSwipeHandlers() {
  const gameRows = document.querySelectorAll(".games-row");
  gameRows.forEach((row) => {
    new SwipeHandler(row);
  });
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
        if (element && element.closest(".games-row")) {
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

// Handle window resize for responsive behavior
window.addEventListener(
  "resize",
  throttle(function () {
    // Reset transforms on resize to prevent layout issues
    const gameRows = document.querySelectorAll(".games-row");
    gameRows.forEach((row) => {
      row.style.transform = "translateX(0px)";
    });
  }, 250)
);

// Export for potential module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = { games, createGameCard, filterGames, SwipeHandler };
}
