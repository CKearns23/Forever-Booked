document.addEventListener('DOMContentLoaded', function() {
    // Initialize slider
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slider .slides img');
    const totalSlides = slides.length;

    // Function to show the current slide
    function showSlide(index) {
        if (index >= totalSlides) {
            currentSlide = 0;
        } else if (index < 0) {
            currentSlide = totalSlides - 1;
        } else {
            currentSlide = index;
        }
        // Hide all slides
        for (let i = 0; i < totalSlides; i++) {
            slides[i].style.display = 'none';
        }
        // Show the current slide
        slides[currentSlide].style.display = 'block';
    }

    // Next and previous slide navigation
    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function prevSlide() {
        showSlide(currentSlide - 1);
    }

    showSlide(currentSlide); // Initialize the slider

    // Attach event listeners to navigation buttons
    document.querySelector('.next').addEventListener('click', nextSlide);
    document.querySelector('.prev').addEventListener('click', prevSlide);

    // Initialize genre carousel
    initializeGenreCarousel('#genre-carousel');

    // Function to set up the genre carousel
    function initializeGenreCarousel(selector) {
        const carousel = document.querySelector(selector);
        const slides = carousel.querySelectorAll('.carousel-slide');
        let currentIndex = 0;

        // Function to move the carousel based on direction (forward or backward)
        function moveCarousel(direction) {
            currentIndex += direction;
            if (currentIndex < 0) {
                currentIndex = slides.length - 1;
            } else if (currentIndex >= slides.length) {
                currentIndex = 0;
            }
            updateCarousel();
        }

        // Function to update the carousel position
        function updateCarousel() {
            const offset = -currentIndex * 100; // Assuming each slide is 100% width
            carousel.style.transform = `translateX(${offset}%)`;
        }

        // Attach event listeners to carousel navigation buttons
        const nextButton = document.querySelector('.next');
        const prevButton = document.querySelector('.prev');
        nextButton.addEventListener('click', () => moveCarousel(1));
        prevButton.addEventListener('click', () => moveCarousel(-1));

        updateCarousel(); // Initialize the carousel
    }

    // Voting functionality
    const voteButtons = document.querySelectorAll('.vote-btn');
    voteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bookId = this.dataset.bookId; // Get the book ID from the data attribute
            vote(bookId);
        });
    });

    // Handle the voting logic
    function vote(bookId) {
        const votes = JSON.parse(localStorage.getItem('votes')) || {};
        votes[bookId] = (votes[bookId] || 0) + 1;
        localStorage.setItem('votes', JSON.stringify(votes));
        updateVoteCount(bookId, votes[bookId]);
    }

    // Update the displayed vote count
    function updateVoteCount(bookId, count) {
        const voteCountElement = document.querySelector(`.vote-count[data-book-id="${bookId}"]`);
        if (voteCountElement) {
            voteCountElement.textContent = count;
        }
    }

    // Load saved votes from localStorage on page load
    function loadVotes() {
        const votes = JSON.parse(localStorage.getItem('votes')) || {};
        for (let bookId in votes) {
            updateVoteCount(bookId, votes[bookId]);
        }
    }

    loadVotes(); // Call to load votes when the page loads

    // Chatbox functionality
    const chatInput = document.querySelector('#chat-input');
    const chatBox = document.querySelector('#chat-box');
    const submitButton = document.querySelector('#submit-btn');

    // Event listener for chatbox submission
    submitButton.addEventListener('click', function() {
        const userMessage = chatInput.value;
        if (userMessage) {
            addChatMessage('user', userMessage);
            chatInput.value = ''; // Clear the input field
            getRecommendation(userMessage); // Get a book recommendation based on user input
        }
    });

    // Function to add a message to the chatbox
    function addChatMessage(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', sender);
        messageElement.textContent = message;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom of the chat
    }

    // Function to get book recommendations based on user input
    function getRecommendation(userMessage) {
        const genre = userMessage.toLowerCase();
        fetch('books.json') // Fetch the JSON data from the books.json file
            .then(response => response.json())
            .then(data => {
                if (data[genre]) {
                    const recommendation = data[genre].join(', ');
                    addChatMessage('bot', `I recommend these ${genre} books: ${recommendation}`);
                } else {
                    addChatMessage('bot', `Sorry, I don't know any books for the genre "${genre}".`);
                }
            })
            .catch(error => {
                addChatMessage('bot', 'Sorry, there was an error fetching recommendations.');
            });
    }
});
