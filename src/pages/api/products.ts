import type { APIRoute } from 'astro';
import { getStore } from '@netlify/blobs';
import type { ProductProps } from '../../types';

export const prerender = false;

export const GET: APIRoute = async () => {
    try {
        const store = getStore({ name: 'products', consistency: 'strong' });
        const { blobs } = await store.list();
        const products = await Promise.all(blobs.map(({ key }) => store.get(key, { type: 'json' }) as Promise<ProductProps>));
        return new Response(JSON.stringify({ products }));
    } catch (e) {
        console.error(e);
        return new Response(JSON.stringify({ products: [], error: 'Failed listing products' }));
    }
};

export const POST: APIRoute = async ({ request }) => {
    const product: ProductProps = await request.json();
    const store = getStore('products');
    await store.setJSON(product.id, product);
    return new Response(JSON.stringify({ message: `Saved product "${product.name}"` }));
};
