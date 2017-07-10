import { Injectable, Input  } from '@angular/core';
import { Observable, ConnectableObservable, Subscription } from 'rxjs/Rx';


@Injectable()
export class AuthService {

    @Input() public username = '';
    @Input() public password = '';

    public isLoggedIn = false;

    redirectUrl: string;

    constructor() { }

    login(): Observable<boolean> {
        return Observable.of(true).delay(1000).do(val => this.isLoggedIn = true);
    }

    logout(): void {
        this.isLoggedIn = false;
    }
}
