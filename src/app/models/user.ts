import { Cart } from "./cart";

export class User {
    firstname: string = '';
    lastname: string = '';
    username: string = '';
    email: string = '';
    profilePicture: string = '';
    gender: string = '';
    cart : Cart = new Cart()

    craftsmanId?: number;
    craft?: string;
    rating?: number;
    numberOfRatings?: number;
    biography?: string;
}