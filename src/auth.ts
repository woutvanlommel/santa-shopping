// src/auth.ts
import { fetchUserByName } from './api';
import type { User } from './types';

const STORAGE_KEY = 'santa_shop_user'; 

type LoginSuccessCallback = (user: User) => void;

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

// DEZE FUNCTIE REGELT HET OOGJE
export const viewPassword = () => {
    const input = document.querySelector('input[name="password"]') as HTMLInputElement;
    const btn = document.getElementById('viewPassword') as HTMLButtonElement;

    // 1. Guard clause: als iets mist, stop direct. Scheelt haakjes {}
    if (!input || !btn) return;

    btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // 2. Check de status één keer
        const isHidden = input.type === 'password';

        // 3. Ternary operators (korte if/else):  voorwaarde ? waar : niet-waar
        input.type = isHidden ? 'text' : 'password';
        
        btn.innerHTML = isHidden 
            ? '<i class="fa-solid fa-eye-slash"></i>' 
            : '<i class="fa-solid fa-eye"></i>';
    });
};

export const setupLogin = (onLoginSuccess: LoginSuccessCallback) => {
    const loginForm = document.getElementById('login-form') as HTMLFormElement;
    const loginScreen = document.getElementById('login-screen') as HTMLDivElement;
    const errorMessage = document.getElementById('login-error') as HTMLParagraphElement;

    if (!loginForm) return;

    // HIER HEBBEN WE DE DUBBELE CODE VERWIJDERD

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Voorkom pagina reload

        const formData = new FormData(loginForm);
        const passwordInput = formData.get('password') as string;
        const username = formData.get('username') as string;
        
        if(errorMessage) errorMessage.innerText = '';

        const user = await fetchUserByName(username);

        if (!user) {
            if(errorMessage) errorMessage.innerText = 'Gebruiker niet gevonden.';
            return;
        }

        if (user.password === passwordInput) {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
            loginScreen.classList.add('hidden');
            onLoginSuccess(user);
        } else {
            if(errorMessage) errorMessage.innerText = 'Wachtwoord onjuist.';
        }
    });
};

export const setupLogout = () => {
    const logoutBtn = document.getElementById('logoutButton'); 
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem(STORAGE_KEY);
            location.reload(); 
        });
    }
}