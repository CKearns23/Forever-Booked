// Import necessary Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

// Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyCPUGRaYHqYL8PqwZiP3YF0fqo3BHBSl-s",
    authDomain: "forever-booked-reviews.firebaseapp.com",
    projectId: "forever-booked-reviews",
    storageBucket: "forever-booked-reviews.firebasestorage.app",
    messagingSenderId: "85969718480",
    appId: "1:85969718480:web:b7356ec352edcd993fa2d5",
    measurementId: "G-Z1DPQSXGKE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Handle form submission for book reviews
document.getElementById('review-form').addEventListener('submit', function (event) {
    event.preventDefault();

    // Get the form data
    const bookTitle = document.getElementById('book-title').value;
    const authorName = document.getElementById('author-name').value;
    const userReview = document.getElementById('user-review').value;
    const rating = parseInt(document.getElementById('rating').value);

    // Validate rating
    if (isNaN(rating) || rating < 1 || rating > 5) {
        alert("Please provide a valid rating between 1 and 5.");
        return;
    }

    // Create a review object
    const newReview = {
        bookTitle,
        authorName,
        userReview,
        rating,
        timestamp: new Date()
    };

    // Save the review to Firebase Firestore
    addDoc(collection(db, "reviews"), newReview)
        .then((docRef) => {
            console.log("Review added with ID: ", docRef.id);

            // Display the review on the page
            const newReviewElement = document.createElement('li');
            newReviewElement.innerHTML = `
            <strong>${bookTitle} by ${authorName}</strong><br>
            Rating: ${rating}<br>
            <p>${userReview}</p>
        `;
            document.getElementById('reviews-list').appendChild(newReviewElement);

            // Clear form fields
            document.getElementById('book-title').value = '';
            document.getElementById('author-name').value = '';
            document.getElementById('user-review').value = '';
            document.getElementById('rating').value = '';

            // Show thank you message
            document.getElementById('thank-you-message').style.display = 'block';
            setTimeout(() => {
                document.getElementById('thank-you-message').style.display = 'none';
            }, 3000);
        })
        .catch((error) => {
            console.error("Error adding review: ", error);
            alert("There was an error saving your review. Please try again.");
        });
});

// Load reviews from Firestore when the page loads
window.onload = () => {
    loadReviewsFromFirebase();
};

// Load reviews from Firebase Firestore
function loadReviewsFromFirebase() {
    const reviewsList = document.getElementById('reviews-list');
    // Fetch reviews from Firestore
    getDocs(collection(db, "reviews"))
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const review = doc.data();
                const reviewElement = document.createElement('li');
                reviewElement.innerHTML = `
                <strong>${review.bookTitle} by ${review.authorName}</strong><br>
                Rating: ${review.rating}<br>
                <p>${review.userReview}</p>
            `;
                reviewsList.appendChild(reviewElement);
            });
        })
        .catch((error) => {
            console.error("Error loading reviews: ", error);
            alert("There was an error loading the reviews. Please try again.");
        });
}

// Initialize the first slide index
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
    if (typeof (Storage) !== "undefined") {
        localStorage.setItem('votes', JSON.stringify(votes));
    } else {
        console.error("localStorage is not available");
    }
}

// Load votes from localStorage
function loadVotes() {
    if (typeof (Storage) !== "undefined") {
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

// Save review to Firestore
function saveReviewToFirebase(review) {
    addDoc(collection(db, "reviews"), review)
        .then(docRef => {
            console.log("Review added with ID: ", docRef.id);
        })
        .catch(error => {
            console.error("Error adding review: ", error);
            alert("There was an error saving your review. Please try again.");
        });
}

// Load reviews from Firestore
function loadReviewsFromFirebase() {
    getDocs(collection(db, "reviews"))
        .then(querySnapshot => {
            const reviewsList = document.getElementById('reviews-list');
            querySnapshot.forEach(doc => {
                const review = doc.data();
                if (![...reviewsList.children].some(e => e.textContent.includes(review.bookTitle))) {
                    const reviewElement = document.createElement('li');
                    reviewElement.innerHTML = `
                    <strong>${review.bookTitle} by ${review.authorName}</strong><br>
                    Rating: ${review.rating}<br>
                    <p>${review.userReview}</p>
                `;
                    reviewsList.appendChild(reviewElement);
                }
            });
        })
        .catch(error => {
            console.error("Error loading reviews: ", error);
            alert("There was an error loading the reviews. Please try again.");
        });
}

// Handle form submission for book reviews
document.getElementById('review-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const bookTitle = document.getElementById('book-title').value;
    const authorName = document.getElementById('author-name').value;
    const userReview = document.getElementById('user-review').value;
    const rating = parseInt(document.getElementById('rating').value);

    if (isNaN(rating) || rating < 1 || rating > 5) {
        alert("Please provide a valid rating between 1 and 5.");
        return;
    }

    const newReview = {
        bookTitle,
        authorName,
        userReview,
        rating
    };

    // Save review to Firebase
    saveReviewToFirebase(newReview);

    // Display the review on the page
    const newReviewElement = document.createElement('li');
    newReviewElement.innerHTML = `
        <strong>${bookTitle} by ${authorName}</strong><br>
        Rating: ${rating}<br>
        <p>${userReview}</p>
    `;
    document.getElementById('reviews-list').appendChild(newReviewElement);

    // Clear form fields
    document.getElementById('book-title').value = '';
    document.getElementById('author-name').value = '';
    document.getElementById('user-review').value = '';
    document.getElementById('rating').value = '';

    // Show thank you message
    document.getElementById('thank-you-message').style.display = 'block';
    setTimeout(() => {
        document.getElementById('thank-you-message').style.display = 'none';
    }, 3000);
});

// Load reviews and votes when the page loads
window.onload = () => {
    loadReviewsFromFirebase(); // Load reviews from Firestore
    loadVotes(); // Load voting data
    initializeGenreCarousel('#genre-carousel'); // Initialize genre carousel
};
