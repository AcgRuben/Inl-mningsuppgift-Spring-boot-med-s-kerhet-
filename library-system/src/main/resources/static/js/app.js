/**
 * Main Application Entry Point
 * Imports ES modules and sets up DOM listeners.
 */

import { state, restoreSession } from './state.js';
import { handleLogin, handleRegister, handleLogout, updateAuthUI } from './auth.js';
import { loadBooks, searchBooks, addBook, deleteBook, borrowBookDirect } from './books.js';
import { loadAuthors, addAuthor } from './authors.js';
import { loadLoans, createLoan, returnLoan, extendLoan } from './loans.js';
import { loadMyLoans, returnMyLoan, extendMyLoan } from './profile.js';

// Expose global window handlers for inline DOM onclick handlers
window.borrowBookDirect = (bookId, title) => borrowBookDirect(bookId, title, loadMyLoans);
window.deleteBook = deleteBook;
window.returnLoan = returnLoan;
window.extendLoan = extendLoan;
window.returnMyLoan = returnMyLoan;
window.extendMyLoan = extendMyLoan;

document.addEventListener('DOMContentLoaded', () => {
    restoreSession();
    updateAuthUI();
    setupEventListeners();
    loadBooks();
});

function setupEventListeners() {
    // Navigation Tabs
    const navTabs = document.querySelectorAll('.nav-tab');
    const tabPages = document.querySelectorAll('.tab-page');

    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            navTabs.forEach(t => t.classList.remove('active'));
            tabPages.forEach(p => p.classList.remove('active'));

            tab.classList.add('active');
            const targetId = `tab-${tab.dataset.tab}`;
            const targetPage = document.getElementById(targetId);
            if (targetPage) targetPage.classList.add('active');

            if (tab.dataset.tab === 'books') loadBooks();
            if (tab.dataset.tab === 'authors') loadAuthors();
            if (tab.dataset.tab === 'loans') loadLoans();
            if (tab.dataset.tab === 'my-loans') loadMyLoans();
        });
    });

    // Modals Open/Close
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const addBookModal = document.getElementById('addBookModal');
    const addAuthorModal = document.getElementById('addAuthorModal');
    const createLoanModal = document.getElementById('createLoanModal');

    document.getElementById('openLoginModalBtn')?.addEventListener('click', () => loginModal?.classList.add('active'));
    document.getElementById('openRegisterModalBtn')?.addEventListener('click', () => registerModal?.classList.add('active'));
    document.getElementById('logoutBtn')?.addEventListener('click', () => handleLogout(loadBooks));

    document.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modalId = e.target.dataset.close;
            document.getElementById(modalId)?.classList.remove('active');
        });
    });

    // Login Submit
    document.getElementById('loginForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const pass = document.getElementById('loginPassword').value;
        handleLogin(email, pass, () => {
            loginModal?.classList.remove('active');
            loadBooks();
            loadMyLoans();
        });
    });

    // Register Submit
    document.getElementById('registerForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const fName = document.getElementById('regFirstName').value;
        const lName = document.getElementById('regLastName').value;
        const email = document.getElementById('regEmail').value;
        const pass = document.getElementById('regPassword').value;
        const role = document.getElementById('regRole').value;

        handleRegister(fName, lName, email, pass, role, (regEmail, regPass) => {
            registerModal?.classList.remove('active');
            loginModal?.classList.add('active');
            document.getElementById('loginEmail').value = regEmail;
            document.getElementById('loginPassword').value = regPass;
        });
    });

    // Book Search & Controls
    const bookSearchInput = document.getElementById('bookSearchInput');
    document.getElementById('bookSearchBtn')?.addEventListener('click', () => searchBooks(bookSearchInput.value));
    bookSearchInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchBooks(bookSearchInput.value);
    });

    document.getElementById('sortBySelect')?.addEventListener('change', (e) => {
        state.books.sortBy = e.target.value;
        loadBooks();
    });

    document.getElementById('sortDirSelect')?.addEventListener('change', (e) => {
        state.books.sortDir = e.target.value;
        loadBooks();
    });

    document.getElementById('prevPageBtn')?.addEventListener('click', () => {
        if (state.books.page > 0) {
            state.books.page--;
            loadBooks();
        }
    });

    document.getElementById('nextPageBtn')?.addEventListener('click', () => {
        if (state.books.page < state.books.totalPages - 1) {
            state.books.page++;
            loadBooks();
        }
    });

    document.getElementById('openAddBookBtn')?.addEventListener('click', () => addBookModal?.classList.add('active'));
    document.getElementById('addBookForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('bookTitle').value;
        const isbn = document.getElementById('bookIsbn').value;
        const authorId = document.getElementById('bookAuthorId').value;
        addBook(title, isbn, authorId, () => {
            addBookModal?.classList.remove('active');
            document.getElementById('addBookForm').reset();
        });
    });

    // Author Actions
    document.getElementById('openAddAuthorBtn')?.addEventListener('click', () => addAuthorModal?.classList.add('active'));
    document.getElementById('authorSearchBtn')?.addEventListener('click', () => loadAuthors(document.getElementById('authorSearchInput').value));
    document.getElementById('resetAuthorsBtn')?.addEventListener('click', () => {
        document.getElementById('authorSearchInput').value = '';
        loadAuthors();
    });
    document.getElementById('addAuthorForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const fName = document.getElementById('authorFirstName').value;
        const lName = document.getElementById('authorLastName').value;
        addAuthor(fName, lName, () => {
            addAuthorModal?.classList.remove('active');
            document.getElementById('addAuthorForm').reset();
        });
    });

    // Loan Actions
    document.getElementById('openCreateLoanBtn')?.addEventListener('click', () => createLoanModal?.classList.add('active'));
    document.getElementById('refreshLoansBtn')?.addEventListener('click', loadLoans);
    document.getElementById('createLoanForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const uId = document.getElementById('loanUserId').value;
        const bId = document.getElementById('loanBookId').value;
        createLoan(uId, bId, () => {
            createLoanModal?.classList.remove('active');
            document.getElementById('createLoanForm').reset();
        });
    });
}
