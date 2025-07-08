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

// Function to create game card
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
                    game.category.charAt(0).toUpperCase() +
                    game.category.slice(1)
                  }</span>
              </div>
          </div>
      `;
  return card;
}

// Function to populate game sections
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

  games.new.forEach((game) => {
    newGrid.appendChild(createGameCard(game));
  });
}

// Function to filter games by category
function filterGames(category) {
  const buttons = document.querySelectorAll(".category-btn");
  buttons.forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");

  const allCards = document.querySelectorAll(".game-card");
  allCards.forEach((card) => {
    if (category === "all") {
      card.style.display = "block";
    } else {
      const gameCategory = card
        .querySelector(".game-category")
        .textContent.toLowerCase();
      card.style.display = gameCategory === category ? "block" : "none";
    }
  });
}

// Header scroll effect
window.addEventListener("scroll", () => {
  const header = document.getElementById("header");
  if (window.scrollY > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

// Search functionality
document.getElementById("searchInput").addEventListener("input", function (e) {
  const searchTerm = e.target.value.toLowerCase();
  const allCards = document.querySelectorAll(".game-card");

  allCards.forEach((card) => {
    const title = card.querySelector(".game-title").textContent.toLowerCase();
    const description = card
      .querySelector(".game-description")
      .textContent.toLowerCase();

    if (title.includes(searchTerm) || description.includes(searchTerm)) {
      card.style.display = "block";
    } else {
      card.style.display = searchTerm ? "none" : "block";
    }
  });
});

// Initialize the page
document.addEventListener("DOMContentLoaded", function () {
  populateGames();
});

// Mobile menu toggle
// const mobileMenuBtn = document.getElementById("mobileMenuBtn");
// const mobileMenu = document.getElementById("mobileMenu");

// mobileMenuBtn.addEventListener("click", () => {
//   mobileMenu.classList.toggle("active");
// });

// // Close mobile menu when clicking on nav links
// const mobileNavLinks = mobileMenu.querySelectorAll("a");
// mobileNavLinks.forEach((link) => {
//   link.addEventListener("click", () => {
//     mobileMenu.classList.remove("active");
//   });
// });

// Header scroll effect
window.addEventListener("scroll", () => {
  const header = document.getElementById("header");
  if (window.scrollY > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

// Category filtering
function filterGames(category) {
  const categoryBtns = document.querySelectorAll(".category-btn");
  categoryBtns.forEach((btn) => {
    btn.classList.remove("active");
  });

  event.target.classList.add("active");

  // Add your filtering logic here
  console.log("Filtering games by:", category);
}

// Search functionality
const searchInputs = document.querySelectorAll(
  "#searchInput, .mobile-menu .search-box"
);
searchInputs.forEach((input) => {
  input.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    // Add your search logic here
    console.log("Searching for:", searchTerm);
  });
});

// Touch-friendly interactions for mobile
const gameCards = document.querySelectorAll(".game-card");
gameCards.forEach((card) => {
  card.addEventListener("touchstart", function (e) {
    this.style.transform = "scale(0.95)";
  });

  card.addEventListener("touchend", function (e) {
    this.style.transform = "scale(1)";
  });
});

// Prevent horizontal scroll on mobile
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

// Allow scrolling for games rows
document.querySelectorAll(".games-row, .categories").forEach((row) => {
  row.addEventListener("touchstart", function () {
    isScrolling = true;
  });

  row.addEventListener("touchend", function () {
    isScrolling = false;
  });
});
