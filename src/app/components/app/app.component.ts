import { Component, OnInit } from '@angular/core';
import { TokenService } from '../../services/token.service';
import { NavigationEnd, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { UserDetailResponse } from '../../response/user/user.response';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  userResponse?:UserDetailResponse;
  constructor(private tokenService: TokenService,
    private router: Router,
    private userService:UserService,
    private cartService: CartService,
    
){}
ngOnInit(): void {

  
}

  
  

}
