import { Injectable } from '@angular/core';
import { Observable, ConnectableObservable } from 'rxjs/Rx';


@Injectable()
export class TestServiceService {



    constructor() { }



    getData(): Observable<any> {
        return Observable.timer(1000,1000)
            .flatMap( (x) => {
                    return Observable.from([9]);
                })
            .do( (x) => console.log("Tap: " + x) )
            .share();
    }

}
