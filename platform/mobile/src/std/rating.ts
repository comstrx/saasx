const acclaimFloor = 4.8;

const acclaimVoices = 5;

export const acclaimed = ( rating: number, reviews: number ): boolean =>
    rating >= acclaimFloor && reviews >= acclaimVoices;
