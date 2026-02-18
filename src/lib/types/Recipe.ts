export interface Recipe {
    id: string;
    title: string;
    chefName: string;
    rating: number;
    reviewsCount: number;
    timeInMins: number;
    servings:number;
    difficulty:'Easy'|'Medium'|'Hard'
    imageUrl: string;
    priceXrp?:number;
    blockchainHash?: string;
}