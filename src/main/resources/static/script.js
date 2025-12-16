const API_URL = '/api/books';

// DOM Elements
const bookGrid = document.getElementById('bookGrid');
const addBookBtn = document.getElementById('addBookBtn');
const addBookModal = document.getElementById('addBookModal');
const closeModal = document.getElementById('closeModal');
const addBookForm = document.getElementById('addBookForm');
const searchInput = document.getElementById('searchInput');

// Stat Elements
const totalEl = document.getElementById('totalBooks');
const availableEl = document.getElementById('availableBooks');
const borrowedEl = document.getElementById('borrowedBooks');

// State
let books = [];

// Initialize Tilt for Stats
VanillaTilt.init(document.querySelectorAll(".stat-card"), {
    max: 10,
    speed: 400,
    glare: true,
    "max-glare": 0.1
});

// Fetch & Render
async function fetchBooks() {
    try {
        const response = await fetch(API_URL);
        books = await response.json();
        updateStats();
        renderBooks(books);
    } catch (error) {
        showToast('System Error: Could not fetch data', 'error');
    }
}

function updateStats() {
    // Animate numbers
    const total = books.length;
    const available = books.filter(b => b.available).length;
    const borrowed = total - available;

    animateValue(totalEl, parseInt(totalEl.innerText), total, 1000);
    animateValue(availableEl, parseInt(availableEl.innerText), available, 1000);
    animateValue(borrowedEl, parseInt(borrowedEl.innerText), borrowed, 1000);
}

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function renderBooks(data) {
    if (data.length === 0) {
        bookGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem; opacity: 0.5;">
                <i class="fa-solid fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <p>No records found in the database.</p>
            </div>
        `;
        return;
    }

    bookGrid.innerHTML = data.map(book => `
        <div class="book-card-item">
            <div class="card-top">
                <h4>${escapeHtml(book.title)}</h4>
                <div class="book-meta">
                    <i class="fa-solid fa-user-pen"></i>
                    <span>${escapeHtml(book.author)}</span>
                </div>
                
                <div class="status-chip ${book.available ? 'available' : 'borrowed'}"
                     onclick="toggleStatus('${book.isbn}')">
                    <i class="fa-solid ${book.available ? 'fa-check' : 'fa-clock'}"></i>
                    <span>${book.available ? 'In Stock' : 'Checked Out'}</span>
                </div>
            </div>

            <div class="card-actions">
                <span class="isbn-tag">#${escapeHtml(book.isbn)}</span>
                <button class="btn-trash" onclick="deleteBook('${book.isbn}')">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Search
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = books.filter(b =>
        b.title.toLowerCase().includes(term) ||
        b.author.toLowerCase().includes(term) ||
        b.isbn.includes(term)
    );
    renderBooks(filtered);
});

// Toggle Status
window.toggleStatus = async (isbn) => {
    try {
        const response = await fetch(`${API_URL}/${isbn}/status`, { method: 'PUT' });
        if (response.ok) {
            // Optimistic update
            const book = books.find(b => b.isbn === isbn);
            if (book) book.available = !book.available;
            updateStats();
            searchInput.dispatchEvent(new Event('input')); // Re-render with filter
            showToast('Status updated successfully');
        }
    } catch (e) { showToast('Update failed', 'error'); }
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
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newBook)
        });

        if (res.ok) {
            closeModalFunc();
            addBookForm.reset();
            fetchBooks();
            showToast('New record created');
        }
    } catch (e) { showToast('Submission failed', 'error'); }
});

// Delete
window.deleteBook = async (isbn) => {
    if (!confirm('Archive this record?')) return;
    try {
        const res = await fetch(`${API_URL}/${isbn}`, { method: 'DELETE' });
        if (res.ok) {
            fetchBooks();
            showToast('Record archived');
        }
    } catch (e) { showToast('Delete failed', 'error'); }
};

// Toast
function showToast(msg, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.style.cssText = `
        background: rgba(30, 41, 59, 0.9);
        backdrop-filter: blur(10px);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        border-left: 4px solid ${type === 'success' ? '#4ade80' : '#ef4444'};
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        display: flex; align-items: center; gap: 1rem;
        animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        font-size: 0.9rem;
    `;
    toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'}"></i> ${msg}`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.4s forwards';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// Modal
addBookBtn.onclick = () => addBookModal.classList.add('active');
const closeModalFunc = () => addBookModal.classList.remove('active');
closeModal.onclick = closeModalFunc;
addBookModal.onclick = (e) => { if (e.target === addBookModal) closeModalFunc(); };

// Init
fetchBooks();

// Helper
function escapeHtml(text) {
    if (!text) return '';
    return text.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
