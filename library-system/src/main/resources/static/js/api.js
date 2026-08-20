/**
 * HTTP API Client
 */
import { state } from './state.js';
import { showToast } from './toast.js';

export async function fetchApi(endpoint, options = {}) {
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
