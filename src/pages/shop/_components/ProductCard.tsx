import type { ProductProps } from '../../../types';

interface Props {
    product: ProductProps;
    onAddToCart: (product: ProductProps) => void;
}

export default function ProductCard({ product, onAddToCart }: Props) {
    const dollars = (product.price / 100).toFixed(2);

    return (
        <div className="flex flex-col bg-white rounded-lg overflow-hidden">
            <div className="flex items-center justify-center text-6xl bg-gray-50 aspect-square p-6">{product.emoji}</div>
            <div className="flex flex-col flex-1 p-4 gap-3">
                <div>
                    <span className="text-xs font-medium text-complementary/70 uppercase tracking-wide">{product.category}</span>
                    <h3 className="text-gray-900 font-semibold text-base leading-tight mt-0.5">{product.name}</h3>
                    <p className="text-gray-500 text-sm mt-1 leading-snug">{product.description}</p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                    <span className="text-gray-900 font-bold text-lg">${dollars}</span>
                    <button
                        className="btn"
                        style={{ '--btn-py': '0.5rem', '--btn-px': '1rem', '--btn-font-size': '0.8125rem' } as React.CSSProperties}
                        onClick={() => onAddToCart(product)}
                    >
                        Add to cart
                    </button>
                </div>
            </div>
        </div>
    );
}
