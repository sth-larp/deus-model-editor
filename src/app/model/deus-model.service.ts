import { Injectable, Input } from '@angular/core';
import { DeusModel } from './DeusModel'
import { Observable, ConnectableObservable } from 'rxjs/Rx';
import { Headers, Response, Request, Http, RequestOptions, RequestOptionsArgs } from '@angular/http';

import { REFRESH_EVENT_NAME } from "../data/preload-events"

@Injectable()
export class DeusModelService {

    refreshEventName: string = REFRESH_EVENT_NAME;

    @Input() charID: String = "";
    @Input() charPass: String = "";

    private couchDbUrl = "http://dev.alice.digital:5984";

    private dbNames = {
        base: "models-dev2",
        work: "working-models-dev2",
        view: "view-models-dev2"
    };

    constructor(private http: Http) {}


    sentEvent(name: string, evtData: string, refresh: boolean): Observable<Response> {
        let url = "http://alice.digital:8157/events/" + this.charID;
        let h = new Headers({ 'Content-Type': 'application/json' });

        let eventsList = {
            "events": [
                {
                    eventType: name,
                    timestamp: Date.now().valueOf(),
                    characterId: this.charID,
                    data: evtData
                }
            ]
        };

        if(name != this.refreshEventName && refresh){
            eventsList.events.push( {
                            eventType: this.refreshEventName,
                            timestamp: Date.now().valueOf(),
                            characterId: this.charID,
                            data: ""
                    } );
        }

        console.log("Send events: " + eventsList.events
                                        .map( e => e.eventType )
                                        .join(",")
                                    );

        let eventSource = this.http.post(url, JSON.stringify(eventsList), {headers: h});
        return eventSource;
    }

    getModel(type: string): Observable<Response> {
        if (!this.dbNames.hasOwnProperty(type)) { Observable.empty(); }
        if (!this.charID) { return Observable.empty(); }

        let url = this.couchDbUrl + "/" + this.dbNames[type] + "/" + this.charID;

        let h = new Headers([{ 'Content-Type': 'application/json' }, { 'Accept': 'application/json' }]);
        let options = new RequestOptions({ headers: h });

        let lastRev = "";

        //Вернуть комбинацию из источника с обновление раз в 10 сек и принудительного
        return Observable.timer(0, 10000)
            .flatMap(x => this.http.get(url))
            .map(response => response.json())
            .filter((json, i) => {
                if (json._rev != lastRev) {
                    lastRev = json._rev;
                    return true;
                }
                console.log("Model not changed!");
                return false;
            })
            .map(json => this.processModelJson(json))
            .share();
    }

    //Преобразует JSON модели в объект с информацией об обновлении (пока заглушки)
    private processModelJson(obj: any): any {
        if (obj == null) { return null; }

        let retObj: any = null;

        if (!Array.isArray(obj)) {
            retObj = {};
            retObj["__status"] = "none";

            /*if(Math.random() > 0.5){
                retObj["__status"] = "mod";
            }*/
        } else {
            retObj = [];
        }

        for (let p in obj) {
            if (obj[p] == null) {
                retObj[p] = { __value: null, __status: "none" }
            } else if (typeof obj[p] == "object") {
                retObj[p] = this.processModelJson(obj[p]);
            } else if (typeof obj[p] == "string" || typeof obj[p] == "number" || typeof obj[p] == "boolean") {
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
