// OOP MOVIE LIBRARY SYSTEM
// Demonstrates: Classes, Inheritance, Encapsulation, Polymorphism
class Movie {
    // Private fields (using # for true privacy)
    #userRating;
    #dateAdded;

    constructor(title, year, director, plot, poster, imdbRating, runtime, actors, imdbID) {
        this.title = title;
        this.year = year;
        this.director = director;
        this.plot = plot;
        this.poster = poster;
        this.imdbRating = imdbRating;
        this.runtime = runtime;
        this.actors = actors;
        this.imdbID = imdbID;
        
        // Private fields
        this.#userRating = 0;
        this.#dateAdded = new Date();
        
        // Public field
        this.reviews = [];
    }

    // Getter for private rating
    getUserRating() {
        return this.#userRating;
    }

    // Setter for private rating
    setUserRating(rating) {
        if (rating >= 1 && rating <= 5) {
            this.#userRating = rating;
        } else {
            console.error('Rating must be between 1 and 5');
        }
    }

    // Getter for date added
    getDateAdded() {
        return this.#dateAdded;
    }

    // Add a review
    addReview(review) {
        this.reviews.push(review);
    }

    // Get all reviews
    getReviews() {
        return this.reviews;
    }

    // Base display method (will be overridden)
    displayCard() {
        return `
            <div class="movie-card" data-id="${this.imdbID}" onclick="openMovieModal('${this.imdbID}')">
                <img src="${this.poster}" alt="${this.title}" class="movie-poster" onerror="this.src='https://via.placeholder.com/300x450?text=No+Poster'">
                <div class="movie-info">
                    <h3 class="movie-title">${this.title}</h3>
                    <p class="movie-year">${this.year}</p>
                    <span class="movie-genre">${this.getGenre()}</span>
                    <div class="movie-rating">
                        ${this.#userRating > 0 ? '⭐'.repeat(this.#userRating) : 'Not Rated'}
                    </div>
                </div>
            </div>
        `;
    }

    // To be overridden by subclasses
    getGenre() {
        return 'General';
    }

    // Get movie info for modal
    getMovieInfo() {
        return {
            title: this.title,
            year: this.year,
            director: this.director,
            plot: this.plot,
            poster: this.poster,
            imdbRating: this.imdbRating,
            runtime: this.runtime,
            actors: this.actors,
            imdbID: this.imdbID,
            userRating: this.#userRating,
            reviews: this.reviews,
            genre: this.getGenre()
        };
    }
}

// GENRE-SPECIFIC CLASSES (INHERITANCE)
class ActionMovie extends Movie {
    constructor(title, year, director, plot, poster, imdbRating, runtime, actors, imdbID) {
        super(title, year, director, plot, poster, imdbRating, runtime, actors, imdbID);
        this.stunts = [];
    }

    getGenre() {
        return 'ACTION';
    }

    // Polymorphism - different display for action movies
    displayCard() {
        const card = super.displayCard();
        // Add action-specific styling class
        return card.replace('movie-card', 'movie-card action-movie');
    }

    addStunt(stunt) {
        this.stunts.push(stunt);
    }
}

class ComedyMovie extends Movie {
    constructor(title, year, director, plot, poster, imdbRating, runtime, actors, imdbID) {
        super(title, year, director, plot, poster, imdbRating, runtime, actors, imdbID);
        this.laughMeter = 0;
    }

    getGenre() {
        return 'COMEDY';
    }

    displayCard() {
        const card = super.displayCard();
        return card.replace('movie-card', 'movie-card comedy-movie');
    }

    setLaughMeter(level) {
        this.laughMeter = Math.max(0, Math.min(10, level));
    }
}

class DramaMovie extends Movie {
    constructor(title, year, director, plot, poster, imdbRating, runtime, actors, imdbID) {
        super(title, year, director, plot, poster, imdbRating, runtime, actors, imdbID);
        this.emotionalImpact = 0;
    }

    getGenre() {
        return 'DRAMA';
    }

