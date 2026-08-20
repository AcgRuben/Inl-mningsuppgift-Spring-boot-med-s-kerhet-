/**
 * Authentication Module
 */
import { state, saveSession, clearSession } from './state.js';
import { fetchApi } from './api.js';
import { showToast } from './toast.js';

export async function handleLogin(username, password, onSuccess) {
    const credentials = btoa(`${username}:${password}`);

    try {
        // Validate credentials against /auth/user-page
        const userRes = await fetch('/auth/user-page', {
            headers: { 'Authorization': `Basic ${credentials}` }
        });

        if (!userRes.ok) {
            throw new Error('Invalid credentials');
        }

        state.auth.username = username;
        state.auth.password = password;
        state.auth.isLoggedIn = true;

        // Check ADMIN role
        const adminRes = await fetch('/auth/admin-page', {
            headers: { 'Authorization': `Basic ${credentials}` }
        });

        if (adminRes.ok) {
            state.auth.role = 'ROLE_ADMIN';
            showToast(`Välkommen tillbaka, ${username} (Admin)`, 'success');
        } else {
            state.auth.role = 'ROLE_USER';
            showToast(`Välkommen tillbaka, ${username}`, 'success');
        }

        // Cache user ID
        try {
            const userObjRes = await fetchApi(`/users/${encodeURIComponent(username)}`);
            if (userObjRes.ok) {
                const uData = await userObjRes.json();
                state.auth.userId = uData.id || uData.userId;
            }
        } catch (e) {}

        saveSession();
        updateAuthUI();
        if (onSuccess) onSuccess();
    } catch (err) {
        clearSession();
        updateAuthUI();
        showToast('Felaktigt användarnamn eller lösenord', 'error');
    }
}

export async function handleRegister(firstName, lastName, email, password, role, onSuccess) {
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
            if (onSuccess) onSuccess(email, password);
        } else {
            showToast(text || 'Registreringen misslyckades', 'error');
        }
    } catch (err) {
        showToast('Nätverksfel vid registrering', 'error');
    }
}

export function handleLogout(onLogout) {
    clearSession();
    updateAuthUI();
    showToast('Du har loggats ut', 'success');
    if (onLogout) onLogout();
}

export function updateAuthUI() {
    const authButtons = document.getElementById('authButtons');
    const userInfo = document.getElementById('userInfo');
    const displayUsername = document.getElementById('displayUsername');
    const displayRole = document.getElementById('displayRole');
    const userAvatar = document.getElementById('userAvatar');
    const profileEmail = document.getElementById('profileEmail');
    const profileRoleBadge = document.getElementById('profileRoleBadge');
    const myLoansList = document.getElementById('myLoansList');

    if (state.auth.isLoggedIn) {
        if (authButtons) authButtons.classList.add('hidden');
        if (userInfo) userInfo.classList.remove('hidden');
        if (displayUsername) displayUsername.textContent = state.auth.username;
        if (displayRole) {
            displayRole.textContent = state.auth.role === 'ROLE_ADMIN' ? 'ADMIN' : 'USER';
            if (state.auth.role === 'ROLE_ADMIN') {
                displayRole.classList.add('admin');
            } else {
                displayRole.classList.remove('admin');
            }
        }
        if (userAvatar) userAvatar.textContent = state.auth.username.charAt(0).toUpperCase();

        if (state.auth.role === 'ROLE_ADMIN') {
            document.body.classList.add('admin-mode');
        } else {
            document.body.classList.remove('admin-mode');
        }

        if (profileEmail) profileEmail.textContent = state.auth.username;
        if (profileRoleBadge) {
            profileRoleBadge.textContent = state.auth.role;
            profileRoleBadge.className = `badge ${state.auth.role === 'ROLE_ADMIN' ? 'admin' : 'user'}`;
        }
    } else {
        if (authButtons) authButtons.classList.remove('hidden');
        if (userInfo) userInfo.classList.add('hidden');
        document.body.classList.remove('admin-mode');

        if (profileEmail) profileEmail.textContent = 'Ej inloggad';
        if (profileRoleBadge) {
            profileRoleBadge.textContent = 'EJ INLOGGAD';
            profileRoleBadge.className = 'badge';
        }
        if (myLoansList) myLoansList.innerHTML = '<p class="text-muted">Logga in för att se dina lån.</p>';
    }
}
