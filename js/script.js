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

// Book recommendation chatbot
let currentStep = 0; // Keeps track of the current step in the conversation

// Declare recommendations once and use it throughout the code
let recommendations = {}; // Initialize an empty object to store book recommendations

// Fetch book data from the JSON file
fetch('books.json')
    .then(response => response.json())
    .then(data => {
        recommendations = data; // Store the fetched data in the recommendations object
        console.log('Books data loaded:', recommendations);  // Debugging
    })
    .catch(error => {
        console.error('Error loading books data:', error);
    });

// Function to get user input and recommend a book
function getRecommendation() {
    const userInput = document.getElementById("user-input").value.trim().toLowerCase();

    if (userInput === "") {
        alert("Please enter something!");
        return;
    }

    // Display user message
    addChatMessage(`You: ${userInput}`);

    // Show a loading message while the bot is processing
    addChatMessage("Bot: Please wait while I find a book recommendation for you...");

    // Simulate a delay before finding a recommendation (useful for loading states)
    setTimeout(function () {
        let botResponse = "";

        // Log the recommendations object to debug if it has the right genres
        console.log('Recommendations:', recommendations);  // Debugging

        // Check if the user entered a genre that matches
        const genre = Object.keys(recommendations).find(genre => genre.toLowerCase() === userInput);

        if (genre) {
            console.log('Genre found:', genre);  // Debugging
            const books = recommendations[genre];
            const randomBook = books[Math.floor(Math.random() * books.length)];
            botResponse = `I recommend you read "${randomBook}". Enjoy!`;
        } else {
            botResponse = "Sorry, I don't recognize that genre. Please choose from Fantasy, Romance, Mystery, Science Fiction, or Horror.";
        }

        addChatMessage(`Bot: ${botResponse}`);
        document.getElementById("user-input").value = ""; // Clear input field
    }, 500); // Simulate a 500ms delay
}

// Function to add a new message to the chatbox
function addChatMessage(message) {
    const chatbox = document.getElementById("chatbox");
    const newMessage = document.createElement("p");
    newMessage.textContent = message;
    chatbox.appendChild(newMessage);
    chatbox.scrollTop = chatbox.scrollHeight;
}

// Function to handle search
document.getElementById('search').addEventListener('input', function() {
    const searchQuery = this.value.toLowerCase();

    if (!searchQuery) {
        displaySearchResults({ books: [], authors: [], genres: [] });
        return; // No input, no need to search
    }

    const searchResults = {
        books: [],
        authors: new Set(), // Use Set to avoid duplicates
        genres: new Set() // Use Set to avoid duplicates
    };

    // Loop through the genres and their books once data is loaded
    Object.keys(recommendations).forEach(genre => {
        recommendations[genre].forEach(book => {
            // Search through books and authors
            if (book.title.toLowerCase().includes(searchQuery)) {
                searchResults.books.push(book);
            }
            if (book.author.toLowerCase().includes(searchQuery)) {
                searchResults.authors.add(book.author); // Use Set for authors
            }
        });

        // Search through genres
        if (genre.toLowerCase().includes(searchQuery)) {
            searchResults.genres.add(genre); // Use Set for genres
        }
    });

    // Convert Sets back to arrays for display
    searchResults.authors = Array.from(searchResults.authors);
    searchResults.genres = Array.from(searchResults.genres);

    // Display results
    displaySearchResults(searchResults);
});

// Function to display search results
function displaySearchResults(results) {
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = ''; // Clear previous results

    // Display books
    if (results.books.length > 0) {
        const booksList = document.createElement('ul');
        results.books.forEach(book => {
            const listItem = document.createElement('li');
            listItem.textContent = `${book.title} by ${book.author}`;
            booksList.appendChild(listItem);
        });
        resultsContainer.appendChild(booksList);
    } else {
        const noBooksMessage = document.createElement('p');
        noBooksMessage.textContent = 'No books found.';
        resultsContainer.appendChild(noBooksMessage);
    }

    // Display authors
    if (results.authors.length > 0) {
        const authorsList = document.createElement('ul');
        results.authors.forEach(author => {
            const listItem = document.createElement('li');
            listItem.textContent = author;
            authorsList.appendChild(listItem);
        });
        resultsContainer.appendChild(authorsList);
    } else {
        const noAuthorsMessage = document.createElement('p');
        noAuthorsMessage.textContent = 'No authors found.';
        resultsContainer.appendChild(noAuthorsMessage);
    }

    // Display genres
    if (results.genres.length > 0) {
        const genresList = document.createElement('ul');
        results.genres.forEach(genre => {
            const listItem = document.createElement('li');
            listItem.textContent = genre;
            genresList.appendChild(listItem);
        });
        resultsContainer.appendChild(genresList);
    } else {
        const noGenresMessage = document.createElement('p');
        noGenresMessage.textContent = 'No genres found.';
        resultsContainer.appendChild(noGenresMessage);
    }
}

// This listens for the form submission event
document.getElementById('review-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevents form from submitting the traditional way

    const userReview = document.getElementById('user-review').value; // Get the user's review
    const newReview = document.createElement('p'); // Creates a new paragraph element
    newReview.textContent = userReview; // Sets the text of the new review to what the user typed

    // Append the new review to the reviews section
    document.getElementById('reviews-section').appendChild(newReview);

    // Clear the input field after submission
    document.getElementById('user-review').value = '';
});
