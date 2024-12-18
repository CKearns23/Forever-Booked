// Import necessary Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

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

// Load reviews and votes when the page loads
window.onload = () => {
    loadReviewsFromFirebase(); // Load reviews from Firestore
    initializeGenreCarousel('#genre-carousel'); // Initialize genre carousel
};
