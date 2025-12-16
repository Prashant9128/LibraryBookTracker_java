const API_URL = '/api/books';

const bookGrid = document.getElementById('bookGrid');
const addBookBtn = document.getElementById('addBookBtn');
const addBookModal = document.getElementById('addBookModal');
const closeModal = document.getElementById('closeModal');
const addBookForm = document.getElementById('addBookForm');

// State
let books = [];

// Fetch Books
async function fetchBooks() {
    try {
        const response = await fetch(API_URL);
        books = await response.json();
        renderBooks();
    } catch (error) {
        console.error('Error fetching books:', error);
    }
}

// Render Books
function renderBooks() {
    bookGrid.innerHTML = books.map(book => `
        <div class="book-card">
            <h3>${escapeHtml(book.title)}</h3>
            <span class="author">by ${escapeHtml(book.author)}</span>
            <div class="card-footer">
                <span class="isbn">ISBN: ${escapeHtml(book.isbn)}</span>
                <button class="delete-btn" onclick="deleteBook('${book.isbn}')">Remove</button>
            </div>
        </div>
    `).join('');
}

// Add Book
addBookForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newBook = {
        title: document.getElementById('title').value,
        author: document.getElementById('author').value,
        isbn: document.getElementById('isbn').value
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newBook)
        });

        if (response.ok) {
            closeModalFunc();
            addBookForm.reset();
            fetchBooks();
        }
    } catch (error) {
        console.error('Error adding book:', error);
    }
});

// Delete Book
window.deleteBook = async (isbn) => {
    if (!confirm('Are you sure you want to remove this book?')) return;

    try {
        const response = await fetch(`${API_URL}/${isbn}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            fetchBooks();
        }
    } catch (error) {
        console.error('Error deleting book:', error);
    }
};

// Modal Logic
addBookBtn.addEventListener('click', () => {
    addBookModal.classList.add('active');
});

function closeModalFunc() {
    addBookModal.classList.remove('active');
}

closeModal.addEventListener('click', closeModalFunc);

addBookModal.addEventListener('click', (e) => {
    if (e.target === addBookModal) {
        closeModalFunc();
    }
});

// Utility
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Initial Load
fetchBooks();
