// Global instances
let currentUser;
let omdbService;
let storageManager;
let currentMovieID = null;
let currentFilter = 'all';

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎬 Initializing CineVault...');
    
    omdbService = new OMDBService('83fcc659');
    storageManager = new StorageManager();
    
    // Load or create user
    initializeUser();
    
    // Set up event listeners
    setupEventListeners();
    
    // Render initial state
    renderCollection();
    updateUserDisplay();
    
    console.log('✅ CineVault ready!');
});

// USER INITIALIZATION

function initializeUser() {
    const savedData = storageManager.loadCollection();
    
    if (savedData && savedData.userName) {
        // Load existing user
        currentUser = new User(savedData.userName);
        
        // Restore movies
        savedData.movies.forEach(movieData => {
            const movie = MovieFactory.createMovie({
                Title: movieData.title,
                Year: movieData.year,
                Director: movieData.director,
                Plot: movieData.plot,
                Poster: movieData.poster,
                imdbRating: movieData.imdbRating,
                Runtime: movieData.runtime,
                Actors: movieData.actors,
                imdbID: movieData.imdbID,
                Genre: movieData.genre
            });
            
            // Restore user rating
            if (movieData.userRating > 0) {
                movie.setUserRating(movieData.userRating);
            }
            
            // Restore reviews
            if (movieData.reviews && movieData.reviews.length > 0) {
                movieData.reviews.forEach(reviewData => {
                    const review = new Review(reviewData.author, reviewData.text, reviewData.rating);
                    movie.addReview(review);
                    currentUser.reviewCount++;
                });
            }
            
            currentUser.addMovie(movie);
        });
        
        console.log(`✅ Loaded user: ${currentUser.name} with ${currentUser.getMovieCount()} movies`);
    } else {
        // Create new user
        currentUser = new User('Movie Lover');
        console.log('✅ Created new user');
    }
}

// EVENT LISTENERS
function setupEventListeners() {
    // Search on Enter key
    document.getElementById('movieSearch').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchMovie();
        }
    });
}

// SEARCH FUNCTIONALITY
async function searchMovie() {
    const searchTerm = document.getElementById('movieSearch').value.trim();
    
    if (!searchTerm) {
        alert('Please enter a movie title');
        return;
    }
    
    showLoading();
    
    try {
        const results = await omdbService.searchMovies(searchTerm);
        displaySearchResults(results);
    } catch (error) {
        alert('Error searching movies: ' + error.message);
        console.error(error);
    } finally {
        hideLoading();
    }
}

function displaySearchResults(results) {
    const container = document.getElementById('searchResults');
    container.classList.remove('hidden');
    
    if (!results || results.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--silver);">No movies found</p>';
        return;
    }
    
    container.innerHTML = results.map(movie => `
        <div class="search-result-item" onclick="addMovieToCollection('${movie.imdbID}')">
            <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'}" alt="${movie.Title}">
            <div class="search-result-info">
                <h3>${movie.Title}</h3>
                <p>${movie.Year}</p>
            </div>
        </div>
    `).join('');
}

// ADD MOVIE TO COLLECTION
async function addMovieToCollection(imdbID) {
    // Check if already in collection
    if (currentUser.hasMovie(imdbID)) {
        alert('This movie is already in your collection!');
        openMovieModal(imdbID);
        return;
    }
    
    showLoading();
    
    try {
        const movieData = await omdbService.getMovieDetails(imdbID);
        const movie = MovieFactory.createMovie(movieData);
        
        currentUser.addMovie(movie);
        saveCollection();
        renderCollection();
        updateUserDisplay();
        
        // Clear search
        document.getElementById('movieSearch').value = '';
        document.getElementById('searchResults').classList.add('hidden');
        
        // Show success message
        showNotification(`${movie.title} added to your collection!`);
        
        // Open the movie modal
        openMovieModal(imdbID);
        
    } catch (error) {
        alert('Error adding movie: ' + error.message);
        console.error(error);
    } finally {
        hideLoading();
    }
}

// RENDER COLLECTION
function renderCollection() {
    const container = document.getElementById('movieCollection');
    
    let movies = currentUser.getAllMovies();
    
    // Apply genre filter
    if (currentFilter !== 'all') {
        movies = movies.filter(movie => 
            movie.getGenre().toLowerCase().includes(currentFilter.toLowerCase())
        );
    }
    
    if (movies.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🎬</div>
                <h3>${currentFilter === 'all' ? 'Your Collection is Empty' : 'No ' + currentFilter.toUpperCase() + ' movies'}</h3>
                <p>${currentFilter === 'all' ? 'Start building your personal cinema by searching for movies above' : 'Search for ' + currentFilter + ' movies to add them'}</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = movies.map(movie => movie.displayCard()).join('');
}

// MOVIE MODAL
function openMovieModal(imdbID) {
    const movie = currentUser.getMovie(imdbID);
    if (!movie) return;
    
    currentMovieID = imdbID;
    const info = movie.getMovieInfo();
    
    // Populate modal
    document.getElementById('modalPoster').src = info.poster;
    document.getElementById('modalTitle').textContent = info.title;
    document.getElementById('modalYear').textContent = info.year;
    document.getElementById('modalDirector').textContent = info.director;
    document.getElementById('modalCast').textContent = info.actors;
    document.getElementById('modalRuntime').textContent = info.runtime;
    document.getElementById('modalRating').textContent = info.imdbRating;
    document.getElementById('modalPlot').textContent = info.plot;
    document.getElementById('modalGenreBadge').textContent = info.genre;
    
    // Set user rating stars
    updateStarRating(info.userRating);
    
    // Display reviews
    displayReviews(movie);
    
    // Show modal
    document.getElementById('movieModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('movieModal').classList.add('hidden');
    currentMovieID = null;
}

// RATING SYSTEM
function rateMovie(rating) {
    if (!currentMovieID) return;
    
    const movie = currentUser.getMovie(currentMovieID);
    if (movie) {
        movie.setUserRating(rating);
        updateStarRating(rating);
        saveCollection();
        renderCollection();
        
        showNotification(`Rated ${rating} stars!`);
    }
}

function updateStarRating(rating) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
            star.textContent = '★';
        } else {
            star.classList.remove('active');
            star.textContent = '☆';
        }
    });
}

