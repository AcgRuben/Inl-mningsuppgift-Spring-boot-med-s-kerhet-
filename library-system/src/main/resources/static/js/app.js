/**
 * Bibliotekssystem - Single Page Application Frontend
 * Handles HTTP Basic Authentication, REST API communication, state management, and UI rendering.
 */

// Global Application State
const state = {
    auth: {
        username: '',
        password: '',
        role: 'GUEST', // 'GUEST', 'ROLE_USER', 'ROLE_ADMIN'
        isLoggedIn: false
    },
    books: {
        page: 0,
        size: 9,
        sortBy: 'title',
        sortDir: 'asc',
        totalPages: 1,
        activeSearch: false
    },
    authors: {
        searchLastName: ''
    }
};

// DOM Elements
const elements = {
    // Auth
    userInfo: document.getElementById('userInfo'),
    authButtons: document.getElementById('authButtons'),
    userAvatar: document.getElementById('userAvatar'),
    displayUsername: document.getElementById('displayUsername'),
    displayRole: document.getElementById('displayRole'),
    logoutBtn: document.getElementById('logoutBtn'),
    
    // Tabs & Sections
    navTabs: document.querySelectorAll('.nav-tab'),
    tabPages: document.querySelectorAll('.tab-page'),

    // Books Tab
    booksGrid: document.getElementById('booksGrid'),
    bookSearchInput: document.getElementById('bookSearchInput'),
    bookSearchBtn: document.getElementById('bookSearchBtn'),
    sortBySelect: document.getElementById('sortBySelect'),
    sortDirSelect: document.getElementById('sortDirSelect'),
    prevPageBtn: document.getElementById('prevPageBtn'),
    nextPageBtn: document.getElementById('nextPageBtn'),
    pageIndicator: document.getElementById('pageIndicator'),
    openAddBookBtn: document.getElementById('openAddBookBtn'),

    // Authors Tab
    authorsGrid: document.getElementById('authorsGrid'),
    authorSearchInput: document.getElementById('authorSearchInput'),
    authorSearchBtn: document.getElementById('authorSearchBtn'),
    resetAuthorsBtn: document.getElementById('resetAuthorsBtn'),
    openAddAuthorBtn: document.getElementById('openAddAuthorBtn'),

    // Loans Tab
    loansTableBody: document.getElementById('loansTableBody'),
    refreshLoansBtn: document.getElementById('refreshLoansBtn'),
    openCreateLoanBtn: document.getElementById('openCreateLoanBtn'),

    // Profile Tab
    profileEmail: document.getElementById('profileEmail'),
    profileRoleBadge: document.getElementById('profileRoleBadge'),
    myLoansList: document.getElementById('myLoansList'),

    // Modals & Forms
    loginModal: document.getElementById('loginModal'),
    loginForm: document.getElementById('loginForm'),
    registerModal: document.getElementById('registerModal'),
    registerForm: document.getElementById('registerForm'),
    addBookModal: document.getElementById('addBookModal'),
    addBookForm: document.getElementById('addBookForm'),
    addAuthorModal: document.getElementById('addAuthorModal'),
    addAuthorForm: document.getElementById('addAuthorForm'),
    createLoanModal: document.getElementById('createLoanModal'),
    createLoanForm: document.getElementById('createLoanForm'),

    // Toast
    toastContainer: document.getElementById('toastContainer')
};

/* ==========================================================================
   INITIALIZATION & PERSISTENCE
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    restoreSession();
    setupEventListeners();
    loadBooks();
});

function restoreSession() {
    const savedAuth = sessionStorage.getItem('library_auth');
    if (savedAuth) {
        try {
            const parsed = JSON.parse(savedAuth);
            state.auth = parsed;
            updateAuthUI();
        } catch (e) {
            sessionStorage.removeItem('library_auth');
        }
    }
}

function saveSession() {
    sessionStorage.setItem('library_auth', JSON.stringify(state.auth));
}

/* ==========================================================================
   HTTP API CLIENT WITH BASIC AUTH
   ========================================================================== */