    displayCard() {
        const card = super.displayCard();
        return card.replace('movie-card', 'movie-card drama-movie');
    }

    setEmotionalImpact(level) {
        this.emotionalImpact = Math.max(0, Math.min(10, level));
    }
}

class HorrorMovie extends Movie {
    constructor(title, year, director, plot, poster, imdbRating, runtime, actors, imdbID) {
        super(title, year, director, plot, poster, imdbRating, runtime, actors, imdbID);
        this.scareLevel = 0;
    }

    getGenre() {
        return 'HORROR';
    }

    displayCard() {
        const card = super.displayCard();
        return card.replace('movie-card', 'movie-card horror-movie');
    }

    setScareLevel(level) {
        this.scareLevel = Math.max(0, Math.min(10, level));
    }
}

class SciFiMovie extends Movie {
    constructor(title, year, director, plot, poster, imdbRating, runtime, actors, imdbID) {
        super(title, year, director, plot, poster, imdbRating, runtime, actors, imdbID);
        this.techLevel = 0;
    }

    getGenre() {
        return 'SCI-FI';
    }

    displayCard() {
        const card = super.displayCard();
        return card.replace('movie-card', 'movie-card scifi-movie');
    }

    setTechLevel(level) {
        this.techLevel = Math.max(0, Math.min(10, level));
    }
}

// REVIEW CLASS
class Review {
    constructor(author, text, rating) {
        this.author = author;
        this.text = text;
        this.rating = rating;
        this.date = new Date();
    }

    getFormattedDate() {
        return this.date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    displayReview() {
        return `
            <div class="review-item">
                <div class="review-date">${this.getFormattedDate()} - ${this.author}</div>
                <div class="review-text">${this.text}</div>
            </div>
        `;
    }
}

// USER CLASS
class User {
    // Private field for collection
    #movieCollection;

    constructor(name) {
        this.name = name;
        this.#movieCollection = new Map(); // Using Map for O(1) lookups
        this.reviewCount = 0;
    }

    // Get user initials for avatar
    getInitials() {
        return this.name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }

    // Add movie to collection
    addMovie(movie) {
        if (movie instanceof Movie) {
            this.#movieCollection.set(movie.imdbID, movie);
            return true;
        }
        console.error('Invalid movie object');
        return false;
    }

    // Remove movie from collection
    removeMovie(imdbID) {
        return this.#movieCollection.delete(imdbID);
    }

    // Get movie by ID
    getMovie(imdbID) {
        return this.#movieCollection.get(imdbID);
    }

