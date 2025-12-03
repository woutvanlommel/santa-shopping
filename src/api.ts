import type { Product } from './types';
  const url = 'http://localhost:3000/products';
export async function fetchProducts(): Promise<Product[]> {
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