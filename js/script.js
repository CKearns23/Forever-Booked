let slideIndex = 0;

// Show slide based on index
function showSlide(index) {
    const slides = document.querySelectorAll('.slides img');
    if (index >= slides.length) slideIndex = 0;
    if (index < 0) slideIndex = slides.length - 1;
    slides.forEach((slide, i) => {
        slide.style.display = i === slideIndex ? 'block' : 'none';
    });
}

// Next slide function
function nextSlide() {
    slideIndex++;
    showSlide(slideIndex);
}

// Previous slide function
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

// Increment vote count and update display
function vote(bookId) {
    votes[bookId] += 1;

    const voteCountElement = document.getElementById(`${bookId}-votes`);
    if (voteCountElement) {
        voteCountElement.textContent = votes[bookId];
    }

    saveVotes();
}

// Save votes to localStorage
function saveVotes() {
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem('votes', JSON.stringify(votes));
    } else {
        console.error("localStorage is not available");
    }
}

// Load votes from localStorage
function loadVotes() {
    if (typeof(Storage) !== "undefined") {
        const savedVotes = JSON.parse(localStorage.getItem('votes'));
        if (savedVotes) {
            Object.assign(votes, savedVotes);

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

// Genre Carousel Functionality
function initializeGenreCarousel(carouselSelector, cardWidth = 150, gap = 20) {
    const carousel = document.querySelector(carouselSelector);
    const carouselCards = carousel.querySelector('.carousel-cards');
    const totalCards = carouselCards.children.length;
    let currentCarouselIndex = 1;

    function showCarouselSlide(index) {
        const offset = (cardWidth + gap) * index;
        carouselCards.style.transition = 'transform 0.5s ease-in-out';
        carouselCards.style.transform = `translateX(-${offset}px)`;

        carouselCards.addEventListener('transitionend', function handleTransition() {
            if (index === totalCards - 1) {
                carouselCards.style.transition = 'none';
                currentCarouselIndex = 1;
                carouselCards.style.transform = `translateX(-${(cardWidth + gap) * currentCarouselIndex}px)`;
            } else if (index === 0) {
                carouselCards.style.transition = 'none';
                currentCarouselIndex = totalCards - 2;
                carouselCards.style.transform = `translateX(-${(cardWidth + gap) * currentCarouselIndex}px)`;
            }
            carouselCards.removeEventListener('transitionend', handleTransition);
        });

        currentCarouselIndex = index;
    }

    function nextCarousel() {
        if (currentCarouselIndex < totalCards - 1) {
            showCarouselSlide(currentCarouselIndex + 1);
        }
    }

    function prevCarousel() {
        if (currentCarouselIndex > 0) {
            showCarouselSlide(currentCarouselIndex - 1);
        }
    }

    function createInfiniteLoop() {
        const firstCard = carouselCards.querySelector('.carousel-card-genre:first-child');
        const lastCard = carouselCards.querySelector('.carousel-card-genre:last-child');

        const firstClone = firstCard.cloneNode(true);
        const lastClone = lastCard.cloneNode(true);

        carouselCards.appendChild(firstClone);
        carouselCards.insertBefore(lastClone, carouselCards.firstChild);
    }

    createInfiniteLoop();

    const initialOffset = (cardWidth + gap) * currentCarouselIndex;
    carouselCards.style.transform = `translateX(-${initialOffset}px)`;

    carousel.querySelector('.next').addEventListener('click', nextCarousel);
    carousel.querySelector('.prev').addEventListener('click', prevCarousel);
}

// Book recommendation chatbot
let currentStep = 0;
let recommendations = {}; 

fetch('books.json')
    .then(response => response.json())
    .then(data => {
        recommendations = data;
        console.log('Books data loaded:', recommendations);
    })
    .catch(error => {
        console.error('Error loading books data:', error);
    });

function getRecommendation() {
    const userInput = document.getElementById("user-input").value.trim().toLowerCase();

    if (userInput === "") {
        alert("Please enter something!");
        return;
    }

    addChatMessage(`You: ${userInput}`);
    addChatMessage("Bot: Please wait while I find a book recommendation for you...");

    setTimeout(function () {
        let botResponse = "";

        const genre = Object.keys(recommendations).find(genre => genre.toLowerCase() === userInput);

        if (genre) {
            const books = recommendations[genre];
            const randomBook = books[Math.floor(Math.random() * books.length)];
            botResponse = `I recommend you read "${randomBook}". Enjoy!`;
        } else {
            botResponse = "Sorry, I don't recognize that genre. Please choose from Fantasy, Romance, Mystery, Science Fiction, or Horror.";
        }

        addChatMessage(`Bot: ${botResponse}`);
        document.getElementById("user-input").value = "";
    }, 500);
}

function addChatMessage(message) {
    const chatbox = document.getElementById("chatbox");
    const newMessage = document.createElement("p");
    newMessage.textContent = message;
    chatbox.appendChild(newMessage);
    chatbox.scrollTop = chatbox.scrollHeight;
}

// Handle form submission for book reviews
document.getElementById('review-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const bookTitle = document.getElementById('book-title').value;
    const authorName = document.getElementById('author-name').value;
    const userReview = document.getElementById('user-review').value;
    const rating = document.getElementById('rating').value;

    const newReview = {
        bookTitle,
        authorName,
        userReview,
        rating
    };

    saveReview(newReview);

    const newReviewElement = document.createElement('li');
    newReviewElement.innerHTML = `
        <strong>${bookTitle} by ${authorName}</strong> <br>
        Rating: ${rating} <br>
        <p>${userReview}</p>
    `;

    document.getElementById('reviews-list').appendChild(newReviewElement);

    document.getElementById('book-title').value = '';
    document.getElementById('author-name').value = '';
    document.getElementById('user-review').value = '';
    document.getElementById('rating').value = '';

    document.getElementById('thank-you-message').style.display = 'block';

    setTimeout(() => {
        document.getElementById('thank-you-message').style.display = 'none';
    }, 3000);
});

// Save review to localStorage
function saveReview(review) {
    let reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    reviews.push(review);
    localStorage.setItem('reviews', JSON.stringify(reviews));
}

// Load reviews from localStorage
function loadReviews() {
    const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    reviews.forEach(review => {
        const reviewElement = document.createElement('li');
        reviewElement.innerHTML = `
            <strong>${review.bookTitle} by ${review.authorName}</strong> <br>
            Rating: ${review.rating} <br>
            <p>${review.userReview}</p>
        `;
        document.getElementById('reviews-list').appendChild(reviewElement);
    });
}

// Load reviews and votes when the page loads
window.onload = () => {
    loadReviews(); // Load reviews from localStorage
    loadVotes(); // Load voting data
    initializeGenreCarousel('#genre-carousel'); // Initialize genre carousel
};
