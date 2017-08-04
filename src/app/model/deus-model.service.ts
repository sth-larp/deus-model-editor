import { Injectable, Input } from '@angular/core';
import { Observable, ConnectableObservable, BehaviorSubject, Subject } from 'rxjs/Rx';
import { Headers, Response, Request, Http, RequestOptions, RequestOptionsArgs } from '@angular/http';
import { NotificationService } from '../services/notification.service'

import * as PouchDB from 'pouchdb';
import * as pouchDBFind from 'pouchdb-find';
import * as clones from 'clones';

import { defaultConfig }  from './../../../config';

import { REFRESH_EVENT_NAME } from "../data/preload-events";
import { DeusEvent, IDeusEvent } from "./deus-events";
import { DeusModel } from './interfaces/model';
import { DMEConfig, ConfigService } from '../services/config.service';

export const dbAliases = ["base", "work", "view", "events"];


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

    //Текущая конфигурация
    private _characterID: string = "";

    //Источник событий при изменении
    public charIdChanges: BehaviorSubject<string> = new BehaviorSubject(this.characterID);

    public set characterID(c: string){
        this._characterID = c;
        this.charIdChanges.next( this._characterID );
    }

    public get characterID(): string{
        return this._characterID;
    }

    //Послать обновление всем цепочкам, зависящим от конфига
    public refreshSources(): void{
        this.charIdChanges.next( this.characterID );
    }

    //Источник событий с частотой refreshTimeout (содержимое - актуальный конфиг)
    public refreshedConfigSource: Observable<any> = this._getRefreshedConfigSource();

    //События от кнопки "Load model" для компонентов (кнопка в App-component, потребители в других)
    private loadButtonSubject = new Subject<any>();

    //Конструктор
    constructor( private notifyService: NotificationService,
                 private configService: ConfigService ) { }

    //Методы для обработки кнопки Load Model (перезагрузки всего)
    getLoadButtonStream(): Observable<any>{
        return this.loadButtonSubject.asObservable();
    }

    onLoadButton(charID:string){
        this.characterID = charID;
        this.loadButtonSubject.next(this.characterID);
    }

    //Метод для получения источника данных из БД
    //На данный момент - каждый источник это один запрос.
    //Источник передает обновление раз в refreshTimeout ms
    public getModelSource(db: string): Observable<DeusModel> {
         return this.refreshedConfigSource
                        .flatMap( (c:DMEConfig): Observable<DeusModel> => {
                                return this.configService.dbConnections[db].get(c.characterID);
                        })
                        .distinctUntilChanged( DeusModelService._modelCompare )
    }

    //Вспомогательные функции
    private static _modelCompare(m1: DeusModel, m2: DeusModel): boolean {
        return (m1._rev == m2._rev)&&(m1._id == m2._id);
    }

    private _getRefreshedConfigSource(): Observable<DMEConfig> {
        return this.charIdChanges.combineLatest(
                            this.configService.configChanges,
                            Observable.timer(0, this.refreshTimeout),
                            (charID:string, c:DMEConfig, t:number) => {
                                let c2 = clones(c);
                                c2.characterID = charID;
                                return c2;
                            }
                        )
                        .filter((c:DMEConfig) => c.characterID != "")
                        .share();
    }

    //У сервисов нет Lifetime Hooks поэтому эти будет вызывать головной компонент
    onInit(): void {}

    onDestroy(): void {}

    /**
     * Обновление модели персонажа. Если объет не сущестует, то создается новая модель
     * Обновляется только Base-модель
     */

    updateModel(model: DeusModel): Observable<any>{
         return Observable.from( this.configService.dbConnections["base"].get(this.characterID) )
            .flatMap( (obj:DeusModel) => {
                    model._id = this.characterID;
                    model._rev = obj._rev;
                    return this.configService.dbConnections["base"].put( model );
            })
            .flatMap( (response:any) => this.sentEvent() );
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
    sentEvent(name: string = this.refreshEventName, evtData: any = null, refresh: boolean = false): Observable<Response> {;
        let events: Array<IDeusEvent> = [ new DeusEvent(this.characterID, name, evtData) ];

        events[0].timestamp = Date.now() + 1000;

        if (name != this.refreshEventName && refresh) {
            let event = DeusEvent.getRefreshEvent(this.characterID);
            event.timestamp = events[0].timestamp + 1;
            events.push( event );
        }

        console.log("Send events: " + events.map(e => e.eventType).join(","));

        return Observable.from( this.configService.dbConnections["events"].bulkDocs(events) );
    }

    getLastEventsSource(pageSize: number = 2000):Observable<Array<DeusEvent>> {
        return this.refreshedConfigSource
                        .flatMap( (c:DMEConfig) => {
                                return this.configService.dbConnections["events"].find(
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
        if(!this.characterID) { return Observable.empty(); }

        let selector = {
                selector:{ characterId: this.characterID },
                sort: [  {characterId :"desc"},
                         {timestamp :"desc"} ],
                limit: 10000
            }

        return Observable.from( this.configService.dbConnections["events"].find(selector) )
                    .flatMap( (result:any) => {
                            return this.configService.dbConnections["events"].bulkDocs(
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

        return Observable.from(events).flatMap( (event) => this.configService.dbConnections["events"].get(event._id) )
                                .flatMap( (doc:any) => this.configService.dbConnections["events"].remove(doc) )
                                .do((ret:any) => { console.log(`Deleted event id: ${ret.id}, status: ${ret.ok}`) });
    }
}
