import { Component, Input, ViewChild, OnInit} from '@angular/core';
import { DeusModelService } from '../model/deus-model.service';
import { IDeusEvent, DeusEvent } from '../model/deus-events';
import { Observable, ConnectableObservable, Subscription } from 'rxjs/Rx';

import { NotificationService } from "../notification.service";
import { PRELOAD_EVENTS, REFRESH_EVENT_NAME } from '../data/preload-events';



@Component({
    selector: 'dme-events-list',
    templateUrl: './events-list.component.html',
    styleUrls: ['./events-list.component.css']
})
export class EventsListComponent implements OnInit {

    private _eventsList: IDeusEvent[] = []

    //DataSource
    private subscription: Subscription = null;

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

        if(ds){
            //Подписаться на данные
            this._eventsList = []
            this.subscription = ds.subscribe( (docs: DeusEvent[]) => {
                                                this._eventsList=docs;
                                                if(this._eventsList.length){
                                                    this.notifyService.success("Events data loaded!");
                                                }
                                            },
                                            (error) => {
                                                this.notifyService.error( `EventsListComponent: error while loading events!\nError: ${error}`,
                                                                            "Error with loading events data!" );
                                            }
                                        );

            console.log(`EventsListComponent: subscribed to new data source`);
        }
    }

}
