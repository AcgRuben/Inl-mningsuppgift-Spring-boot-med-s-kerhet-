/**
 * Admin Loans Management Module
 */
import { state } from './state.js';
import { fetchApi } from './api.js';
import { showToast } from './toast.js';

export async function loadLoans() {
    const loansTableBody = document.getElementById('loansTableBody');
    if (!loansTableBody) return;

    if (state.auth.role !== 'ROLE_ADMIN') {
        loansTableBody.innerHTML = '<tr><td colspan="7" class="text-center">Endast administratörer har tillgång till låneöversikten.</td></tr>';
        return;
    }

    loansTableBody.innerHTML = '<tr><td colspan="7" class="text-center">Hämtar alla lån...</td></tr>';

    try {
        const res = await fetchApi('/loans');
        if (res.ok) {
            const loans = await res.json();
            renderLoansTable(loans);
        } else {
            loansTableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Kunde inte hämta lån.</td></tr>';
        }
    } catch (err) {
        loansTableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Åtkomst nekad.</td></tr>';
    }
}

export function renderLoansTable(loans) {
    const loansTableBody = document.getElementById('loansTableBody');
    if (!loansTableBody) return;

    if (loans.length === 0) {
        loansTableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Inga aktiva lån hittades i systemet.</td></tr>';
        return;
    }

    loansTableBody.innerHTML = loans.map(loan => {
        const loanIdVal = loan.id || loan.loanId;
        const uId = loan.userId || (loan.user ? loan.user.id : 'N/A');
        const bId = loan.bookId || (loan.book ? loan.book.id : 'N/A');
        const isRet = loan.returned || loan.returnedDate != null;

        return `
        <tr>
            <td><strong>#${loanIdVal}</strong></td>
            <td>User #${uId}</td>
            <td>Book #${bId}</td>
            <td>${loan.borrowedDate ? loan.borrowedDate.split('T')[0] : 'N/A'}</td>
            <td>${loan.dueDate ? loan.dueDate.split('T')[0] : 'N/A'}</td>
            <td>
                <span class="badge ${isRet ? 'success' : 'warning'}">
                    ${isRet ? 'Ja' : 'Nej (Aktivt)'}
                </span>
            </td>
            <td>
                ${!isRet ? `
                    <button class="btn btn-sm btn-outline" onclick="window.returnLoan(${loanIdVal})">Återlämna</button>
                    <button class="btn btn-sm btn-secondary" onclick="window.extendLoan(${loanIdVal})">Förläng</button>
                ` : '<span class="text-muted">-</span>'}
            </td>
        </tr>
    `}).join('');
}

export async function createLoan(userId, bookId, onSuccess) {
    try {
        const res = await fetchApi(`/loans?userId=${userId}&bookId=${bookId}`, {
            method: 'POST'
        });

        if (res.ok) {
            const text = await res.text();
            showToast(text || 'Lånet har skapats!', 'success');
            if (onSuccess) onSuccess();
            loadLoans();
        } else {
            showToast('Kunde inte skapa lån', 'error');
        }
    } catch (err) {
        showToast('Fel vid skapande av lån', 'error');
    }
}

export async function returnLoan(loanId) {
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

export async function extendLoan(loanId) {
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
