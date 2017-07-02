import { Component, Input, ViewChild, OnInit} from '@angular/core';
import { DeusModelService } from '../model/deus-model.service';
import { IDeusEvent, DeusEvent } from '../model/deus-events';
import { Observable, ConnectableObservable, Subscription } from 'rxjs/Rx';

import { NgbPaginationConfig } from '@ng-bootstrap/ng-bootstrap'
import { DatatableComponent  } from '@swimlane/ngx-datatable';

import { NotificationService } from "../notification.service";
import { PRELOAD_EVENTS, REFRESH_EVENT_NAME } from '../data/preload-events';



@Component({
    selector: 'dme-events-list',
    templateUrl: './events-list.component.html',
    styleUrls: ['./events-list.component.scss']
})
export class EventsListComponent implements OnInit {
    @ViewChild('eventsTable') tableComponent : DatatableComponent;

    private _columns: Array<any> = [
        { prop: 'timestamp', name: "Timestamp", sortable: true, width: 120, minWidth: 100, maxWidth: 130 },
        { prop: 'timeOffsetAsString', name: "+/-", sortable: true, width: 50, minWidth: 30, maxWidth: 80 },
        { prop: 'eventType', name: "Event Type", sortable: true, width: 120, minWidth: 100, maxWidth: 150},
        { prop: 'dataAsString', name: "Event Data", sortable: false, canAutoResize: true, minWidth: 120, maxWidth: 500 }
    ];

    private _eventsList: IDeusEvent[] = [];

    //pagination
    private page: number = 1;
    private pageSize: number = 20;

    private offset: number = 0;

    private selected: Array<any> = [];

    //DataSource
    private subscription: Subscription = null;

    constructor(private deusModelService: DeusModelService,
                private notifyService: NotificationService,
                private paginationConfig: NgbPaginationConfig) { }

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
            this._eventsList = [];
            this.subscription = ds.catch((error) => {
                                    this.notifyService.error( `EventsListComponent: error while loading events!\nError: ${error}`,
                                                                                    "Error with loading events data!" );

                                    return Observable.throw(error);
                                }).subscribe((events: DeusEvent[]) => {
                                    if(events.length && this._eventsList.length){
                                        if(events[0].timestamp != this._eventsList[0].timestamp){
                                             this.notifyService.success("Events data loaded!");
                                        }
                                    }

                                     this._eventsList = events;
                                });

            console.log(`EventsListComponent: subscribed to new data source`);
        }
    }


    onPageChange(event){
        this.page = event;
        //this.offset = this.pageSize*(this.page-1);
        this.offset = this.page-1;
        console.log(`Page click: ${event}, page: ${this.page}, offset: ${this.offset}`);
    }

    onClearEvents(event){
        this.deusModelService.clearEvents()
            .do( () => { this.notifyService.warning(`Successfully clear events for user: ${this.deusModelService.config.characterID}`, "Events cleared!") } )
            .subscribe( (response) => {
                    this.deusModelService.refreshSources();
            },
            (error) => {
                this.notifyService.error(`Error in clearing events: ${error}`, "Event clearing errors!")
            });
    }

    onRowExpand(row){
        this.tableComponent.rowDetail.toggleExpandRow(row);
    }

    onDeleteSelected(event){
         this.deusModelService.deleteEvents(this.selected).subscribe(
                (x) => {
                    this.notifyService.warning(
                                    `Successfully deleted event ${x.id} for user: ${this.deusModelService.config.characterID}`, "Event deleted!");
                },
                (error) => {
                    this.notifyService.error(`Error in deleting events: ${error}`, "Event deleting errors!")
                },
                () => {
                        this.deusModelService.refreshSources();
                });

    }
}
