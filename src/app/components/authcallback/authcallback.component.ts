import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenService } from '../../services/token.service';
import { CartService } from '../../services/cart.service';
import { UserService } from '../../services/user.service';
import { ToastrService } from 'ngx-toastr';
import { Response } from '../../response/response';
import { UserDetailResponse } from '../../response/user/user.response';

@Component({
  selector: 'app-authcallback',
  templateUrl: './authcallback.component.html',
  styleUrl: './authcallback.component.scss'
})
export class AuthcallbackComponent implements OnInit {
  userResponse!: UserDetailResponse | null;
  constructor(private router: Router,
    private tokenService: TokenService,

    private userService: UserService,
    private activeRouter: ActivatedRoute,
    private toastr: ToastrService) { }
  ngOnInit(): void {
    const code = this.activeRouter.snapshot.queryParamMap.get("code")
    if (code != null) {
      this.userService.callbackAuth(code).subscribe({
        next: (response: Response) => {

          window.opener.postMessage({ type: 'login-success', response: response }, window.location.origin);
          // Đóng cửa sổ pop-up
          window.close();

        },
        error: (error: any) => {
          window.opener.postMessage({ type: 'login-failed', response: error.error.message}, window.location.origin);
          // Đóng cửa sổ pop-up
          window.close();
          

        }
      })
    }


  }


  
}
