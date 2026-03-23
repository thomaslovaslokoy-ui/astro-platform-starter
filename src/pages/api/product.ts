import type { APIRoute } from 'astro';
import { getStore } from '@netlify/blobs';

export const prerender = false;

export const GET: APIRoute = async (context) => {
    const key = new URL(context.url).searchParams.get('key');
    if (!key) {
        return new Response('Bad Request', { status: 400 });
    }
    const store = getStore('products');
    const product = await store.get(key, { type: 'json' });
    return new Response(JSON.stringify({ product }));
};
