import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { Observable, ConnectableObservable, Subscription } from 'rxjs/Rx';

import { DeusModelService } from '../model/deus-model.service';
import { JsonTextLine, PrepareViewData } from './prepare-view-data';
import { NotificationService } from "../services/notification.service"

import { AceEditorComponent } from 'ng2-ace-editor';



@Component({
    selector: 'dme-json-view',
    templateUrl: './json-view.component.html',
    styleUrls: ['./json-view.component.css'],
})
export class JsonViewComponent implements OnInit {
//Доступ к Ace Editor
@ViewChild('editor') aceEditor : AceEditorComponent;


//Данные для отладки
@Input() viewName = "JsonViewComponent";

//Read-only property
@Input() readOnly: boolean = false;

//Флаг того, что текст изменился изнутри редактора
@Output() isChanged: boolean = false;

//Нужно ли сейчас отслеживать изменени
public changeTracking: boolean = false;

//DataSource
private subscription: Subscription = null;

/**
 * Источник данных для показа (данные любой объект)
 *
 * @type {Observable<any>}
 * @memberof JsonViewComponent
 */
@Input()
    set dataSource(ds: Observable<any>){
        //Отключить старую подписку, если была
        if(this.subscription){
            this.subscription.unsubscribe();
            this.subscription = null;
            console.log(`JsonViewComponent (${this.viewName}): unsubscribed from data source`);
        }

        if(ds){
            //Подписаться на данные
            this.subscription = ds.map( (obj) => this.formatJson(obj) )
                                    .subscribe( (text) => {
                                                    this.changeTracking = false;
                                                    this.isChanged = false;

                                                    this.setText(text).then(() => {
                                                            this.collapseAll();
                                                            this.changeTracking = true;
                                                        } );

                                                    console.log(`JsonViewComponent (${this.viewName}): Model reloaded!`);
                                                    this.onLoad.emit(null);
                                                },
                                                (error) => {
                                                    this.setText("");
                                                    this.notifyService.error(`JsonViewComponent (${this.viewName}): error loading model!`)
                                                }
                                    );

            console.log(`JsonViewComponent (${this.viewName}): subscribed to new data source`);
        }
    }

@Output() onLoad: EventEmitter<any> = new EventEmitter();

get isConnected(): boolean {
    return this.subscription && !this.subscription.closed;
}

//Текст для редактора
    public _text: string = "";

//Constructor
    constructor(private notifyService: NotificationService) {}

//Members
    ngOnInit() {
        this.aceEditor._editor.getSession().on("changeFold", this.onFold.bind(this));
        this.refreshView();
    }

    public refreshView(): Promise<any>{
        return new Promise( resolve => {
                    setTimeout( () => {
                            this.aceEditor._editor.resize(true);
                            resolve(true);
                    }, 100 );
                });
    }

    public getText(): string{
        return this._text;
    }

    public setText(t: string) : Promise<string> {
        this._text  = t;

        return new Promise( resolve => {
                    setTimeout( () => {
                            this.aceEditor._editor.navigateFileStart();
                            resolve(t);
                    }, 100 );
                });
    }

    collapseAll(): void{
        this.aceEditor._editor.getSession().foldAll(1);
    }

    showAll(): void{
        this.aceEditor._editor.getSession().unfold();
    }

    formatJson(obj: any): string {
        if(!obj) return "";

        return JSON.stringify(obj, null, 4).replace(/\[\s*(?:\d,\s+)+?\d\s*\]/ig,
                    (match)=>{  return match.replace(/\s+/ig,' '); }
                );
    }

    onTextChange(e:any){
        if(this.changeTracking) {
            this.isChanged = true;

            if(this.subscription){
                this.dataSource = null;
            }
        }
    }

    onFold(e: any){
        if(this.changeTracking) {
            if(this.subscription){
                this.dataSource = null;
            }
        }
    }
}
