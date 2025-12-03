// cart.ts
import type { Product, cartItem } from './types';

// State (alleen lokaal beschikbaar in dit bestand, tenzij geëxporteerd)
// State: We slaan nu CartItems op in plaats van losse Producten
let cart: cartItem[] = JSON.parse(localStorage.getItem('shopping-cart') || '[]');

const saveCartToStorage = () => {
    localStorage.setItem('shopping-cart', JSON.stringify(cart));
    updateCartCount();
    renderCartPopup();
};

const updateCartCount = () => {
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        // Totaal aantal items is nu de som van alle quantities
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        cartCountElement.innerText = totalItems.toString();
        
        if (totalItems > 0) {
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

    // Totaalprijs berekenen: Prijs * Aantal
    const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    cartTotalElement.innerText = `€ ${total.toFixed(2)}`;

    cart.forEach((item, index) => {
        // We tonen nu ook de quantity
        // item.product is nu het originele product object
        cartList.innerHTML += `
          <div class="flex justify-between items-center bg-gray-50 p-2 rounded border-b border-gray-100">
              <div class="flex flex-col">
                  <span class="font-bold text-sm text-red-800">${item.product.name}</span>
                  <div class="flex items-center gap-2 text-xs">
                    <span class="text-gray-600 font-bold">x${item.quantity}</span>
                    <span class="text-green-500">€ ${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
              </div>
              
              <div class="flex items-center gap-2">
                  <button 
                    data-index="${index}" 
                    class="add-btn text-green-600 hover:text-green-800 font-bold px-1 cursor-pointer">
                    +
                  </button>
                  
                  <button 
                    data-index="${index}" 
                    class="remove-btn text-red-500 hover:text-red-700 font-bold px-1 cursor-pointer">
                    ${item.quantity > 1 ? '-' : '&#128465;'} 
                  </button>
              </div>
          </div>
        `;
    });

    // Event listeners voor verwijderen (min of prullenbak)
    cartList.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget as HTMLButtonElement;
            const index = parseInt(target.getAttribute('data-index') || '-1');
            if (index >= 0) removeOneFromCart(index);
        });
    });

    // Event listeners voor toevoegen (plusje in de cart)
    cartList.querySelectorAll('.add-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget as HTMLButtonElement;
            const index = parseInt(target.getAttribute('data-index') || '-1');
            if (index >= 0) {
                // We hergebruiken addToCart, maar we hebben alleen het CartItem. 
                // We sturen het product erin.
                addToCart(cart[index].product); 
            }
        });
    });
};

// AANGEPAST: Verwijder 1 stuk, of het hele item als het de laatste is
const removeOneFromCart = (index: number) => {
    if (cart[index].quantity > 1) {
        cart[index].quantity--;
    } else {
        cart.splice(index, 1);
    }
    saveCartToStorage();
};

// --- EXPORTS ---

export const initCart = () => {
    // BELANGRIJK: Omdat we de datastructuur hebben veranderd, 
    // kan de oude localStorage data voor errors zorgen.
    // Voor de zekerheid checken we of de data klopt, anders resetten we.
    if (cart.length > 0 && !cart[0].hasOwnProperty('quantity')) {
        console.warn('Oude cart data gevonden, resetten...');
        cart = [];
        localStorage.removeItem('shopping-cart');
    }

    updateCartCount(); 
    
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

// AANGEPAST: Check of hij al bestaat
export const addToCart = (product: Product) => {
    // 1. Zoek of we dit product al hebben (op basis van ID)
    const existingItem = cart.find(item => item.product.id === product.id);

    if (existingItem) {
        // 2. Ja? Verhoog aantal
        existingItem.quantity++;
    } else {
        // 3. Nee? Nieuw item met quantity 1
        cart.push({
            product: product,
            quantity: 1
        });
    }
    alert(`Toegevoegd aan je slee: ${product.name}`);
    
    saveCartToStorage();
};