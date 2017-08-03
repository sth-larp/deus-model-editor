import { Component, Input, ViewChild, ChangeDetectorRef, ViewContainerRef, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { DeusModelService } from '../model/deus-model.service'
import { Observable, ConnectableObservable, Subscription } from 'rxjs/Rx';
import { ToastOptions } from 'ng2-toastr/ng2-toastr';

import { NotificationService, DmeToastOptions } from "../services/notification.service"
import { PRELOAD_EVENTS, REFRESH_EVENT_NAME } from '../data/preload-events'
import { EventsListComponent } from "../events-list/events-list.component"

@Component({
    selector: 'dme-send-events',
    templateUrl: './send-events.component.html',
    styleUrls: ['./send-events.component.scss']
})
export class SendEventsComponent implements OnInit {

    preloadedEventsList = PRELOAD_EVENTS.map((x) => { return { label: x.label, value: x.type }; });

    @Input() selectedEvent: any = this.preloadedEventsList[0].value;
    @Input() eventData: string = PRELOAD_EVENTS[0].template; ;


    constructor(private deusModelService: DeusModelService,
                private notifyService: NotificationService) { }

    ngOnInit() {
    }

    onEventSelectChange(value: any): void{
        let event = PRELOAD_EVENTS.find(x => x.type == value);
        if(event){
            this.eventData = event.template;
        }else{
            this.eventData = "{ }";
        }
    }

    sentEvent(refresh: boolean): void {

        let data:any = null;
        try{
            data = JSON.parse(this.eventData);
        }catch(err){
            this.notifyService.error(`Error while sending event: ${this.selectedEvent}\nError: can't parse JSON data`, "Event sent error!");
        }

        console.log("Sent event");
        console.log(data);


        this.deusModelService.sentEvent(this.selectedEvent, data, refresh)
            .do( () => { this.notifyService.success(`Successfully sent event: ${this.selectedEvent}`, "Event sent!") } )
            .delay(2000)
            .subscribe( (response) => {
                    this.deusModelService.refreshSources();
            },
            (error) => {
                this.notifyService.error(`Error while sending event: ${this.selectedEvent}\nError: ${error}`, "Event sent error!")
            });
    }

}
