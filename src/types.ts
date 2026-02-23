export type ProductProps = {
    id: string;
    name: string;
    description: string;
    price: number;
    emoji: string;
    category: string;
    inventory: number;
};

export type CartItem = {
    product: ProductProps;
    quantity: number;
};

export type BlobParameterProps = {
    seed: number;
    size: number;
    edges: number;
    growth: number;
    name: string;
    colors: string[];
};

export type BlobProps = {
    svgPath: string;
    parameters: BlobParameterProps;
};
