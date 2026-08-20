/**
 * Central Application State
 */

export const state = {
    auth: {
        username: '',
        password: '',
        userId: null,
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

export function restoreSession() {
    const savedAuth = sessionStorage.getItem('library_auth');
    if (savedAuth) {
        try {
            const parsed = JSON.parse(savedAuth);
            state.auth = parsed;
        } catch (e) {
            sessionStorage.removeItem('library_auth');
        }
    }
}

export function saveSession() {
    sessionStorage.setItem('library_auth', JSON.stringify(state.auth));
}

export function clearSession() {
    state.auth = { username: '', password: '', userId: null, role: 'GUEST', isLoggedIn: false };
    sessionStorage.removeItem('library_auth');
}
