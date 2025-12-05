// src/main.ts
import './style.css';
import { fetchProducts } from './api';
import { initCart, addToCart } from './cart';
import { setupProducts } from './products';
import { setupLogin, setupLogout, checkExistingSession, viewPassword } from './auth'; // Importeer de nieuwe functie
import type { User } from './types';
import { xMasDays } from './xmasDays';

const appContainer = document.getElementById('shop-app') as HTMLDivElement;
const loginScreen = document.getElementById('login-screen') as HTMLDivElement;
const welcomeMessage = document.getElementById('welcome-message') as HTMLHeadingElement;
const userLoggedName = document.getElementById('userLoggedName') as HTMLSpanElement;

// Dit is de functie die de app opbouwt (wordt hergebruikt)
async function startShopApp(user: User) {
    console.log('App wordt gestart voor:', user.name);

    // 1. UI Updates
    loginScreen.classList.add('hidden'); // Zeker weten dat login weg is
    appContainer.classList.remove('hidden');
    
    if (welcomeMessage) {
        welcomeMessage.textContent = `Welkom terug, ${user.name}!`;
    };

    if (userLoggedName) {
        userLoggedName.innerText = user.name;
    }

    // 2. Data ophalen & Modules starten
    const products = await fetchProducts();
    
    initCart();
    
    setupProducts(products, (product) => {
        addToCart(product);
    });

    xMasDays();
    setupLogout();
}

// --- INITIALISATIE LOGICA ---

// Stap 1: Check of er al een sessie is (vanuit een refresh)
const existingUser = checkExistingSession();

if (existingUser) {
    // JA: Sla login over en start direct
    startShopApp(existingUser);
} else {
    viewPassword();
    // NEE: Wacht tot de gebruiker het formulier invult
    setupLogin((user) => {
        startShopApp(user);
    });
}