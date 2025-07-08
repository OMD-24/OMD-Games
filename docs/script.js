// Enhanced Game database with mobile fixes

// Unified pointer events
const gameCards = document.querySelectorAll(".game-card");
gameCards.forEach((card) => {
  card.addEventListener("pointerdown", () => {
    card.style.transform = "scale(0.95)";
  });
  card.addEventListener("pointerup", () => {
    card.style.transform = "scale(1)";
  });
});

// Touch-friendly scrolling logic
let isScrolling = false;
document.addEventListener(
  "touchmove",
  function (e) {
    if (!isScrolling) {
      e.preventDefault();
    }
  },
  { passive: false }
);

document.querySelectorAll(".games-row, .categories").forEach((row) => {
  row.addEventListener("touchstart", function () {
    isScrolling = true;
  });
  row.addEventListener("touchend", function () {
    isScrolling = false;
  });
});

// Throttle function to prevent overload
function throttle(func, limit) {
  let lastFunc;
  let lastRan;
  return function () {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function () {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
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

// Create game card
function createGameCard(game, isFeatured = false) {
  const card = document.createElement("a");
  card.href = game.url;
  card.className = isFeatured ? "game-card featured-game" : "game-card";
  card.innerHTML = `
      <img src="${game.image}" alt="${game.name}" class="game-image">
      <div class="game-info">
          <h3 class="game-title">${game.name}</h3>
          <p class="game-description">${game.description}</p>
          <div class="game-meta">
              <span class="game-rating">${game.rating}</span>
              <span class="game-category">${
                game.category.charAt(0).toUpperCase() + game.category.slice(1)
              }</span>
          </div>
      </div>
  `;
  return card;
}

// Populate game sections
function populateGames() {
  const featuredGrid = document.getElementById("featuredGames");
  const popularGrid = document.getElementById("popularGames");
  const classicGrid = document.getElementById("classicGames");
  const newGrid = document.getElementById("newGames");

  games.featured.forEach((game) => {
    featuredGrid.appendChild(createGameCard(game, game.featured));
  });
  games.popular.forEach((game) => {
    popularGrid.appendChild(createGameCard(game));
  });
  games.classic.forEach((game) => {
    classicGrid.appendChild(createGameCard(game));
  });
  if (games.new) {
    games.new.forEach((game) => {
      newGrid.appendChild(createGameCard(game));
    });
  }
}

// Filter games
function filterGames(category) {
  const buttons = document.querySelectorAll(".category-btn");
  buttons.forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");
  const allCards = document.querySelectorAll(".game-card");
  allCards.forEach((card) => {
    const gameCategory = card
      .querySelector(".game-category")
      .textContent.toLowerCase();
    card.style.display =
      category === "all" || gameCategory === category ? "block" : "none";
  });
}

// Search functionality
const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("input", function (e) {
  const searchTerm = e.target.value.toLowerCase();
  const allCards = document.querySelectorAll(".game-card");
  allCards.forEach((card) => {
    const title = card.querySelector(".game-title").textContent.toLowerCase();
    const description = card
      .querySelector(".game-description")
      .textContent.toLowerCase();
    card.style.display =
      title.includes(searchTerm) || description.includes(searchTerm)
        ? "block"
        : searchTerm
        ? "none"
        : "block";
  });
});

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", function () {
  populateGames();
});
