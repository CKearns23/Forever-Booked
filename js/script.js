let slideIndex = 0;

function showSlide(index) {
    const slides = document.querySelectorAll('.slides img');
    if (index >= slides.length) slideIndex = 0;
    if (index < 0) slideIndex = slides.length - 1;
    slides.forEach((slide, i) => {
        slide.style.display = i === slideIndex ? 'block' : 'none';
    });
}

function nextSlide() {
    slideIndex++;
    showSlide(slideIndex);
}

function prevSlide() {
    slideIndex--;
    showSlide(slideIndex);
}

// Initialize the first slide
showSlide(slideIndex);

// Voting functionality
const votes = {
    book1: 0,
    book2: 0,
    book3: 0,
};

function vote(bookId) {
    // Increment the vote count for the selected book
    votes[bookId] += 1;

    // Update the vote count display
    const voteCountElement = document.getElementById(`${bookId}-votes`);
    if (voteCountElement) {
        voteCountElement.textContent = votes[bookId];
    }

    // Save updated votes to localStorage
    saveVotes();
}

function saveVotes() {
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem('votes', JSON.stringify(votes));
    } else {
        console.error("localStorage is not available");
    }
}

function loadVotes() {
    if (typeof(Storage) !== "undefined") {
        const savedVotes = JSON.parse(localStorage.getItem('votes'));
        if (savedVotes) {
            Object.assign(votes, savedVotes);

            // Update the vote count display for all books
            for (const bookId in votes) {
                const voteCountElement = document.getElementById(`${bookId}-votes`);
                if (voteCountElement) {
                    voteCountElement.textContent = votes[bookId];
                }
            }
        }
    } else {
        console.error("localStorage is not available");
    }
}

// Load votes and initialize genre carousel when the page loads
window.onload = () => {
    loadVotes(); // Load voting data
    initializeGenreCarousel('#genre-carousel'); // Initialize genre carousel
};

// Genre Carousel Functionality
function initializeGenreCarousel(carouselSelector, cardWidth = 150, gap = 20) {
    const carousel = document.querySelector(carouselSelector);
    const carouselCards = carousel.querySelector('.carousel-cards');
    const totalCards = carouselCards.children.length;
    let currentCarouselIndex = 1; // Start at the second card (for infinite loop effect)

    // Function to show a specific slide
    function showCarouselSlide(index) {
        const offset = (cardWidth + gap) * index;

        carouselCards.style.transition = 'transform 0.5s ease-in-out';
        carouselCards.style.transform = `translateX(-${offset}px)`;

        // Handle looping transitions
        carouselCards.addEventListener('transitionend', function handleTransition() {
            if (index === totalCards - 1) {
                // Last clone: jump to first real card
                carouselCards.style.transition = 'none';
                currentCarouselIndex = 1;
                carouselCards.style.transform = `translateX(-${(cardWidth + gap) * currentCarouselIndex}px)`;
            } else if (index === 0) {
                // First clone: jump to last real card
                carouselCards.style.transition = 'none';
                currentCarouselIndex = totalCards - 2;
                carouselCards.style.transform = `translateX(-${(cardWidth + gap) * currentCarouselIndex}px)`;
            }
            carouselCards.removeEventListener('transitionend', handleTransition);
        });

        currentCarouselIndex = index;
    }

    // Move to the next slide
    function nextCarousel() {
        if (currentCarouselIndex < totalCards - 1) {
            showCarouselSlide(currentCarouselIndex + 1);
        }
    }

    // Move to the previous slide
    function prevCarousel() {
        if (currentCarouselIndex > 0) {
            showCarouselSlide(currentCarouselIndex - 1);
        }
    }

    // Clone the first and last cards for infinite looping
    function createInfiniteLoop() {
        const firstCard = carouselCards.querySelector('.carousel-card-genre:first-child');
        const lastCard = carouselCards.querySelector('.carousel-card-genre:last-child');

        const firstClone = firstCard.cloneNode(true);
        const lastClone = lastCard.cloneNode(true);

        carouselCards.appendChild(firstClone);
        carouselCards.insertBefore(lastClone, carouselCards.firstChild);
    }

    // Initialize the carousel
    createInfiniteLoop();

    // Set the initial transform value for alignment
    const initialOffset = (cardWidth + gap) * currentCarouselIndex;
    carouselCards.style.transform = `translateX(-${initialOffset}px)`;

    // Event listeners for navigation buttons
    carousel.querySelector('.next').addEventListener('click', nextCarousel);
    carousel.querySelector('.prev').addEventListener('click', prevCarousel);
}
