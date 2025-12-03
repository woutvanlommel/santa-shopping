// src/auth.ts
import { fetchUserByName } from './api';
import type { User } from './types';

const STORAGE_KEY = 'santa_shop_user'; // De sleutel voor in de browser opslag

type LoginSuccessCallback = (user: User) => void;

// NIEUW: Functie die checkt of we al ingelogd waren voor de refresh
export const checkExistingSession = (): User | null => {
    const storedData = sessionStorage.getItem(STORAGE_KEY);
    if (storedData) {
        try {
            return JSON.parse(storedData);
        } catch (e) {
            console.error("Fout bij uitlezen sessie", e);
            return null;
        }
    }
    return null;
};

export const setupLogin = (onLoginSuccess: LoginSuccessCallback) => {
    const loginForm = document.getElementById('login-form') as HTMLFormElement;
    const loginScreen = document.getElementById('login-screen') as HTMLDivElement;
    const errorMessage = document.getElementById('login-error') as HTMLParagraphElement;

    if (!loginForm) return;

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if(errorMessage) errorMessage.innerText = '';

        const formData = new FormData(loginForm);
        const username = formData.get('username') as string;
        const passwordInput = formData.get('password') as string;

        const user = await fetchUserByName(username);

        if (!user) {
            if(errorMessage) errorMessage.innerText = 'Gebruiker niet gevonden.';
            return;
        }

        if (user.password === passwordInput) {
            // SUCCESS!
            
            // STAP 1: Sla de gebruiker op in de sessie!
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));

            loginScreen.classList.add('hidden');
            onLoginSuccess(user);
        } else {
            if(errorMessage) errorMessage.innerText = 'Wachtwoord onjuist.';
        }
    });
};

export const setupLogout = () => {
    const logoutBtn = document.getElementById('logoutButton'); // Let op: ID matcht met je HTML
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // STAP 2: Verwijder de sessie bij uitloggen
            sessionStorage.removeItem(STORAGE_KEY);
            location.reload(); 
        });
    }
}