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
    // 1. We gebruiken nu getElementById, dat is veiliger en sneller omdat je ID's hebt in je HTML
    const input = document.getElementById('passwordInput') as HTMLInputElement;
    const btn = document.getElementById('viewPassword') as HTMLButtonElement;

    // 2. Guard clause: Als de knoppen niet bestaan, stop de functie (voorkomt crashes)
    if (!input || !btn) {
        console.warn("ViewPassword elementen niet gevonden in de HTML");
        return;
    }

    // 3. Verwijder oude listeners om dubbele kliks te voorkomen (optioneel maar netjes)
    const newBtn = btn.cloneNode(true) as HTMLButtonElement;
    btn.parentNode?.replaceChild(newBtn, btn);

    newBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Zeker weten dat het geen form submit doet
        
        const isHidden = input.type === 'password';
        
        input.type = isHidden ? 'text' : 'password';
        
        // Update het icoontje
        newBtn.innerHTML = isHidden 
            ? '<i class="fa-solid fa-eye-slash"></i>' 
            : '<i class="fa-solid fa-eye"></i>';
    });
};

export const setupLogin = (onLoginSuccess: LoginSuccessCallback) => {
    const loginForm = document.getElementById('login-form') as HTMLFormElement;
    const loginScreen = document.getElementById('login-screen') as HTMLDivElement;
    const errorMessage = document.getElementById('login-error') as HTMLParagraphElement;
    console.log("Setting up login form");

    if (!loginForm) return;

    // HIER HEBBEN WE DE DUBBELE CODE VERWIJDERD

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Voorkom pagina reload
        console.log("Login data ophalen");

        const formData = new FormData(loginForm);
        const passwordInput = formData.get('password') as string;
        const name = formData.get('name') as string;
        
        if(errorMessage) errorMessage.innerText = '';

    try {

        const user = await fetchUserByName(name);
        console.log("Gevonden user:", user);
        if (!user) {
            if(errorMessage) errorMessage.innerText = 'Gebruiker niet gevonden.';
            return;
        }

        if (user.password === passwordInput) {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
            if (loginScreen){
                loginScreen.classList.add('hidden');
            }
            onLoginSuccess(user);
        } else {
            if(errorMessage) errorMessage.innerText = 'Wachtwoord onjuist.';
        }
    } catch (error) {
        console.error("Fout bij inloggen:", error);
        if(errorMessage) errorMessage.innerText = 'Er is een fout opgetreden. Probeer het later opnieuw.';
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