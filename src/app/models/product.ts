export class Product {
    name: string = '';
    hidden: boolean = false;
    price: number | null = null;
    description : string = ''
    images? : string[] = [];
    videos? : string[] = [];
}