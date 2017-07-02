import { Injectable, Input } from '@angular/core';
import { Observable, ConnectableObservable, BehaviorSubject } from 'rxjs/Rx';
import { Headers, Response, Request, Http, RequestOptions, RequestOptionsArgs } from '@angular/http';
import { NotificationService } from '../notification.service'

import * as PouchDB from 'pouchdb';
import * as pouchDBFind from 'pouchdb-find';
import * as clones from 'clones';

import { REFRESH_EVENT_NAME } from "../data/preload-events"
import { DeusEvent, IDeusEvent } from "./deus-events";
import { DeusModel } from './interfaces/model'

export const dbAliases = ["base", "work", "view", "events"];

export interface DeusModelServiceConfig{
    couchDbUrl: string;
    db: { [index: string]: string };
    characterID: string;
}


/**
 * Класс отвечающий за все операции с CouchDB и API касающиеся моделей и событий
 *
 * @export
 * @class DeusModelService
 */
@Injectable()
export class DeusModelService {

    refreshEventName: string = REFRESH_EVENT_NAME;

    //==================================================================================================
    // Новая модель конфигурации
    //==================================================================================================

    private refreshTimeout:number = 30000;

    private defaultConfig: DeusModelServiceConfig = {
        couchDbUrl : "http://dev.alice.digital:5984/",
        db : {
            work : "working-models-dev2",
            base : "models-dev2",
            view : "view-models-dev2",
            events : "events-dev2"
        },
        characterID : ""
    }

    //Текущая конфигурация
    private _config: DeusModelServiceConfig = null;

    //Источник событий при изменении
    public configChanges: BehaviorSubject<DeusModelServiceConfig> = new BehaviorSubject(this.config);

    //Properties связанные с конфигом (конфиг целиком и отдельно characterID)
    public set config(c: DeusModelServiceConfig){
        this._config = c;

        console.log("Set config");
        this.openDatabases();

        this.configChanges.next( this.config )
    }

    public get config():DeusModelServiceConfig{
        return Object.assign({}, this._config);
    }

    public set characterID(c: string){
        this._config.characterID = c;
        this.configChanges.next( this.config );
    }

    public get characterID(): string{
        return this._config.characterID;
    }

    //Послать обновление всем цепочкам, зависящим от конфига
    public refreshSources(): void{
        this.configChanges.next( this.config );
    }

    //Источник событий с частотой refreshTimeout (содержимое - актуальный конфиг)
    public refreshedConfigSource: Observable<any> = null;

    //Текущие подключения в БД, изменяются, когда меняется конфиг
    private dbConnections : { [index: string]: PouchDB } = {};


    //Конструктор
    constructor(private http: Http, private notifyService: NotificationService ) { }

    //Метод для получения источника данных из БД
    //На данный момент - каждый источник это один запрос.
    //Источник передает обновление раз в refreshTimeout ms
    public getModelSource(db: string): Observable<DeusModel> {
         return this.refreshedConfigSource
                        .flatMap( (c:DeusModelServiceConfig) => {
                                return this.dbConnections[db].get(c.characterID);
                        })
                        .distinctUntilChanged( DeusModelService._modelCompare )
                        .map(model => this.processModelJson(model));
    }

    //Вспомогательные функции
    private static _modelCompare(m1: DeusModel, m2: DeusModel): boolean {
        return (m1._rev == m2._rev)&&(m1._id == m2._id);
    }

    private _getRefreshedConfigSource(): Observable<DeusModelServiceConfig> {
        return this.configChanges.combineLatest(
                            Observable.timer(0, this.refreshTimeout),
                            (c:DeusModelServiceConfig, t:number) => { return c; }
                        )
                        .filter((c:DeusModelServiceConfig) => c.characterID != "")
                        .share();
    }

    private openDatabases(): void{
        this.closeDatabases();

        for(let db of dbAliases){
            console.log(`Open database ${db}, url: ${this._config.couchDbUrl + this._config.db[db]}`);
            this.dbConnections[db] =  new PouchDB(this._config.couchDbUrl + this._config.db[db]);
        }
    }

    private closeDatabases(): void {
        for(let db of dbAliases){
            if(this.dbConnections[db]){
                this.dbConnections[db].close();
            }
        }
    }

    //У сервисов нет Lifetime Hooks поэтому эти будет вызывать головной компонент
    onInit(): void {
        PouchDB.plugin(pouchDBFind);

        this.config = this.defaultConfig;

        this.refreshedConfigSource = this._getRefreshedConfigSource();
    }

    onDestroy(): void {
        this.closeDatabases();
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
    sentEvent(name: string, evtData: string, refresh: boolean): Observable<Response> {;
        let events: Array<IDeusEvent> = [ new DeusEvent(this._config.characterID, name, evtData) ];

        if (name != this.refreshEventName && refresh) {
            events.push( DeusEvent.getRefreshEvent(this._config.characterID) );
        }

        console.log("Send events: " + events.map(e => e.eventType).join(","));

        return Observable.from( this.dbConnections["events"].bulkDocs(events) );
    }

    getLastEventsSource(pageSize: number = 100):Observable<Array<DeusEvent>> {
        return this.refreshedConfigSource
                        .flatMap( (c:DeusModelServiceConfig) => {
                                return this.dbConnections["events"].find(
                                             DeusModelService._eventsSelector(c.characterID,pageSize)
                                );
                        })
                         .map((x:any) => x.docs )
                        //.distinctUntilChanged( DeusModelService._eventsCompare )
                        .map( (x:Array<IDeusEvent>) => x.map( (e) => DeusEvent.fromEvent(e) ) );
    }

    private static _eventsSelector( id: string, psize: number ): any {
        return  {
            selector: { characterId: { $eq: id } },
            sort: [
                        {characterId :"desc"},
                        {timestamp :"desc"}
                    ],
            limit: psize
        };
    }

    private static _eventsCompare(m1: Array<IDeusEvent>, m2: Array<IDeusEvent>): boolean {
        return (m1.length == 0 && m2.length == 0) ||
               ( (m1.length == m2.length) && (m1[0].timestamp == m2[0].timestamp) );
    }


    /**
     * Удаление всех событий для данного персонажа (ну или до 10К событий за раз)
     *
     * @memberof DeusModelService
     */
    clearEvents(): Observable<any> {
        if(!this._config.characterID) { return Observable.empty(); }

        let selector = {
                selector:{ characterId: this._config.characterID },
                sort: [  {characterId :"desc"},
                         {timestamp :"desc"} ],
                limit: 10000
            }

        return Observable.from( this.dbConnections["events"].find(selector) )
                    .flatMap( (result:any) => {
                            return this.dbConnections["events"].bulkDocs(
                                result.docs.map( (x) =>  {
                                                let x2 = clones(x);
                                                x2._deleted = true
                                                return x2;
                                            }
                                )
                            );
                    })
                    .do( (x) => { console.log(x); } );
    }

    /**
     * Удаление нескольких событий данного персонажа
     *
     * @memberof DeusModelService
     */
    deleteEvents( events: IDeusEvent[] ): Observable<any> {
        if(!events.length) { return Observable.empty(); }

        let arr: Observable<any>[] = [];

        return Observable.from(events).flatMap( (event) => this.dbConnections["events"].get(event._id) )
                                .flatMap( (doc:any) => this.dbConnections["events"].remove(doc) )
                                .do((ret:any) => { console.log(`Deleted event id: ${ret.id}, status: ${ret.ok}`) });
    }
}
