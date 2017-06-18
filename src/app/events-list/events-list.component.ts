import { Component, Input, ViewChild, OnInit} from '@angular/core';
import { DeusModelService } from '../model/deus-model.service'
import { Observable, ConnectableObservable, Subscription } from 'rxjs/Rx';

import { NotificationService } from "../notification.service";
import { PRELOAD_EVENTS, REFRESH_EVENT_NAME } from '../data/preload-events';

@Component({
    selector: 'dme-events-list',
    templateUrl: './events-list.component.html',
    styleUrls: ['./events-list.component.css']
})
export class EventsListComponent implements OnInit {

    items = [
        {
            name : "Name1",
            data1 : "Data1",
            data2 : "Data2"
        },
        {
            name : "Name2",
            data1 : "Data21",
            data2 : "Data22"
        },
        {
            name : "Name3",
            data1 : "Data31",
            data2 : "Data32"
        }
    ];

    constructor(private deusModelService: DeusModelService,
                private notifyService: NotificationService ) { }

    ngOnInit() {
    }

}
