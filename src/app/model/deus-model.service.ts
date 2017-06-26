import { Injectable, Input } from '@angular/core';
import { Observable, ConnectableObservable } from 'rxjs/Rx';
import { Headers, Response, Request, Http, RequestOptions, RequestOptionsArgs } from '@angular/http';

import * as PouchDB from 'pouchdb';
import * as pouchDBFind from 'pouchdb-find';


import { REFRESH_EVENT_NAME } from "../data/preload-events"

export interface DeusEvent {
        _id: string,
        characterId: string,
        timestamp : number,
        eventType : string,
        data : any
};

/**
 * Класс отвечающий за все операции с CouchDB и API касающиеся моделей и событий
 *
 * @export
 * @class DeusModelService
 */
@Injectable()
export class DeusModelService {

    refreshEventName: string = REFRESH_EVENT_NAME;

    //Данные для передачи в запросах (заполняются извне)
    @Input() charID: String = "";
    @Input() charPass: String = "";

    //Параметры для подключения
    private couchDbUrl = "http://dev.alice.digital:5984";

    private dbNames = {
        base: "models-dev2",
        work: "working-models-dev2",
        view: "view-models-dev2",
        events: "events-dev2"
    };

    private eventsDB: PouchDB = null;

    constructor(private http: Http) { }

    //У сервисов нет Lifetime Hooks поэтому эти будет вызывать головной компонент
    onInit(): void {
        this.eventsDB = new PouchDB(this.couchDbUrl + '/' + this.dbNames['events']);
        PouchDB.plugin(pouchDBFind);

        this.eventsDB.info().then((info) => {
            console.log("Events Database opened!");
            console.log(info);
        });
    }

    onDestroy(): void {
        if (this.eventsDB) {
            this.eventsDB.close().then((x) => console.log("Events Database closed();"));
        }
    }

    /**
     * Отправка события персонажу.
     *
     * Если событие само не является Refresh'ем и установлен параметр refresh
     * то отправить два события сразу: исходное + Refresh
     *
     * @param {string} name
     * @param {string} evtData
     * @param {boolean} refresh
     * @returns {Observable<Response>}
     *
     * @memberof DeusModelService
     */
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

        if (name != this.refreshEventName && refresh) {
            eventsList.events.push({
                eventType: this.refreshEventName,
                timestamp: Date.now().valueOf()+10,
                characterId: this.charID,
                data: ""
            });
        }

        console.log("Send events: " + eventsList.events
            .map(e => e.eventType)
            .join(",")
        );

        let eventSource = this.http.post(url, JSON.stringify(eventsList), { headers: h });
        return eventSource;
    }


    /**
     * Получить модель (точнее Observable для ее загрузку)
     * Фактически при подключении хотя бы одного получателя, просиходит загрузка данных
     * Данные обновляются раз в 30 секунд
     *
     * @param {string} type Тип модели: 'base', 'work', 'view'
     * @returns {Observable<any>}
     *
     * @memberof DeusModelService
     */
    getModel(type: string): Observable<any> {
        if (!this.dbNames.hasOwnProperty(type)) { Observable.empty(); }
        if (!this.charID) { return Observable.empty(); }

        let url = this.couchDbUrl + "/" + this.dbNames[type] + "/" + this.charID;

        let h = new Headers([{ 'Content-Type': 'application/json' }, { 'Accept': 'application/json' }]);
        let options = new RequestOptions({ headers: h });

        let lastRev = "";

        return Observable.timer(0, 30000)
            .flatMap(x => this.http.get(url))
            .map(response => response.json())
            .filter((json, i) => {
                if (json._rev != lastRev) {
                    lastRev = json._rev;
                    return true;
                }
                console.log(`DeusModelService: model '${type}' loaded, but not changed!`);
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

    getEvents( pageSize: number = 50, maxTimestamp: number = 0 ): Observable<any> {
        if (!this.charID) { return Observable.empty(); }

        let selector = {
                selector: { characterId: { $eq: this.charID } },
                sort: [
                            {characterId :"desc"},
                            {timestamp :"desc"}
                      ],
                limit: pageSize
            };

        if( maxTimestamp != 0 ){
            selector.selector['timestamp'] = { $lt : maxTimestamp };
        }

        // return Observable.fromPromise(
        //                     this.eventsDB.find( selector )
        //                  )
        //                 .map(
        //                     (x:any) => { return x.docs; }
        //                 );


        let lastTimestamp: number = 0;
        let lastSize: number = 0;

        return Observable.timer(0, 30000)
            .flatMap(x => this.eventsDB.find(selector))
            .map((x:any) => { return x.docs; })
            .filter((docs, i) => {
                if(lastTimestamp == 0){

                    if(docs.length == 0) {
                         return false;
                    } else {
                        lastTimestamp = docs[0].timestamp;
                        return true;
                    }
                }else{
                    if(docs.length == 0) {
                        lastTimestamp = 0;
                        return true;
                    }else if(lastTimestamp != docs[0].timestamp){
                        lastTimestamp = docs[0].timestamp;
                        return true;
                    }else{
                        return false;
                    }
                }
            })
            .share();

    }

    /**
     * Удаление всех событий для данного персонажа (ну или до 10К событий за раз)
     *
     * @memberof DeusModelService
     */
    clearEvents(): void {

        let selector = {
                selector:{ characterId: this.charID },
                sort: [  {characterId :"desc"},
                         {timestamp :"desc"} ],
                limit: 10000
            }

        this.eventsDB.find( selector ).then( (result) => {
            return this.eventsDB.bulkDocs(
                        result.docs.map( (x) => {
                                                return {
                                                        _id: x._id,
                                                        _rev: x._rev,
                                                        _deleted : true,
                                                        characterId : x.characterId,
                                                        timestamp : x.timestamp,
                                                        eventType : x.eventType,
                                                        data : x.data
                                                    };
                                            } )
                )
        }).then((x) => { console.log(x); } )
    }
}
