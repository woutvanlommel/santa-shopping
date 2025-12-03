// products.ts
import type { Product } from './types';

// We definiëren een type voor de functie die we verwachten
type AddToCartCallback = (product: Product) => void;

let allProducts: Product[] = []; // Lokale kopie voor filteren

const renderList = (productList: Product[], onAddClick: AddToCartCallback) => {
    const productsDisplay = document.getElementById('products') as HTMLDivElement;
    
    if (!productList || productList.length === 0) {
        productsDisplay.innerHTML = '<p class="p-4 text-gray-500">Geen producten gevonden.</p>';
        return;
    }

    productsDisplay.innerHTML = productList.map((product) => `
        <div class="flex flex-col gap-4 justify-start items-start border p-4 rounded-lg shadow bg-white h-full">
          <p class="text-xs font-bold text-white uppercase bg-red-300 border-2 border-red-600 px-2 py-1 rounded-lg">${product.category}</p>
          <div class="flex flex-col justify-start items-start gap-2 flex-grow">
            <h3 class="text-xl font-bold">${product.name}</h3>
            <p>${product.description}</p>
          </div>
          <div>
            <h4 class="text-green-600 font-bold">€ ${product.price}</h4>
          </div>
          <button 
            data-id="${product.id}"
            class="add-to-cart-btn bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500 cursor-pointer w-full mt-auto">
            Add Product to Sleigh
          </button>
        </div>
    `).join('');

    // Event listeners koppelen
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.target as HTMLButtonElement;
            const id = target.getAttribute('data-id');
            const product = allProducts.find(p => p.id === id); // Zoek in de opgeslagen lijst
            
            if (product) {
                onAddClick(product); // Roep de callback aan
            }
        });
    });
};

// --- EXPORTS ---

export const setupProducts = (products: Product[], onAddClick: AddToCartCallback) => {
    allProducts = products; // Sla op voor intern gebruik (zoeken/filteren)
    
    // Initiele render
    renderList(allProducts, onAddClick);

    // Setup Search
    const searchInput = document.getElementById('searchInput') as HTMLInputElement;
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = (e.target as HTMLInputElement).value.toLowerCase();
            const filtered = allProducts.filter(p => p.name.toLowerCase().includes(term));
            renderList(filtered, onAddClick);
        });
    }

    // Setup Categorie
    const catInput = document.getElementById('categorySelect') as HTMLSelectElement;
    if (catInput) {
        catInput.addEventListener('change', (e) => {
            const cat = (e.target as HTMLSelectElement).value;
            if (cat === '--Select category--' || cat === 'alles') {
                renderList(allProducts, onAddClick);
            } else {
                const filtered = allProducts.filter(p => p.category === cat);
                renderList(filtered, onAddClick);
            }
        });
    }
};