    // Get all movies
    getAllMovies() {
        return Array.from(this.#movieCollection.values());
    }

    // Get movies by genre
    getMoviesByGenre(genre) {
        return this.getAllMovies().filter(movie => 
            movie.getGenre().toLowerCase() === genre.toLowerCase()
        );
    }

    // Get collection count
    getMovieCount() {
        return this.#movieCollection.size;
    }

    // Check if movie exists
    hasMovie(imdbID) {
        return this.#movieCollection.has(imdbID);
    }

    // Add review to a movie
    addReviewToMovie(imdbID, reviewText, rating) {
        const movie = this.getMovie(imdbID);
        if (movie) {
            const review = new Review(this.name, reviewText, rating);
            movie.addReview(review);
            this.reviewCount++;
            return true;
        }
        return false;
    }

    // Get user stats
    getStats() {
        return {
            movieCount: this.getMovieCount(),
            reviewCount: this.reviewCount,
            averageRating: this.getAverageRating()
        };
    }

    // Calculate average rating
    getAverageRating() {
        const movies = this.getAllMovies();
        if (movies.length === 0) return 0;
        
        const totalRating = movies.reduce((sum, movie) => {
            return sum + movie.getUserRating();
        }, 0);
        
        return (totalRating / movies.length).toFixed(1);
    }

    // Sort collection
    sortCollection(sortBy = 'title') {
        const movies = this.getAllMovies();
        
        switch(sortBy) {
            case 'title':
                return movies.sort((a, b) => a.title.localeCompare(b.title));
            case 'year':
                return movies.sort((a, b) => parseInt(b.year) - parseInt(a.year));
            case 'rating':
                return movies.sort((a, b) => b.getUserRating() - a.getUserRating());
            case 'dateAdded':
                return movies.sort((a, b) => b.getDateAdded() - a.getDateAdded());
            default:
                return movies;
        }
    }
}

// MOVIE FACTORY
// Factory pattern to create appropriate movie objects
class MovieFactory {
    static createMovie(movieData) {
        const { Title, Year, Director, Plot, Poster, imdbRating, Runtime, Actors, imdbID, Genre } = movieData;
        
        // Determine movie type based on genre
        const genreLower = Genre.toLowerCase();
        
        if (genreLower.includes('action')) {
            return new ActionMovie(Title, Year, Director, Plot, Poster, imdbRating, Runtime, Actors, imdbID);
        } else if (genreLower.includes('comedy')) {
            return new ComedyMovie(Title, Year, Director, Plot, Poster, imdbRating, Runtime, Actors, imdbID);
        } else if (genreLower.includes('drama')) {
            return new DramaMovie(Title, Year, Director, Plot, Poster, imdbRating, Runtime, Actors, imdbID);
        } else if (genreLower.includes('horror')) {
            return new HorrorMovie(Title, Year, Director, Plot, Poster, imdbRating, Runtime, Actors, imdbID);
        } else if (genreLower.includes('sci-fi') || genreLower.includes('science fiction')) {
            return new SciFiMovie(Title, Year, Director, Plot, Poster, imdbRating, Runtime, Actors, imdbID);
        } else {
            // Default to base Movie class
            return new Movie(Title, Year, Director, Plot, Poster, imdbRating, Runtime, Actors, imdbID);
        }
    }
}

// OMDB API SERVICE
// Handles API calls with encapsulation
class OMDBService {
    #apiKey;
    #baseURL;

    constructor(apiKey = '83fcc659') { // Replace with actual key
        this.#apiKey = apiKey;
        this.#baseURL = 'https://www.omdbapi.com/';
    }

    // Search movies by title
    async searchMovies(searchTerm) {
        try {
            const response = await fetch(`${this.#baseURL}?apikey=${this.#apiKey}&s=${encodeURIComponent(searchTerm)}`);
            const data = await response.json();
            
            if (data.Response === 'True') {
                return data.Search;
            } else {
                throw new Error(data.Error || 'Movie not found');
            }
        } catch (error) {
            console.error('Search error:', error);
            throw error;
        }
    }

    // Get detailed movie information
    async getMovieDetails(imdbID) {
        try {
            const response = await fetch(`${this.#baseURL}?apikey=${this.#apiKey}&i=${imdbID}&plot=full`);
            const data = await response.json();
            
            if (data.Response === 'True') {
                return data;
            } else {
                throw new Error(data.Error || 'Movie details not found');
            }
        } catch (error) {
            console.error('Details error:', error);
            throw error;
        }
    }
}

// LOCAL STORAGE MANAGER
// Handles persistence with encapsulation
class StorageManager {
    #storageKey;

    constructor(key = 'cinevault_collection') {
        this.#storageKey = key;
    }

    // Save collection to localStorage
    saveCollection(user) {
        const data = {
            userName: user.name,
            movies: user.getAllMovies().map(movie => ({
                ...movie.getMovieInfo(),
                reviews: movie.getReviews()
            }))
        };
        localStorage.setItem(this.#storageKey, JSON.stringify(data));
    }

    // Load collection from localStorage
    loadCollection() {
        const data = localStorage.getItem(this.#storageKey);
        return data ? JSON.parse(data) : null;
    }

    // Clear collection
    clearCollection() {
        localStorage.removeItem(this.#storageKey);
    }
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Movie,
        ActionMovie,
        ComedyMovie,
        DramaMovie,
        HorrorMovie,
        SciFiMovie,
        Review,
        User,
        MovieFactory,
        OMDBService,
        StorageManager
    };
}
