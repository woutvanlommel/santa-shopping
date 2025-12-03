// main.ts
import './style.css';
import { fetchProducts } from './api';
import { initCart, addToCart } from './cart'; // Importeer wat we nodig hebben
import { setupProducts } from './products';

async function init() {
  // 1. Haal data op
  const products = await fetchProducts();

  // 2. Initialiseer de winkelwagen (check localStorage, event listeners op icoon)
  initCart();

  // 3. Initialiseer de producten
  // We geven de lijst mee EN de functie die uitgevoerd moet worden als er geklikt wordt
  setupProducts(products, (product) => {
      addToCart(product);
  });
}

init();