// REVIEW SYSTEM
function displayReviews(movie) {
    const reviewsList = document.getElementById('reviewsList');
    const reviews = movie.getReviews();
    
    if (reviews.length === 0) {
        reviewsList.innerHTML = '<p style="color: var(--silver); font-size: 0.9rem;">No reviews yet. Be the first to review!</p>';
        return;
    }
    
    reviewsList.innerHTML = reviews.map(review => review.displayReview()).join('');
}

function addReview() {
    if (!currentMovieID) return;
    
    const reviewText = document.getElementById('reviewText').value.trim();
    
    if (!reviewText) {
        alert('Please write a review');
        return;
    }
    
    const movie = currentUser.getMovie(currentMovieID);
    const rating = movie.getUserRating();
    
    if (currentUser.addReviewToMovie(currentMovieID, reviewText, rating)) {
        document.getElementById('reviewText').value = '';
        displayReviews(movie);
        updateUserDisplay();
        saveCollection();
        
        showNotification('Review added!');
    }
}

// REMOVE FROM COLLECTION
function removeFromCollection() {
    if (!currentMovieID) return;
    
    const movie = currentUser.getMovie(currentMovieID);
    if (!movie) return;
    
    if (confirm(`Remove "${movie.title}" from your collection?`)) {
        currentUser.removeMovie(currentMovieID);
        saveCollection();
        renderCollection();
        updateUserDisplay();
        closeModal();
        
        showNotification('Movie removed from collection');
    }
}

// GENRE FILTER
function filterByGenre(genre) {
    currentFilter = genre;
    
    // Update active tab
    document.querySelectorAll('.genre-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.genre === genre) {
            tab.classList.add('active');
        }
    });
    
    renderCollection();
}

// VIEW TOGGLE
function toggleView(view) {
    const container = document.getElementById('movieCollection');
    
    // Update active button
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === view) {
            btn.classList.add('active');
        }
    });
    
    // Toggle view
    if (view === 'list') {
        container.classList.add('list-view');
    } else {
        container.classList.remove('list-view');
    }
}

// USER PROFILE
function updateUserDisplay() {
    const stats = currentUser.getStats();
    
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userInitials').textContent = currentUser.getInitials();
    document.getElementById('movieCount').textContent = stats.movieCount;
    document.getElementById('reviewCount').textContent = stats.reviewCount;
}

function editProfile() {
    document.getElementById('profileName').value = currentUser.name;
    document.getElementById('profileModal').classList.remove('hidden');
}

function closeProfileModal() {
    document.getElementById('profileModal').classList.add('hidden');
}

function saveProfile() {
    const newName = document.getElementById('profileName').value.trim();
    
    if (newName) {
        currentUser.name = newName;
        updateUserDisplay();
        saveCollection();
        closeProfileModal();
        
        showNotification('Profile updated!');
    }
}

// STORAGE
function saveCollection() {
    storageManager.saveCollection(currentUser);
}

// UI HELPERS
function showLoading() {
    document.getElementById('loadingIndicator').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loadingIndicator').classList.add('hidden');
}

function showNotification(message) {
    // Simple notification 
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 25px;
        right: 25px;
        background: var(--gold);
        color: var(--black);
        padding: 15px 25px;
        border-radius: 0;
        font-family: 'Cinzel', serif;
        font-weight: 700;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 5px 20px var(--shadow);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// API KEY SETUP HELPER
function setupAPIKey() {
    console.log(`
    ========================================
    🎬 OMDB API KEY SETUP
    ========================================
    
    To use the movie search feature:
    
    1. Get a FREE API key at: http://www.omdbapi.com/apikey.aspx
    2. Open movie-app.js
    3. Find line: omdbService = new OMDBService('YOUR_API_KEY_HERE');
    4. Replace 'YOUR_API_KEY_HERE' with your actual API key
    5. Save and reload the page
    
    Example:
    omdbService = new OMDBService('abc12345');
    
    ========================================
    `);
}

// Show API setup instructions on load
setupAPIKey();

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

