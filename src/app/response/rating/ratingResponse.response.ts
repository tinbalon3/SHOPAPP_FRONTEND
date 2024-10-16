import { UserDetailResponse } from "../user/user.response";
import { Rating } from "./rating.response";

export interface RatingResponse {
  rating: Rating;
  user: UserDetailResponse
}