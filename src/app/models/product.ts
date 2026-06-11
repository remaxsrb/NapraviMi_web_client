export class Product {
    id: number | null = null;
    name: string = '';
    craftsmanId: number | null = null;
    hidden: boolean = false;
    price: number | null = null;
    description : string = ''
    rating : number | null = null;
    numberOfRatings : number | null = null;
    available : boolean = true;
    images? : string[] = [];
    videos? : string[] = [];
}