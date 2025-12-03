// cart.ts
import type { Product } from './types';

// State (alleen lokaal beschikbaar in dit bestand, tenzij geëxporteerd)
let cart: Product[] = JSON.parse(localStorage.getItem('shopping-cart') || '[]');

// Interne hulpfuncties (niet geëxporteerd)
const saveCartToStorage = () => {
    localStorage.setItem('shopping-cart', JSON.stringify(cart));
    updateCartCount();
    renderCartPopup();
};

const updateCartCount = () => {
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        cartCountElement.innerText = cart.length.toString();
        if (cart.length > 0) {
            cartCountElement.classList.remove('hidden');
            cartCountElement.classList.add('flex');
        } else {
            cartCountElement.classList.add('hidden');
            cartCountElement.classList.remove('flex');
        }
    }
};

const renderCartPopup = () => {
    const cartList = document.getElementById('cartList');
    const cartTotalElement = document.getElementById('cartTotal');
    
    if (!cartList || !cartTotalElement) return;

    cartList.innerHTML = '';

    if (cart.length === 0) {
        cartList.innerHTML = '<p class="text-gray-500 text-sm italic">Je slee is nog leeg!</p>';
        cartTotalElement.innerText = '€ 0';
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    cartTotalElement.innerText = `€ ${total.toFixed(2)}`;

    cart.forEach((item, index) => {
        cartList.innerHTML += `
          <div class="flex justify-between items-center bg-gray-50 p-2 rounded">
              <div class="flex flex-col">
                  <span class="font-bold text-sm text-red-800">${item.name}</span>
                  <span class="text-xs text-green-500">€ ${item.price}</span>
              </div>
              <button data-index="${index}" class="remove-btn text-red-500 hover:text-red-700 font-bold px-2 cursor-pointer">&#128465;</button>
          </div>
        `;
    });

    // Event listeners voor verwijderen
    cartList.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget as HTMLButtonElement;
            const index = parseInt(target.getAttribute('data-index') || '-1');
            if (index >= 0) removeFromCart(index);
        });
    });
};

const removeFromCart = (index: number) => {
    cart.splice(index, 1);
    saveCartToStorage();
};

// --- EXPORTS (Functies die de buitenwereld mag gebruiken) ---

// Deze roepen we aan bij het opstarten
export const initCart = () => {
    updateCartCount(); // Zet de teller goed bij laden
    
    const cartIcon = document.getElementById('cartIcon');
    const cartDropdown = document.getElementById('cartDropdown');

    if (cartIcon && cartDropdown) {
        cartIcon.addEventListener('click', () => {
            cartDropdown.classList.toggle('hidden');
            if (!cartDropdown.classList.contains('hidden')) {
                renderCartPopup();
            }
        });
    }
};

// Deze functie wordt aangeroepen vanuit de productenlijst
export const addToCart = (product: Product) => {
    cart.push(product);
    saveCartToStorage();
};