const API_URL = '/api/books';

const bookGrid = document.getElementById('bookGrid');
const addBookBtn = document.getElementById('addBookBtn');
const addBookModal = document.getElementById('addBookModal');
const closeModal = document.getElementById('closeModal');
const addBookForm = document.getElementById('addBookForm');
const searchInput = document.getElementById('searchInput');
const toastContainer = document.getElementById('toastContainer');

// State
let books = [];

// Fetch Books
async function fetchBooks() {
    try {
        const response = await fetch(API_URL);
        books = await response.json();
        renderBooks(books);
    } catch (error) {
        showToast('Error fetching books', 'error');
        console.error('Error fetching books:', error);
    }
}

// Render Books
function renderBooks(booksToRender) {
    if (booksToRender.length === 0) {
        bookGrid.innerHTML = `
            <div class="empty-state">
                <span class="empty-state-icon">📚</span>
                <p>No books found in your library.</p>
                ${books.length > 0 ? '' : '<p>Click "Add Book" to get started.</p>'}
            </div>
        `;
        return;
    }

    bookGrid.innerHTML = booksToRender.map(book => `
        <div class="book-card">
            <div class="card-header">
                <h3>${escapeHtml(book.title)}</h3>
                <span 
                    class="status-badge ${book.available ? 'available' : 'borrowed'}"
                    onclick="toggleStatus('${book.isbn}')"
                    title="Click to toggle status"
                >
                    ${book.available ? 'Available' : 'Borrowed'}
                </span>
            </div>
            <span class="author">by ${escapeHtml(book.author)}</span>
            <div class="card-footer">
                <span class="isbn">ISBN: ${escapeHtml(book.isbn)}</span>
                <button class="delete-btn" onclick="deleteBook('${book.isbn}')">Remove</button>
            </div>
        </div>
    `).join('');
}

// Search Handler
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = books.filter(book =>
        book.title.toLowerCase().includes(term) ||
        book.author.toLowerCase().includes(term) ||
        book.isbn.includes(term)
    );
    renderBooks(filtered);
});

// Toggle Status
window.toggleStatus = async (isbn) => {
    try {
        const response = await fetch(`${API_URL}/${isbn}/status`, {
            method: 'PUT'
        });

        if (response.ok) {
            // Optimistic update
            const book = books.find(b => b.isbn === isbn);
            if (book) {
                book.available = !book.available;
                renderBooks(books); // Re-render to show new Status using current filter if any
                // Re-apply search filter if needed, but simple re-render of 'books' clears filter visually if we don't track it. 
                // Better: re-trigger search logic:
                searchInput.dispatchEvent(new Event('input'));

                showToast(`Marked as ${book.available ? 'Available' : 'Borrowed'}`, 'success');
            }
        }
    } catch (error) {
        showToast('Failed to update status', 'error');
    }
};

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
            await fetchBooks();
            showToast('Book added successfully!', 'success');
        }
    } catch (error) {
        showToast('Error adding book', 'error');
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
            await fetchBooks();
            showToast('Book designated for removal', 'success');
        }
    } catch (error) {
        showToast('Error deleting book', 'error');
    }
};

// Toast Notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${type === 'success' ? '✅' : '❌'}</span>
        <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

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