async function fetchApi(endpoint, options = {}) {
    const headers = options.headers || {};
    
    if (state.auth.isLoggedIn && state.auth.username && state.auth.password) {
        const credentials = btoa(`${state.auth.username}:${state.auth.password}`);
        headers['Authorization'] = `Basic ${credentials}`;
    }

    if (!headers['Content-Type'] && options.body && typeof options.body === 'string') {
        headers['Content-Type'] = 'application/json';
    }

    const config = {
        ...options,
        headers
    };

    try {
        const response = await fetch(endpoint, config);

        if (response.status === 401) {
            showToast('Behörighet saknas eller felaktigt lösenord (401)', 'error');
            throw new Error('Unauthorized');
        } else if (response.status === 403) {
            showToast('Åtkomst nekad: Du saknar rätt roll för denna åtgärd (403)', 'warning');
            throw new Error('Forbidden');
        }

        return response;
    } catch (err) {
        console.error('Fetch error:', err);
        throw err;
    }
}

/* ==========================================================================
   AUTHENTICATION LOGIC
   ========================================================================== */
async function handleLogin(username, password) {
    state.auth.username = username;
    state.auth.password = password;
    state.auth.isLoggedIn = true;

    // Test credentials by attempting access to user-page and admin-page
    try {
        const adminTest = await fetchApi('/auth/admin-page');
        if (adminTest.ok) {
            state.auth.role = 'ROLE_ADMIN';
            showToast(`Välkommen tillbaka, ${username} (Admin)`, 'success');
        } else {
            const userTest = await fetchApi('/auth/user-page');
            if (userTest.ok) {
                state.auth.role = 'ROLE_USER';
                showToast(`Välkommen tillbaka, ${username}`, 'success');
            } else {
                throw new Error('Inloggning misslyckades');
            }
        }

        saveSession();
        updateAuthUI();
        closeModal(elements.loginModal);
        loadBooks();
        loadMyLoans();
    } catch (err) {
        state.auth.username = '';
        state.auth.password = '';
        state.auth.isLoggedIn = false;
        state.auth.role = 'GUEST';
        showToast('Felaktigt användarnamn eller lösenord', 'error');
    }
}

