/**
 * Books Catalog Module
 */
import { state } from './state.js';
import { fetchApi } from './api.js';
import { showToast, escapeHtml, escapeJsString } from './toast.js';

export async function loadBooks() {
    const booksGrid = document.getElementById('booksGrid');
    if (!booksGrid) return;
    booksGrid.innerHTML = '<div class="loading-spinner">Hämtar böcker...</div>';

    try {
        const query = `page=${state.books.page}&size=${state.books.size}&sortBy=${state.books.sortBy}&sortDirection=${state.books.sortDir}`;
        const response = await fetchApi(`/books?${query}`);

        if (response.ok) {
            const data = await response.json();
            renderBooks(data.content || []);
            state.books.totalPages = data.totalPages || 1;
            updatePaginationUI();
        } else {
            booksGrid.innerHTML = '<p class="text-muted">Du måste vara inloggad för att se böckerna i biblioteket.</p>';
        }
    } catch (err) {
        booksGrid.innerHTML = '<p class="text-muted">Kunde inte hämta böcker. Logga in och försök igen.</p>';
    }
}

export async function searchBooks(term) {
    const booksGrid = document.getElementById('booksGrid');
    const pageIndicator = document.getElementById('pageIndicator');
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');

    if (!term.trim()) {
        state.books.activeSearch = false;
        loadBooks();
        return;
    }

    if (booksGrid) booksGrid.innerHTML = '<div class="loading-spinner">Söker böcker...</div>';
    state.books.activeSearch = true;

    try {
        const resTitle = await fetchApi(`/books/search/title?title=${encodeURIComponent(term)}`);
        let books = [];
        if (resTitle.ok) {
            books = await resTitle.json();
        }

        if (books.length === 0) {
            const resAuthor = await fetchApi(`/books/search/author?author=${encodeURIComponent(term)}`);
            if (resAuthor.ok) {
                books = await resAuthor.json();
            }
        }

        renderBooks(books);
        if (pageIndicator) pageIndicator.textContent = `Sökresultat: ${books.length} böcker hittades`;
        if (prevPageBtn) prevPageBtn.disabled = true;
        if (nextPageBtn) nextPageBtn.disabled = true;
    } catch (err) {
        if (booksGrid) booksGrid.innerHTML = '<p class="text-muted">Sökningen misslyckades.</p>';
    }
}

export function renderBooks(books) {
    const booksGrid = document.getElementById('booksGrid');
    if (!booksGrid) return;

    if (books.length === 0) {
        booksGrid.innerHTML = '<p class="text-muted">Inga böcker hittades.</p>';
        return;
    }

    booksGrid.innerHTML = books.map(book => {
        const available = book.availableCopies > 0;
        const bookId = book.id || book.bookId;

        return `
        <div class="book-card">
            <div class="book-header">
                <h3 class="book-title">${escapeHtml(book.title)}</h3>
                <span class="book-isbn">ISBN: ${escapeHtml(book.isbn || 'N/A')}</span>
                <div class="book-author">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    Författare ID: ${book.authorId || 'Okänd'}
                </div>
                <div style="font-size: 0.8rem; margin-top: 8px; font-weight: 600; color: ${available ? 'var(--success)' : 'var(--danger)'};">
                    ${available ? `Tillgänglig (${book.availableCopies} ex)` : 'Slutsåld / Utlånad'}
                </div>
            </div>
            <div class="book-actions">
                <button class="btn btn-primary btn-sm" onclick="window.borrowBookDirect(${bookId}, '${escapeJsString(book.title)}')" ${!available ? 'disabled' : ''}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                    Låna bok
                </button>
                <button class="btn btn-danger btn-sm admin-only" onclick="window.deleteBook(${bookId})">Radera</button>
            </div>
        </div>
    `}).join('');
}

export async function borrowBookDirect(bookId, bookTitle, onBorrowed) {
    if (!state.auth.isLoggedIn) {
        showToast('Du måste vara inloggad för att låna en bok.', 'warning');
        const loginModal = document.getElementById('loginModal');
        if (loginModal) loginModal.classList.add('active');
        return;
    }

    try {
        let userId = state.auth.userId;
        if (!userId) {
            const userRes = await fetchApi(`/users/${encodeURIComponent(state.auth.username)}`);
            if (userRes.ok) {
                const userObj = await userRes.json();
                userId = userObj.id || userObj.userId;
                state.auth.userId = userId;
            } else {
                showToast('Kunde inte hämta användarinformation för att skapa lån', 'error');
                return;
            }
        }

        if (!userId) {
            showToast('Ogiltigt användar-ID. Vänligen logga in igen.', 'error');
            return;
        }

        const res = await fetchApi(`/loans?userId=${userId}&bookId=${bookId}`, {
            method: 'POST'
        });

        if (res.ok) {
            showToast(`Du har lånat "${bookTitle}"! Tack och trevlig läsning.`, 'success');
            loadBooks();
            if (onBorrowed) onBorrowed();
        } else {
            const errorText = await res.text();
            showToast(errorText || 'Kunde inte låna boken', 'error');
        }
    } catch (err) {
        showToast('Fel vid skapande av lån', 'error');
    }
}

export async function addBook(title, isbn, authorId, onSuccess) {
    try {
        const bodyData = { title, isbn };
        if (authorId) bodyData.authorId = parseInt(authorId, 10);

        const res = await fetchApi('/books', {
            method: 'POST',
            body: JSON.stringify(bodyData)
        });

        if (res.ok) {
            showToast('Boken lades till framgångsrikt!', 'success');
            if (onSuccess) onSuccess();
            loadBooks();
        } else {
            showToast('Kunde inte lägga till bok', 'error');
        }
    } catch (err) {
        showToast('Ett fel uppstod när boken skulle sparas', 'error');
    }
}

export async function deleteBook(id) {
    if (!confirm(`Är du säker på att du vill radera boken med ID ${id}?`)) return;

    try {
        const res = await fetchApi(`/books/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showToast('Boken raderades', 'success');
            loadBooks();
        } else {
            showToast('Kunde inte radera boken', 'error');
        }
    } catch (err) {
        showToast('Fel vid radering av bok', 'error');
    }
}

export function updatePaginationUI() {
    if (state.books.activeSearch) return;
    const pageIndicator = document.getElementById('pageIndicator');
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');

    if (pageIndicator) pageIndicator.textContent = `Sida ${state.books.page + 1} av ${state.books.totalPages}`;
    if (prevPageBtn) prevPageBtn.disabled = state.books.page <= 0;
    if (nextPageBtn) nextPageBtn.disabled = state.books.page >= state.books.totalPages - 1;
}
