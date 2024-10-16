export class CheckoutDTO {
    amount :number;
    reason:string;
    constructor(amount: number,reason:string){
       this.amount = amount;
       this.reason = reason;
    }
}