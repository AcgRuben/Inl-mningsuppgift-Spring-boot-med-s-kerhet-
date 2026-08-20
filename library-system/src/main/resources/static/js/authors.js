/**
 * Authors Module
 */
import { fetchApi } from './api.js';
import { showToast, escapeHtml } from './toast.js';

export async function loadAuthors(lastNameQuery = '') {
    const authorsGrid = document.getElementById('authorsGrid');
    if (!authorsGrid) return;
    authorsGrid.innerHTML = '<div class="loading-spinner">Hämtar författare...</div>';

    try {
        const endpoint = lastNameQuery 
            ? `/authors/search?lastName=${encodeURIComponent(lastNameQuery)}`
            : '/authors';

        const res = await fetchApi(endpoint);
        if (res.ok) {
            const authors = await res.json();
            renderAuthors(authors);
        } else {
            authorsGrid.innerHTML = '<p class="text-muted">Kunde inte hämta författare.</p>';
        }
    } catch (err) {
        authorsGrid.innerHTML = '<p class="text-muted">Inloggning krävs för att se författare.</p>';
    }
}

export function renderAuthors(authors) {
    const authorsGrid = document.getElementById('authorsGrid');
    if (!authorsGrid) return;

    if (authors.length === 0) {
        authorsGrid.innerHTML = '<p class="text-muted">Inga författare hittades.</p>';
        return;
    }

    authorsGrid.innerHTML = authors.map(author => `
        <div class="author-card">
            <div>
                <h3>${escapeHtml(author.firstName)} ${escapeHtml(author.lastName)}</h3>
                <p class="text-muted" style="font-size: 0.8rem; margin-top: 4px;">ID: ${author.id}</p>
            </div>
        </div>
    `).join('');
}

export async function addAuthor(firstName, lastName, onSuccess) {
    try {
        const res = await fetchApi('/authors', {
            method: 'POST',
            body: JSON.stringify({ firstName, lastName })
        });

        if (res.ok) {
            showToast('Författaren skapades!', 'success');
            if (onSuccess) onSuccess();
            loadAuthors();
        } else {
            showToast('Kunde inte skapa författare', 'error');
        }
    } catch (err) {
        showToast('Fel vid skapande av författare', 'error');
    }
}