async function handleRegister(firstName, lastName, email, password, role) {
    try {
        const payload = { email, password, role };
        if (firstName && firstName.trim()) payload.firstName = firstName.trim();
        if (lastName && lastName.trim()) payload.lastName = lastName.trim();

        const response = await fetch('/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const text = await response.text();

        if (response.ok) {
            showToast('Konto registrerat! Logga in nu.', 'success');
            closeModal(elements.registerModal);
            openModal(elements.loginModal);
            document.getElementById('loginEmail').value = email;
            document.getElementById('loginPassword').value = password;
        } else {
            showToast(text || 'Registreringen misslyckades', 'error');
        }
    } catch (err) {
        showToast('Nätverksfel vid registrering', 'error');
    }
}

function handleLogout() {
    state.auth = { username: '', password: '', role: 'GUEST', isLoggedIn: false };
    sessionStorage.removeItem('library_auth');
    updateAuthUI();
    showToast('Du har loggats ut', 'success');
    loadBooks();
}

function updateAuthUI() {
    if (state.auth.isLoggedIn) {
        elements.authButtons.classList.add('hidden');
        elements.userInfo.classList.remove('hidden');
        elements.displayUsername.textContent = state.auth.username;
        elements.displayRole.textContent = state.auth.role === 'ROLE_ADMIN' ? 'ADMIN' : 'USER';
        elements.userAvatar.textContent = state.auth.username.charAt(0).toUpperCase();

        if (state.auth.role === 'ROLE_ADMIN') {
            document.body.classList.add('admin-mode');
            elements.displayRole.classList.add('admin');
        } else {
            document.body.classList.remove('admin-mode');
            elements.displayRole.classList.remove('admin');
        }

        elements.profileEmail.textContent = state.auth.username;
        elements.profileRoleBadge.textContent = state.auth.role;
        elements.profileRoleBadge.className = `badge ${state.auth.role === 'ROLE_ADMIN' ? 'admin' : 'user'}`;
    } else {
        elements.authButtons.classList.remove('hidden');
        elements.userInfo.classList.add('hidden');
        document.body.classList.remove('admin-mode');

        elements.profileEmail.textContent = 'Ej inloggad';
        elements.profileRoleBadge.textContent = 'EJ INLOGGAD';
        elements.profileRoleBadge.className = 'badge';
        elements.myLoansList.innerHTML = '<p class="text-muted">Logga in för att se dina lån.</p>';
    }
}

/* ==========================================================================
   BOOKS TAB LOGIC
   ========================================================================== */
async function loadBooks() {
    elements.booksGrid.innerHTML = '<div class="loading-spinner">Hämtar böcker...</div>';

    try {
        const query = `page=${state.books.page}&size=${state.books.size}&sortBy=${state.books.sortBy}&sortDirection=${state.books.sortDir}`;
        const response = await fetchApi(`/books?${query}`);

        if (response.ok) {
            const data = await response.json();
            renderBooks(data.content || []);
            state.books.totalPages = data.totalPages || 1;
            updatePaginationUI();
        } else {
            elements.booksGrid.innerHTML = '<p class="text-muted">Du måste vara inloggad för att se böckerna i biblioteket.</p>';
        }
    } catch (err) {
        elements.booksGrid.innerHTML = '<p class="text-muted">Kunde inte hämta böcker. Logga in och försök igen.</p>';
    }
}

async function searchBooks(term) {
    if (!term.trim()) {
        state.books.activeSearch = false;
        loadBooks();
        return;
    }

    elements.booksGrid.innerHTML = '<div class="loading-spinner">Söker böcker...</div>';
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
        elements.pageIndicator.textContent = `Sökresultat: ${books.length} böcker hittades`;
        elements.prevPageBtn.disabled = true;
        elements.nextPageBtn.disabled = true;
    } catch (err) {
        elements.booksGrid.innerHTML = '<p class="text-muted">Sökningen misslyckades.</p>';
    }
}

function renderBooks(books) {
    if (books.length === 0) {
        elements.booksGrid.innerHTML = '<p class="text-muted">Inga böcker hittades.</p>';
        return;
    }

    elements.booksGrid.innerHTML = books.map(book => `
        <div class="book-card">
            <div class="book-header">
                <h3 class="book-title">${escapeHtml(book.title)}</h3>
                <span class="book-isbn">ISBN: ${escapeHtml(book.isbn || 'N/A')}</span>
                <div class="book-author">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    Författare ID: ${book.authorId || 'Okänd'}
                </div>
            </div>
            <div class="book-actions">
                <span class="badge">ID: ${book.id}</span>
                <button class="btn btn-danger btn-sm admin-only" onclick="deleteBook(${book.id})">Radera</button>
            </div>
        </div>
    `).join('');
}

async function addBook(title, isbn, authorId) {
    try {
        const bodyData = { title, isbn };
        if (authorId) bodyData.authorId = parseInt(authorId, 10);

        const res = await fetchApi('/books', {
            method: 'POST',
            body: JSON.stringify(bodyData)
        });

        if (res.ok) {
            showToast('Boken lades till framgångsrikt!', 'success');
            closeModal(elements.addBookModal);
            elements.addBookForm.reset();
            loadBooks();
        } else {
            showToast('Kunde inte lägga till bok (Behörighet saknas eller ogiltiga data)', 'error');
        }
    } catch (err) {
        showToast('Ett fel uppstod när boken skulle sparas', 'error');
    }
}

