import { Injectable, Input } from '@angular/core';
import { DeusModel } from './DeusModel'
import { Observable, ConnectableObservable } from 'rxjs/Rx';
import { Headers, Response, Request, Http, RequestOptions, RequestOptionsArgs } from '@angular/http';

@Injectable()
export class DeusModelService {

    @Input() charID: String = "";
    @Input() charPass: String = "";

    model: DeusModel = null;

    private couchDbUrl = "http://dev.alice.digital:5984";

    private dbNames = {
        base : "models-dev2",
        work : "working-models-dev2",
        view : "view-models-dev2"
    };

    constructor(private http: Http)
     {
        this.model = new DeusModel();
    }

    getModel(type: string): Observable<any> {
        if(!this.dbNames.hasOwnProperty(type)) { Observable.empty(); }
        if(!this.charID.match(/^\d{4,5}/i)){ return Observable.empty(); }

        let url = this.couchDbUrl + "/" + this.dbNames[type] + "/" + this.charID;

        let h = new Headers( [{ 'Content-Type' : 'application/json'}, {'Accept':'application/json'}] );
        let options = new RequestOptions({ headers: h });

        return Observable.timer(0,10000)
                    .flatMap( x => this.http.get(url) )
                    .map( response => this.processModelJson(response.json()) )
                    .share();

    }

    //Преобразует JSON модели в объект с информацией об обновлении (пока заглушки)
    private processModelJson( obj : any ): any {
        if(obj == null) { return null; }

        let retObj: any = null;

        if(!Array.isArray(obj)){
            retObj = {};
            retObj["__status"] = "none";

            /*if(Math.random() > 0.5){
                retObj["__status"] = "mod";
            }*/
        }else{
            retObj = [];
        }

        for(let p in obj){
            if(obj[p] == null ){
                retObj[p] = null;
            }else if(typeof obj[p] == "object"){
                retObj[p] = this.processModelJson( obj[p] );
            }else if(typeof obj[p] == "string" || typeof obj[p] == "number" ||  typeof obj[p] == "boolean"){
                retObj[p] = { __value: obj[p], __status: "none" }

                //TODO test!!!
                /*if(Math.random() > 0.5){
                    retObj[p].__status = "mod";
                }*/
            }
        }

        return retObj;
    }

}
