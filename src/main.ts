import './style.css';

interface Product {
  category: string;
  description: string;
  id: string;
  name: string;
  price: number;
  stock: number;
}

async function fetchProducts(): Promise<Product[]> {
  const url = 'http://localhost:3000/products';
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
    const data = await res.json();
    return data || []; 
  } catch (err) {
    console.error('Fout bij het ophalen producten', err);
    return []; 
  }
}

async function init() {
  const products = await fetchProducts();

  // --- WINKELWAGEN LOGICA ---
  let cart: Product[] = JSON.parse(localStorage.getItem('shopping-cart') || '[]');

  // 1. Sla op en update ALLES (teller én popup)
  const saveCartToStorage = () => {
      localStorage.setItem('shopping-cart', JSON.stringify(cart));
      updateCartCount();
      renderCartPopup(); // Zorg dat de lijst direct update als je iets toevoegt/verwijdert
  };

  // 2. Update het rode bolletje
  const updateCartCount = () => {
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        cartCountElement.innerText = cart.length.toString();
        // Toggle visibility class in plaats van inline style display
        if (cart.length > 0) {
            cartCountElement.classList.remove('hidden');
            cartCountElement.classList.add('flex');
        } else {
            cartCountElement.classList.add('hidden');
            cartCountElement.classList.remove('flex');
        }
    }
  };

  // 3. Toon de items in de popup
  const renderCartPopup = () => {
      const cartList = document.getElementById('cartList');
      const cartTotalElement = document.getElementById('cartTotal');
      
      if (!cartList || !cartTotalElement) return;

      // Maak de lijst eerst leeg
      cartList.innerHTML = '';

      if (cart.length === 0) {
          cartList.innerHTML = '<p class="text-gray-500 text-sm italic">Je slee is nog leeg!</p>';
          cartTotalElement.innerText = '€ 0';
          return;
      }

      // Bereken totaalprijs
      const total = cart.reduce((sum, item) => sum + item.price, 0);
      cartTotalElement.innerText = `€ ${total.toFixed(2)}`;

      // Genereer HTML voor elk item
      // We gebruiken de index (i) om te weten welk item we moeten verwijderen
      cart.forEach((item, index) => {
          cartList.innerHTML += `
            <div class="flex justify-between items-center bg-gray-50 p-2 rounded">
                <div class="flex flex-col">
                    <span class="font-bold text-sm text-red-800">${item.name}</span>
                    <span class="text-xs text-green-500">€ ${item.price}</span>
                </div>
                <button 
                    data-index="${index}" 
                    class="remove-btn text-red-500 hover:text-red-700 font-bold px-2 cursor-pointer">
                    &#128465; </button>
            </div>
          `;
      });

      // Event listeners toevoegen aan de verwijder knoppen
      const removeButtons = cartList.querySelectorAll('.remove-btn');
      removeButtons.forEach(btn => {
          btn.addEventListener('click', (e) => {
              const target = e.currentTarget as HTMLButtonElement; // currentTarget is veiliger bij icoontjes
              const indexToRemove = parseInt(target.getAttribute('data-index') || '-1');
              if (indexToRemove >= 0) {
                  removeFromCart(indexToRemove);
              }
          });
      });
  };

  // 4. Verwijder item (op basis van index in de array)
  const removeFromCart = (index: number) => {
      // splice verwijdert 1 item op de specifieke index
      cart.splice(index, 1);
      saveCartToStorage(); // Slaat op en rendert opnieuw
  };

  // 5. Toggle de Popup (Open/Dicht)
  const setupCartToggle = () => {
      const cartIcon = document.getElementById('cartIcon');
      const cartDropdown = document.getElementById('cartDropdown');

      if (cartIcon && cartDropdown) {
          cartIcon.addEventListener('click', () => {
              // Toggle de 'hidden' class
              cartDropdown.classList.toggle('hidden');
              
              // Als we hem openen, renderen we voor de zekerheid de laatste stand
              if (!cartDropdown.classList.contains('hidden')) {
                  renderCartPopup();
              }
          });
      }
  };



  // 3. Voeg product toe aan array
  const addToCart = (productId: string) => {
      // Zoek het juiste product in de originele lijst
      const productToAdd = products.find(p => p.id === productId);
      
      if (productToAdd) {
          cart.push(productToAdd);
          saveCartToStorage();
      }
  };

  // --------------------------------

  const displayProducts = (productList: Product[]) => {
    const productsDisplay = document.getElementById('products') as HTMLDivElement;

    if (!productList || productList.length === 0) {
      productsDisplay.innerHTML = '<p class="p-4 text-gray-500">Geen producten gevonden.</p>';
      return;
    }

    // --- AANGEPAST: DATA-ID TOEGEVOEGD AAN BUTTON ---
    // Ik heb data-id="${product.id}" toegevoegd en een class 'add-to-cart-btn'
    const productsHTML = productList.map((product) => `
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
    
    productsDisplay.innerHTML = productsHTML;

    // --- NIEUW: EVENT LISTENER TOEVOEGEN NA RENDEREN ---
    // We moeten dit doen NADAT de HTML in de pagina is gezet
    setupAddToCartButtons();
  };

  // --- NIEUW: EVENT DELEGATION OF LOOP ---
  const setupAddToCartButtons = () => {
      // Selecteer alle knoppen die we net hebben aangemaakt
      const buttons = document.querySelectorAll('.add-to-cart-btn');

      buttons.forEach(btn => {
          btn.addEventListener('click', (e) => {
              const target = e.target as HTMLButtonElement;
              // Haal het ID op uit het data-attribuut
              const productId = target.getAttribute('data-id');
              
              if (productId) {
                  addToCart(productId);
              }
          });
      });
  };

  const setupSearch = () => {
    const searchInput = document.getElementById('searchInput') as HTMLInputElement;
    if (!searchInput) return;

    searchInput.addEventListener('input', (e: Event) => {
        const target = e.target as HTMLInputElement;
        const searchTerm = target.value.toLowerCase();

        const filteredProducts = products.filter(product => {
            return product.name.toLowerCase().includes(searchTerm)
        });

        displayProducts(filteredProducts);
    });
  };

  const setupCat = () => {
    const catInput = document.getElementById('categorySelect') as HTMLSelectElement;
    if (!catInput) return;

    catInput.addEventListener('change', (e: Event) => {
        const target = e.target as HTMLSelectElement;
        const selectedCategory = target.value; 

        if (selectedCategory === '--Select category--' || selectedCategory === 'alles') {
            displayProducts(products);
        } else {
            const filtered = products.filter(product => product.category === selectedCategory);
            displayProducts(filtered);
        }
    });
  }

  // Initialisatie volgorde
  displayProducts(products);
  setupSearch();
  setupCat();
  
  // Update de teller direct bij het laden van de pagina (voor als je refreshed)
  updateCartCount();
  setupCartToggle();
  renderCartPopup();
}

init();