import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { Observable, ConnectableObservable, Subscription } from 'rxjs/Rx';

import { DeusModelService } from '../model/deus-model.service';
import { JsonTextLine, PrepareViewData } from './prepare-view-data';
import { NotificationService } from "../notification.service"


@Component({
    selector: 'dme-json-view',
    templateUrl: './json-view.component.html',
    styleUrls: ['./json-view.component.css']
})
export class JsonViewComponent implements OnInit {
//Данные для отладки
@Input() viewName = "JsonViewComponent";


//DataSource
    private subscription: Subscription = null;

/**
 * Источник данных для показа (входной параметр компонента)
 * (должен возвращать объект, подготовленный для показа
 * в котором вместо значений __value и __status
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
            this.subscription = ds.map( (obj) => PrepareViewData.process(obj) )
                                    .subscribe( (lines) => {
                                                    this.textModelLines = lines;
                                                    this.collapseAll();
                                                    console.log(`JsonViewComponent (${this.viewName}): Model reloaded!`);
                                                    this.onLoad.emit(null);
                                                },
                                                (error) => {
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

//Набор строк для показа (получены после обработки)
    public textModelLines: JsonTextLine[] = [];

//Constructor
    constructor(private notifyService: NotificationService) {}

//Members
    ngOnInit() {}

    //Сворачивание или разворачивание блока
    collapseButtonClick(line: number, levels: number = 1): void {
        if(this.textModelLines[line].isTriggerCollapsed){
            this.showBlock(line, levels);
        }else{
            this.collapseBlock(line);
        }

        this.textModelLines[line].isTriggerCollapsed = !this.textModelLines[line].isTriggerCollapsed;
    }

    collapseBlock(line: number): void{
        let flag: number = 1;

        for(let i=line+1; i < this.textModelLines.length; i++ ){
            if(flag == 0) { break; }

            this.textModelLines[i].isVisible = false;

            if(this.textModelLines[i].collapseTrigger) {
                flag++;
                this.textModelLines[i].isTriggerCollapsed=true;
            }

            if(this.textModelLines[i].collapseFinish) { flag--; }
        }
    }

    showBlock(line: number, levels: number = 1): void{
        let flag: number = 1;

        for(let i=line+1; i < this.textModelLines.length; i++ ){
            if(flag == 0) { break; }

            if(flag <= levels ){
                this.textModelLines[i].isVisible = true;
            }

            if(this.textModelLines[i].collapseTrigger) {
                flag++;

                if( flag <= levels) {
                    this.textModelLines[i].isTriggerCollapsed=false;
                }
            }

            if(this.textModelLines[i].collapseFinish) { flag--; }
        }
    }

    collapseAll(): void{
        let flag: number = 1;

        for(let i=1; i < this.textModelLines.length; i++ ){
            if(flag > 1){
                this.textModelLines[i].isVisible = false;
            }

            if(this.textModelLines[i].collapseTrigger) {
                flag++;
                this.textModelLines[i].isTriggerCollapsed=true;
            }

            if(this.textModelLines[i].collapseFinish) { flag--; }
         }
    }

    showAll(): void{
         let flag: number = 0;

        for(let i=0; i < this.textModelLines.length; i++ ){
            this.textModelLines[i].isVisible = true;

            if(this.textModelLines[i].collapseTrigger) {
                this.textModelLines[i].isTriggerCollapsed=false;
            }
        }
    }
}
