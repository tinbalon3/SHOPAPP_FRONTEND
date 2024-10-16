import { UserResponseManagement } from "./user_management.response";

export interface UserPage {
    user: UserResponseManagement[]
    totalPages: number
}