async function deleteBook(id) {
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

function updatePaginationUI() {
    if (state.books.activeSearch) return;
    elements.pageIndicator.textContent = `Sida ${state.books.page + 1} av ${state.books.totalPages}`;
    elements.prevPageBtn.disabled = state.books.page <= 0;
    elements.nextPageBtn.disabled = state.books.page >= state.books.totalPages - 1;
}

/* ==========================================================================
   AUTHORS TAB LOGIC
   ========================================================================== */
async function loadAuthors(lastNameQuery = '') {
    elements.authorsGrid.innerHTML = '<div class="loading-spinner">Hämtar författare...</div>';

    try {
        const endpoint = lastNameQuery 
            ? `/authors/search?lastName=${encodeURIComponent(lastNameQuery)}`
            : '/authors';

        const res = await fetchApi(endpoint);
        if (res.ok) {
            const authors = await res.json();
            renderAuthors(authors);
        } else {
            elements.authorsGrid.innerHTML = '<p class="text-muted">Kunde inte hämta författare.</p>';
        }
    } catch (err) {
        elements.authorsGrid.innerHTML = '<p class="text-muted">Inloggning krävs för att se författare.</p>';
    }
}

function renderAuthors(authors) {
    if (authors.length === 0) {
        elements.authorsGrid.innerHTML = '<p class="text-muted">Inga författare hittades.</p>';
        return;
    }

    elements.authorsGrid.innerHTML = authors.map(author => `
        <div class="author-card">
            <div>
                <h3>${escapeHtml(author.firstName)} ${escapeHtml(author.lastName)}</h3>
                <p class="text-muted" style="font-size: 0.8rem; margin-top: 4px;">ID: ${author.id}</p>
            </div>
        </div>
    `).join('');
}

async function addAuthor(firstName, lastName) {
    try {
        const res = await fetchApi('/authors', {
            method: 'POST',
            body: JSON.stringify({ firstName, lastName })
        });

        if (res.ok) {
            showToast('Författaren skapades!', 'success');
            closeModal(elements.addAuthorModal);
            elements.addAuthorForm.reset();
            loadAuthors();
        } else {
            showToast('Kunde inte skapa författare', 'error');
        }
    } catch (err) {
        showToast('Fel vid skapande av författare', 'error');
    }
}

/* ==========================================================================
   LOANS TAB LOGIC (ADMIN)
   ========================================================================== */
async function loadLoans() {
    if (state.auth.role !== 'ROLE_ADMIN') {
        elements.loansTableBody.innerHTML = '<tr><td colspan="7" class="text-center">Endast administratörer har tillgång till låneöversikten.</td></tr>';
        return;
    }

    elements.loansTableBody.innerHTML = '<tr><td colspan="7" class="text-center">Hämtar alla lån...</td></tr>';

    try {
        const res = await fetchApi('/loans');
        if (res.ok) {
            const loans = await res.json();
            renderLoansTable(loans);
        } else {
            elements.loansTableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Kunde inte hämta lån.</td></tr>';
        }
    } catch (err) {
        elements.loansTableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Åtkomst nekad.</td></tr>';
    }
}

function renderLoansTable(loans) {
    if (loans.length === 0) {
        elements.loansTableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Inga aktiva lån hittades i systemet.</td></tr>';
        return;
    }

    elements.loansTableBody.innerHTML = loans.map(loan => `
        <tr>
            <td><strong>#${loan.id}</strong></td>
            <td>User #${loan.userId || (loan.user ? loan.user.id : 'N/A')}</td>
            <td>Book #${loan.bookId || (loan.book ? loan.book.id : 'N/A')}</td>
            <td>${loan.loanDate || 'N/A'}</td>
            <td>${loan.dueDate || 'N/A'}</td>
            <td>
                <span class="badge ${loan.returned ? 'success' : 'warning'}">
                    ${loan.returned ? 'Ja' : 'Nej (Aktivt)'}
                </span>
            </td>
            <td>
                ${!loan.returned ? `
                    <button class="btn btn-sm btn-outline" onclick="returnLoan(${loan.id})">Återlämna</button>
                    <button class="btn btn-sm btn-secondary" onclick="extendLoan(${loan.id})">Förläng</button>
                ` : '<span class="text-muted">-</span>'}
            </td>
        </tr>
    `).join('');
}

async function createLoan(userId, bookId) {
    try {
        const res = await fetchApi(`/loans?userId=${userId}&bookId=${bookId}`, {
            method: 'POST'
        });

        if (res.ok) {
            const text = await res.text();
            showToast(text || 'Lånet har skapats!', 'success');
            closeModal(elements.createLoanModal);
            elements.createLoanForm.reset();
            loadLoans();
        } else {
            showToast('Kunde inte skapa lån', 'error');
        }
    } catch (err) {
        showToast('Fel vid skapande av lån', 'error');
    }
}

async function returnLoan(loanId) {
    try {
        const res = await fetchApi(`/loans/${loanId}/return`, { method: 'PUT' });
        if (res.ok) {
            showToast('Boken återlämnad!', 'success');
            loadLoans();
        } else {
            showToast('Kunde inte återlämna boken', 'error');
        }
    } catch (err) {
        showToast('Fel vid återlämning', 'error');
    }
}

async function extendLoan(loanId) {
    try {
        const res = await fetchApi(`/loans/${loanId}/extend`, { method: 'PUT' });
        if (res.ok) {
            showToast('Lånet har förlängts!', 'success');
            loadLoans();
        } else {
            showToast('Kunde inte förlänga lånet', 'error');
        }
    } catch (err) {
        showToast('Fel vid förlängning', 'error');
    }
}

/* ==========================================================================
   MY LOANS & PROFILE
   ========================================================================== */
async function loadMyLoans() {
    if (!state.auth.isLoggedIn) {
        elements.myLoansList.innerHTML = '<p class="text-muted">Logga in för att se dina aktiva lån.</p>';
        return;
    }

    try {
        const userRes = await fetchApi(`/users/${encodeURIComponent(state.auth.username)}`);
        if (userRes.ok) {
            const userObj = await userRes.json();
            if (userObj && userObj.id) {
                const loansRes = await fetchApi(`/users/${userObj.id}/loans`);
                if (loansRes.ok) {
                    const loans = await loansRes.json();
                    renderMyLoans(loans);
                    return;
                }
            }
        }
        elements.myLoansList.innerHTML = '<p class="text-muted">Inga registrerade lån hittades för detta konto.</p>';
    } catch (err) {
        elements.myLoansList.innerHTML = '<p class="text-muted">Kunde inte hämta personliga lån.</p>';
    }
}

function renderMyLoans(loans) {
    if (loans.length === 0) {
        elements.myLoansList.innerHTML = '<p class="text-muted">Du har inga aktiva lån för närvarande.</p>';
        return;
    }

    elements.myLoansList.innerHTML = loans.map(loan => `
        <div class="card" style="margin-bottom: 10px; padding: 12px 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>Lån #${loan.id}</strong> (Bok ID: ${loan.bookId || (loan.book ? loan.book.id : 'N/A')})
                    <div style="font-size: 0.8rem;" class="text-muted">Förfallodatum: ${loan.dueDate || 'Ej angivet'}</div>
                </div>
                <span class="badge ${loan.returned ? 'success' : 'warning'}">
                    ${loan.returned ? 'Återlämnad' : 'Aktivt'}
                </span>
            </div>
        </div>
    `).join('');
}

/* ==========================================================================
   EVENT LISTENERS & MODAL HANDLERS
   ========================================================================== */
function setupEventListeners() {
    // Navigation Tabs
    elements.navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            elements.navTabs.forEach(t => t.classList.remove('active'));
            elements.tabPages.forEach(p => p.classList.remove('active'));

            tab.classList.add('active');
            const targetId = `tab-${tab.dataset.tab}`;
            const targetPage = document.getElementById(targetId);
            if (targetPage) targetPage.classList.add('active');

            // Trigger specific tab loads
            if (tab.dataset.tab === 'books') loadBooks();
            if (tab.dataset.tab === 'authors') loadAuthors();
            if (tab.dataset.tab === 'loans') loadLoans();
            if (tab.dataset.tab === 'my-loans') loadMyLoans();
        });
    });

    // Auth Buttons & Modals
    document.getElementById('openLoginModalBtn').addEventListener('click', () => openModal(elements.loginModal));
    document.getElementById('openRegisterModalBtn').addEventListener('click', () => openModal(elements.registerModal));
    elements.logoutBtn.addEventListener('click', handleLogout);

    // Modal Close Buttons
    document.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modalId = e.target.dataset.close;
            closeModal(document.getElementById(modalId));
        });
    });

    // Login Form Submit
    elements.loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const pass = document.getElementById('loginPassword').value;
        handleLogin(email, pass);
    });

    // Register Form Submit
    elements.registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fName = document.getElementById('regFirstName').value;
        const lName = document.getElementById('regLastName').value;
        const email = document.getElementById('regEmail').value;
        const pass = document.getElementById('regPassword').value;
        const role = document.getElementById('regRole').value;
        handleRegister(fName, lName, email, pass, role);
    });

    // Book Actions
    elements.bookSearchBtn.addEventListener('click', () => searchBooks(elements.bookSearchInput.value));
    elements.bookSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchBooks(elements.bookSearchInput.value);
    });

    elements.sortBySelect.addEventListener('change', (e) => {
        state.books.sortBy = e.target.value;
        loadBooks();
    });

    elements.sortDirSelect.addEventListener('change', (e) => {
        state.books.sortDir = e.target.value;
        loadBooks();
    });

    elements.prevPageBtn.addEventListener('click', () => {
        if (state.books.page > 0) {
            state.books.page--;
            loadBooks();
        }
    });

    elements.nextPageBtn.addEventListener('click', () => {
        if (state.books.page < state.books.totalPages - 1) {
            state.books.page++;
            loadBooks();
        }
    });

    elements.openAddBookBtn.addEventListener('click', () => openModal(elements.addBookModal));
    elements.addBookForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('bookTitle').value;
        const isbn = document.getElementById('bookIsbn').value;
        const authorId = document.getElementById('bookAuthorId').value;
        addBook(title, isbn, authorId);
    });

    // Author Actions
    elements.openAddAuthorBtn.addEventListener('click', () => openModal(elements.addAuthorModal));
    elements.authorSearchBtn.addEventListener('click', () => loadAuthors(elements.authorSearchInput.value));
    elements.resetAuthorsBtn.addEventListener('click', () => {
        elements.authorSearchInput.value = '';
        loadAuthors();
    });
    elements.addAuthorForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fName = document.getElementById('authorFirstName').value;
        const lName = document.getElementById('authorLastName').value;
        addAuthor(fName, lName);
    });

    // Loan Actions
    elements.openCreateLoanBtn.addEventListener('click', () => openModal(elements.createLoanModal));
    elements.refreshLoansBtn.addEventListener('click', loadLoans);
    elements.createLoanForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const uId = document.getElementById('loanUserId').value;
        const bId = document.getElementById('loanBookId').value;
        createLoan(uId, bId);
    });
}

/* ==========================================================================
   UI UTILITY FUNCTIONS
   ========================================================================== */
function openModal(modal) {
    if (modal) modal.classList.add('active');
}

function closeModal(modal) {
    if (modal) modal.classList.remove('active');
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${escapeHtml(message)}</span>
    `;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
