/* Global Variables (state + DOM) */

const container = document.getElementById("movie-container");
const searchInput = document.getElementById("searchInput");
const addBtn = document.getElementById("addBtn");

let movieLibrary = JSON.parse(localStorage.getItem("movies")) || [];


/* Classes (OOP models) */

class Movie {
    constructor(id, title, year, genre, imdbRating, poster) {
        this.id = id;
        this.title = title;
        this.year = year;
        this.genre = genre;
        this.imdbRating = imdbRating;
        this.poster = poster;
        this.userRating = null;
    }

    display() {
        return `
          <div class="movie-card" data-id="${this.id}">
            <h2>${this.title}</h2>
            <button class="delete-btn">Delete</button>
          </div>  
        `;
    }
}

/* Utility functions */

function saveToLocalStorage () {
    localStorage.setItem("movies", JSON.stringify(movieLibrary));
}

async function fetchMovie(title) {
    const  API_KEY = " 83fcc659";

    const response = await fetch(
        `https://www.omdbapi.com/?t=${title}&apikey=${API_KEY}`
    );

    return await response.json();
}

/* CRUD Logic */
function renderMovies() {
    container.innerHTML = "";

    movieLibrary.forEach(movie => {
        const movieObj = new Movie(
            movie.id,
            movie.title,
            movie.year,
            movie.genre,
            movie.imdbRating,
            movie.poster,
        );

        container.innerHTML += movieObj.display();
    });
}

async function addMovie() {
    const title = searchInput.ariaValueMax.trim();
    if (!title) return;

    const data = await fetchMovie(title);
    if (!data || data.Response === "False") return;

    const newMovie = new Movie(
        Date.now(),
        data.Title,
        data.Year,
        data.Genre,
        data.imdbRating,
        data.Poster,
    );

    movieLibrary.push(newMovie);
    saveToLocalStorage();
    renderMovies();
}

function deleteMovie(id) {
    movieLibrary = movieLibrary.filter(movie => movie.id !== id);
    saveToLocalStorage();
    renderMovies();
}

/* Event Listeners */
addBtn.addEventListener("click", addMovie);

container.addEventListener("click", function (e) {
    if (e.target.classList.contains("delete-btn")) {
        const card = e.target.closest(".movie-card");
        const id = Number(card.dataset.id);
        deleteMovie(id);
    }
});

/* App Initialization */
    renderMovies();