let slideIndex = 0;

// Slideshow Functionality
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

// Voting Functionality
const votes = { book1: 0, book2: 0, book3: 0 };

function vote(bookId) {
    votes[bookId]++;
    document.getElementById(`${bookId}-votes`).textContent = votes[bookId];
    saveVotes();
}

function saveVotes() {
    localStorage.setItem('votes', JSON.stringify(votes));
}

function loadVotes() {
    const savedVotes = JSON.parse(localStorage.getItem('votes')) || {};
    Object.assign(votes, savedVotes);

    for (const bookId in votes) {
        const voteCountElement = document.getElementById(`${bookId}-votes`);
        if (voteCountElement) {
            voteCountElement.textContent = votes[bookId];
        }
    }
}

// Infinite Carousel Functionality
function initializeCarousel(carouselSelector, cardClass = '.carousel-card') {
    const carousel = document.querySelector(carouselSelector);
    const carouselCards = carousel.querySelector('.carousel-cards');
    const cards = carousel.querySelectorAll(cardClass);

    let currentIndex = 1; // Start at the first real card
    const cardWidth = cards[0].offsetWidth + 20; // Include gap

    // Clone first and last card for infinite looping
    const firstClone = cards[0].cloneNode(true);
    const lastClone = cards[cards.length - 1].cloneNode(true);
    carouselCards.appendChild(firstClone);
    carouselCards.insertBefore(lastClone, cards[0]);

    // Set initial position
    carouselCards.style.transform = `translateX(-${cardWidth * currentIndex}px)`;

    function moveCarousel(index) {
        carouselCards.style.transition = 'transform 0.5s ease-in-out';
        currentIndex = index;
        carouselCards.style.transform = `translateX(-${cardWidth * currentIndex}px)`;
    }

    // Handle looping
    carouselCards.addEventListener('transitionend', () => {
        if (currentIndex === 0) {
            carouselCards.style.transition = 'none';
            currentIndex = cards.length;
            carouselCards.style.transform = `translateX(-${cardWidth * currentIndex}px)`;
        } else if (currentIndex === cards.length + 1) {
            carouselCards.style.transition = 'none';
            currentIndex = 1;
            carouselCards.style.transform = `translateX(-${cardWidth * currentIndex}px)`;
        }
    });

    // Button Events
    carousel.querySelector('.next').addEventListener('click', () => moveCarousel(currentIndex + 1));
    carousel.querySelector('.prev').addEventListener('click', () => moveCarousel(currentIndex - 1));
}

// Book Recommendation Chatbot
let recommendations = {};
fetch('books.json')
    .then(response => response.json())
    .then(data => (recommendations = data))
    .catch(error => console.error('Error loading books data:', error));

function getRecommendation() {
    const userInput = document.getElementById('user-input').value.trim().toLowerCase();
    if (!userInput) {
        alert('Please enter a genre!');
        return;
    }

    addChatMessage(`You: ${userInput}`);
    addChatMessage('Bot: Searching for a recommendation...');

    setTimeout(() => {
        const genre = Object.keys(recommendations).find(g => g.toLowerCase() === userInput);
        let response = genre
            ? `I recommend you read "${recommendations[genre][Math.floor(Math.random() * recommendations[genre].length)]}".`
            : "Sorry, I don't recognize that genre. Try Fantasy, Romance, Mystery, Sci-Fi, or Horror.";

        addChatMessage(`Bot: ${response}`);
        document.getElementById('user-input').value = '';
    }, 500);
}

function addChatMessage(message) {
    const chatbox = document.getElementById('chatbox');
    const newMessage = document.createElement('p');
    newMessage.textContent = message;
    chatbox.appendChild(newMessage);
    chatbox.scrollTop = chatbox.scrollHeight;
}

// Search Authors
document.getElementById('search-authors').addEventListener('input', function () {
    const query = this.value.toLowerCase();
    const authorsList = document.getElementById('authors-list');

    authorsList.querySelectorAll('li').forEach(item => {
        item.style.display = item.textContent.toLowerCase().includes(query) ? '' : 'none';
    });
});

// Review Submission Form
document.getElementById('review-form').addEventListener('submit', function (e) {
    e.preventDefault();
    document.getElementById('thank-you-message').style.display = 'block';
    document.getElementById('review-form').style.display = 'none';
    setTimeout(() => {
        document.getElementById('review-form').reset();
        document.getElementById('thank-you-message').style.display = 'none';
        document.getElementById('review-form').style.display = 'block';
    }, 3000);
});

// Display Saved Reviews
function displayReviews() {
    const reviewsList = document.getElementById('reviews-list');
    const reviews = JSON.parse(localStorage.getItem('reviews')) || [];

    reviewsList.innerHTML = reviews
        .map(
            review => `
                <li>
                    <strong>${review.bookTitle}</strong> by <em>${review.authorName}</em><br>
                    ${review.reviewText} <br>
                    <small>Rating: ${review.rating} | Reviewed on: ${review.date}</small>
                </li>`
        )
        .join('');
}

document.addEventListener('DOMContentLoaded', () => {
    loadVotes();
    displayReviews();
    initializeCarousel('#genre-carousel', '.carousel-card-genre');
    initializeCarousel('#authors-carousel', '.carousel-card-author');
});
