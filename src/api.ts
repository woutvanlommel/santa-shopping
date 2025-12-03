import type { Product, User } from './types';

export const fetchProducts = async (): Promise<Product[]> => {
    // ... bestaande code ...
    const response = await fetch('http://localhost:3000/products');
    return response.json();
};

// NIEUW: Haal user op basis van naam
export const fetchUserByName = async (name: string): Promise<User | null> => {
    try {
        const response = await fetch(`http://localhost:3000/users?name=${name}`);
        if (!response.ok) throw new Error('Server error');
        
        const users: User[] = await response.json();
        return users.length > 0 ? users[0] : null; 
    } catch (error) {
        console.error(error);
        return null;
    }
};