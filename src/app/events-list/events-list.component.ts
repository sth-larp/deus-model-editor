import { Component, Input, ViewChild, OnInit} from '@angular/core';
import { DeusModelService, DeusEvent } from '../model/deus-model.service'
import { Observable, ConnectableObservable, Subscription } from 'rxjs/Rx';

import { NotificationService } from "../notification.service";
import { PRELOAD_EVENTS, REFRESH_EVENT_NAME } from '../data/preload-events';



@Component({
    selector: 'dme-events-list',
    templateUrl: './events-list.component.html',
    styleUrls: ['./events-list.component.css']
})
export class EventsListComponent implements OnInit {

    private _eventsList: DeusEvent[] = []

    //DataSource
    private subscription: Subscription = null;
    private _dataSource: Observable<any> = null;

    constructor(private deusModelService: DeusModelService,
                private notifyService: NotificationService ) { }

    ngOnInit() {}

   @Input()
    set dataSource(ds: Observable<any>){
        //Отключить старую подписку, если была
        if(this.subscription && !this.subscription.closed){
            this.subscription.unsubscribe();
            console.log(`EventsListComponent : unsubscribed from data source`);
        }

        this._dataSource = ds;

        if(this._dataSource){
            //Подписаться на данные
            this.subscription = this.dataSource.subscribe( (docs) => {
                                                    this._eventsList=docs;
                                                    console.log(`EventsListComponent: Data lodaded!`);
                                                },
                                                (error) => {
                                                    this.notifyService.error(`EventsListComponent: error loading data!`)
                                                }
                                            );

            console.log(`EventsListComponent: subscribed to new data source`);
        }
    }

    get dataSource():Observable<any>{
        return this._dataSource;
    }


}
