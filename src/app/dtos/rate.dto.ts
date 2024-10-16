export class RatingDTO {
    user_id:number;
    product_id:number;
    content:string;
    rating:number;
    constructor(user_id:number,product_id:number,content:string, rating:number){
        this.user_id = user_id;
        this.product_id = product_id;
        this.content = content;
        this.rating = rating;
    }
}