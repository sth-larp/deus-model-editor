import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service'
import { Router } from '@angular/router';

@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {

    constructor(private authService: AuthService, public router: Router) { }

    ngOnInit() {
    }

    onLogin() {
        console.log("Login!");

        this.authService.login().subscribe(() => {
            if (this.authService.isLoggedIn) {
                let url = this.authService.redirectUrl ? this.authService.redirectUrl : '/models';
                this.router.navigate([url]);
            }
        });
    }
}
