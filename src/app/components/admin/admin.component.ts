import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../../services/token.service';
import { UserService } from '../../services/user.service';
import { UserDetailResponse } from '../../response/user/user.response';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  userReponse?:UserDetailResponse | null;
  adminComponent:string = 'orders'
  constructor(
    private router: Router, 
    private tokenService: TokenService,
    private userService: UserService
  ) { }
  ngOnInit(): void {
    this.userReponse = this.userService.getUserDetailFromSessionStorage();
  }
  logout() {
    this.userService.logout();
    this.router.navigate(['/login'])
  }
  showComponent(component:string){
    this.adminComponent = component;
  }
}
