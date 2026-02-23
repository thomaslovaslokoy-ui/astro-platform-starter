import { useState } from 'react';
import type { CartItem } from '../../../types';

interface Props {
    items: CartItem[];
    onUpdateQty: (id: string, qty: number) => void;
    onRemove: (id: string) => void;
    onClose: () => void;
    onCheckout: (name: string, email: string) => void;
    orderPlaced: boolean;
}

export default function Cart({ items, onUpdateQty, onRemove, onClose, onCheckout, orderPlaced }: Props) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const dollars = (cents: number) => (cents / 100).toFixed(2);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && email.trim()) {
            onCheckout(name, email);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            {/* Panel */}
            <div className="relative flex flex-col w-full max-w-md bg-white shadow-xl h-full overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-gray-900 text-xl font-bold">Your Cart</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-900 transition text-2xl leading-none" aria-label="Close cart">
                        ×
                    </button>
                </div>

                {orderPlaced ? (
                    <div className="flex flex-col items-center justify-center flex-1 gap-4 p-8 text-center">
                        <div className="text-6xl">🎉</div>
                        <h3 className="text-gray-900 text-2xl font-bold">Order placed!</h3>
                        <p className="text-gray-500">Thanks, {name}! We'll send a confirmation to {email}.</p>
                        <button className="btn btn-lg mt-4" onClick={onClose}>
                            Continue shopping
                        </button>
                    </div>
                ) : (
                    <>
                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center flex-1 gap-3 p-8 text-center">
                                <div className="text-5xl">🛒</div>
                                <p className="text-gray-500">Your cart is empty.</p>
                            </div>
                        ) : (
                            <>
                                <ul className="flex-1 divide-y divide-gray-100">
                                    {items.map(({ product, quantity }) => (
                                        <li key={product.id} className="flex items-start gap-3 p-4">
                                            <span className="text-3xl">{product.emoji}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-gray-900 font-medium text-sm truncate">{product.name}</p>
                                                <p className="text-gray-500 text-sm">${dollars(product.price)} each</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <button
                                                        className="w-7 h-7 flex items-center justify-center rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition text-base font-bold"
                                                        onClick={() => onUpdateQty(product.id, quantity - 1)}
                                                        aria-label="Decrease quantity"
                                                    >
                                                        −
                                                    </button>
                                                    <span className="text-gray-900 text-sm w-5 text-center">{quantity}</span>
                                                    <button
                                                        className="w-7 h-7 flex items-center justify-center rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition text-base font-bold"
                                                        onClick={() => onUpdateQty(product.id, quantity + 1)}
                                                        aria-label="Increase quantity"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-gray-900 font-semibold text-sm">${dollars(product.price * quantity)}</p>
                                                <button className="text-gray-400 hover:text-red-500 transition text-xs mt-1" onClick={() => onRemove(product.id)}>
                                                    Remove
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                <div className="border-t border-gray-200 p-4">
                                    <div className="flex justify-between text-gray-900 font-bold text-base mb-4">
                                        <span>Subtotal</span>
                                        <span>${dollars(subtotal)}</span>
                                    </div>
                                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                                        <input
                                            type="text"
                                            placeholder="Your name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                            className="w-full px-3 py-2 rounded border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                        />
                                        <input
                                            type="email"
                                            placeholder="Email address"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full px-3 py-2 rounded border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                        />
                                        <button type="submit" className="btn w-full justify-center" style={{ '--btn-py': '0.75rem' } as React.CSSProperties}>
                                            Place order
                                        </button>
                                    </form>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
