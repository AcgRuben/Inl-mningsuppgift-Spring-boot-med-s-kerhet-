/**
 * Profile & Personal Loans Module
 */
import { state } from './state.js';
import { fetchApi } from './api.js';
import { loadBooks } from './books.js';
import { showToast, escapeHtml } from './toast.js';

export async function loadMyLoans() {
    const myLoansList = document.getElementById('myLoansList');
    if (!myLoansList) return;

    if (!state.auth.isLoggedIn) {
        myLoansList.innerHTML = '<p class="text-muted">Logga in för att se dina aktiva lån.</p>';
        return;
    }

    try {
        const userRes = await fetchApi(`/users/${encodeURIComponent(state.auth.username)}`);
        if (userRes.ok) {
            const userObj = await userRes.json();
            const uId = userObj ? (userObj.id || userObj.userId) : null;
            if (uId) {
                state.auth.userId = uId;
                const loansRes = await fetchApi(`/users/${uId}/loans`);
                if (loansRes.ok) {
                    const loans = await loansRes.json();
                    renderMyLoans(loans);
                    return;
                }
            }
        }
        myLoansList.innerHTML = '<p class="text-muted">Inga registrerade lån hittades för detta konto.</p>';
    } catch (err) {
        myLoansList.innerHTML = '<p class="text-muted">Kunde inte hämta personliga lån.</p>';
    }
}

export function renderMyLoans(loans) {
    const myLoansList = document.getElementById('myLoansList');
    if (!myLoansList) return;

    if (!loans || loans.length === 0) {
        myLoansList.innerHTML = '<p class="text-muted">Du har inga aktiva lån för närvarande.</p>';
        return;
    }

    myLoansList.innerHTML = loans.map(loan => {
        const loanIdVal = loan.id || loan.loanId;
        const bookTitleVal = loan.bookTitle || (loan.book ? loan.book.title : null) || `Bok #${loan.bookId || (loan.book ? loan.book.id : 'N/A')}`;
        const isRet = loan.returned || loan.returnedDate != null;

        return `
        <div class="card" style="margin-bottom: 12px; padding: 16px; border: 1px solid var(--border-color);">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                <div>
                    <h4 style="font-size: 1rem; color: #fff; margin-bottom: 4px;">${escapeHtml(bookTitleVal)}</h4>
                    <div style="font-size: 0.82rem;" class="text-muted">
                        Låne-ID: <strong>#${loanIdVal}</strong> | Förfallodatum: <strong style="color: ${isRet ? 'var(--text-muted)' : 'var(--accent-secondary)'}">${loan.dueDate ? loan.dueDate.split('T')[0] : 'Ej angivet'}</strong>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="badge ${isRet ? 'success' : 'warning'}">
                        ${isRet ? 'Återlämnad' : 'Aktivt lån'}
                    </span>
                    ${!isRet ? `
                        <button class="btn btn-outline btn-sm" onclick="window.returnMyLoan(${loanIdVal})">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>
                            Återlämna
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="window.extendMyLoan(${loanIdVal})">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
                            Förläng (+7 dgr)
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `}).join('');
}

export async function returnMyLoan(loanId) {
    try {
        const res = await fetchApi(`/loans/${loanId}/return`, { method: 'PUT' });
        if (res.ok) {
            const msg = await res.text();
            showToast(msg || 'Boken återlämnad!', 'success');
            loadMyLoans();
            loadBooks();
        } else {
            const err = await res.text();
            showToast(err || 'Kunde inte återlämna boken', 'error');
        }
    } catch (e) {
        showToast('Fel vid återlämning av bok', 'error');
    }
}

export async function extendMyLoan(loanId) {
    try {
        const res = await fetchApi(`/loans/${loanId}/extend`, { method: 'PUT' });
        if (res.ok) {
            const msg = await res.text();
            showToast(msg || 'Lånet har förlängts med 7 dagar!', 'success');
            loadMyLoans();
        } else {
            const err = await res.text();
            showToast(err || 'Kunde inte förlänga lånet', 'error');
        }
    } catch (e) {
        showToast('Fel vid förlängning av lån', 'error');
    }
}
