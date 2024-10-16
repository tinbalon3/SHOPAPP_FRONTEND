import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../enviroments/environment';
import { RatingDTO } from '../dtos/rate.dto';
import { Observable } from 'rxjs';
import { Rating } from '../response/rating/rating.response';
import { RatingResponse } from '../response/rating/ratingResponse.response';

@Injectable({
  providedIn: 'root'
})
export class ReviewProductRatingService {

  private apiUrl = environment.apiBaseUrl + "/rating";
  constructor(private http: HttpClient) { }

  ratingProduct(rateDTO: RatingDTO):Observable<HttpResponse<any>>{
    return this.http.post<HttpResponse<any>>(this.apiUrl, rateDTO);
  }

  getAllRating(product_id:number):Observable<RatingResponse[]> {
    let params = new HttpParams()
    .set('product', product_id.toString());
   
    return this.http.get<RatingResponse[]>(this.apiUrl,{params});
  }
}
