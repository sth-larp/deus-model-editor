import { Injectable, Input  } from '@angular/core';
import { Observable, ConnectableObservable, Subscription } from 'rxjs/Rx';
import * as PouchDB from 'pouchdb';


import { ConfigService } from './config.service';


@Injectable()
export class AuthService {

    @Input() public username = '';
    @Input() public password = '';

    public isLoggedIn: boolean = false;

    public  checkLogin(): Observable<boolean>{
         return Observable.fromPromise(this.configService.dbConnections["base"].getSession())
            .map( (response:any) => {
                    this.isLoggedIn = response.userCtx.name != null;
                    return this.isLoggedIn;
             });
    }

    redirectUrl: string;

    constructor(private configService: ConfigService) { }

    login(): Observable<boolean> {
        return Observable.fromPromise(
            this.configService.dbConnections["base"].login(this.username, this.password.trim())
        )
        .do(() => { this.isLoggedIn = true; } );
    }

    logout(): Observable<any> {
        this.isLoggedIn = false;
        this.password = "";
        return Observable.fromPromise(this.configService.dbConnections["base"].logout());
    }
}
