import { Injectable, Input  } from '@angular/core';
import { Observable, ConnectableObservable, BehaviorSubject, Subject } from 'rxjs/Rx';

// var PouchDB = require("pouchdb");
// PouchDB.plugin(require('pouchdb-find'));
// PouchDB.plugin(require('pouchdb-authentication'));
import * as PouchDB from 'pouchdb';
import * as pouchDBFind from 'pouchdb-find';
import * as pouchdbAuth from 'pouchdb-authentication';


import { defaultConfig }  from './../../../config';

export const dbAliases = ["base", "work", "view", "events"];

export interface DMEConfig{
    dbUrl: string;
    dbNames: { [index: string]: string };
    characterID?: string;
}


@Injectable()
export class ConfigService {

    //Текущие подключения в БД, изменяются, когда меняется конфиг
    public dbConnections : { [index: string]: any } = {};


    //Текущая конфигурация
    private _config: DMEConfig = Object.assign({}, defaultConfig);

    //Источник событий при изменении
    public configChanges: BehaviorSubject<DMEConfig> = new BehaviorSubject(this.config);

    //Properties связанные с конфигом (конфиг целиком и отдельно characterID)
    public set config(c: DMEConfig){
        this._config = c;

        console.log("Set config");
        this.openDatabases();

        this.configChanges.next( this.config )
    }

    public get config():DMEConfig{
        return Object.assign({}, this._config);
    }

    constructor() {
        (PouchDB as any).plugin(pouchDBFind);
        (PouchDB as any).plugin(pouchdbAuth);

        this.openDatabases();
     }

    //Послать обновление всем цепочкам, зависящим от конфига
    public refreshSource(): void{
        this.configChanges.next( this.config );
    }

    private openDatabases(): void{
        this.closeDatabases();

        for(let db of dbAliases){
            console.log(`Open database ${db}, url: ${this._config.dbUrl + this._config.dbNames[db]}`);
            this.dbConnections[db] =  new PouchDB(this._config.dbUrl + this._config.dbNames[db]);
        }
    }

    private closeDatabases(): void {
        for(let db of dbAliases){
            if(this.dbConnections[db]){
                this.dbConnections[db].close();
            }
        }
    }

}
