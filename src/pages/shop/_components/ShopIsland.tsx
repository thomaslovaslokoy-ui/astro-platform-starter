import { useState, useEffect } from 'react';
import type { ProductProps, CartItem } from '../../../types';
import ProductCard from './ProductCard';
import Cart from './Cart';

const SEED_PRODUCTS: ProductProps[] = [
    {
        id: 'wireless-headphones',
        name: 'Wireless Headphones',
        description: 'Premium sound quality with active noise cancellation and 30-hour battery life.',
        price: 4999,
        emoji: '🎧',
        category: 'Electronics',
        inventory: 12
    },
    {
        id: 'javascript-cookbook',
        name: 'JavaScript Cookbook',
        description: 'Over 300 recipes for solving real-world JavaScript problems. Updated for ES2024.',
        price: 2499,
        emoji: '📚',
        category: 'Books',
        inventory: 35
    },
    {
        id: 'pour-over-coffee-set',
        name: 'Pour-Over Coffee Set',
        description: 'Handcrafted ceramic dripper with a glass carafe. Brew the perfect cup every morning.',
        price: 3499,
        emoji: '☕',
        category: 'Kitchen',
        inventory: 8
    },
    {
        id: 'soy-candle-collection',
        name: 'Soy Candle Collection',
        description: 'Set of 3 hand-poured soy candles in calming scents: lavender, cedar, and vanilla.',
        price: 1999,
        emoji: '🕯️',
        category: 'Home',
        inventory: 20
    },
    {
        id: 'logo-cap',
        name: 'Logo Cap',
        description: 'Structured six-panel cap with an embroidered logo. One size fits most.',
        price: 1499,
        emoji: '🧢',
        category: 'Apparel',
        inventory: 50
    },
    {
        id: 'retro-controller',
        name: 'Retro Controller',
        description: 'USB-C gamepad with tactile d-pad and bumpers. Compatible with PC, Mac, and mobile.',
        price: 3999,
        emoji: '🎮',
        category: 'Gaming',
        inventory: 15
    }
];

export default function ShopIsland() {
    const [products, setProducts] = useState<ProductProps[]>([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [showCart, setShowCart] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);

    const fetchProducts = async () => {
        const res = await fetch('/api/products');
        const data = await res.json();
        return (data.products as ProductProps[]) ?? [];
    };

    const seedProducts = async () => {
        await Promise.all(
            SEED_PRODUCTS.map((p) =>
                fetch('/api/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(p)
                })
            )
        );
    };

    useEffect(() => {
        (async () => {
            setLoading(true);
            let fetched = await fetchProducts();
            if (fetched.length === 0) {
                await seedProducts();
                fetched = await fetchProducts();
            }
            setProducts(fetched);
            setLoading(false);
        })();
    }, []);

    const addToCart = (product: ProductProps) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.product.id === product.id);
            if (existing) {
                return prev.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
            }
            return [...prev, { product, quantity: 1 }];
        });
        setShowCart(true);
    };

    const updateQty = (id: string, qty: number) => {
        if (qty <= 0) {
            removeFromCart(id);
        } else {
            setCart((prev) => prev.map((item) => (item.product.id === id ? { ...item, quantity: qty } : item)));
        }
    };

    const removeFromCart = (id: string) => {
        setCart((prev) => prev.filter((item) => item.product.id !== id));
    };

    const handleCheckout = (_name: string, _email: string) => {
        setOrderPlaced(true);
    };

    const handleCloseCart = () => {
        setShowCart(false);
        if (orderPlaced) {
            setCart([]);
            setOrderPlaced(false);
        }
    };

    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <>
            {/* Cart button */}
            <div className="flex justify-end mb-8">
                <button
                    className="btn relative"
                    onClick={() => setShowCart(true)}
                    style={{ '--btn-py': '0.625rem', '--btn-px': '1.125rem' } as React.CSSProperties}
                >
                    🛒 Cart
                    {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full bg-complementary text-white text-xs font-bold">
                            {cartCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Product grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-white/10 rounded-lg aspect-[3/4] animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                    ))}
                </div>
            )}

            {/* Cart sidebar */}
            {showCart && (
                <Cart
                    items={cart}
                    onUpdateQty={updateQty}
                    onRemove={removeFromCart}
                    onClose={handleCloseCart}
                    onCheckout={handleCheckout}
                    orderPlaced={orderPlaced}
                />
            )}
        </>
    );
}
