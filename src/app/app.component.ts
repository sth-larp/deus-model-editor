import { Component, Input, ViewChild, ChangeDetectorRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { JsonViewComponent } from './json-view/json-view.component'
import { DeusModelService } from './model/deus-model.service'
import { Observable, ConnectableObservable, Subscription } from 'rxjs/Rx';
import { NgbDropdown, NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { ToastOptions } from 'ng2-toastr/ng2-toastr';

import { NotificationService, DmeToastOptions  } from "./notification.service"
import { PRELOAD_EVENTS, REFRESH_EVENT_NAME } from './data/preload-events'
import { LogWindowComponent } from "./log-window/log-window.component"
import { EventsListComponent } from "./events-list/events-list.component"

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    providers: [ DeusModelService, NotificationService]
})

export class AppComponent implements OnInit,OnDestroy {
    @ViewChild('baseModelView') baseModelView : JsonViewComponent;
    @ViewChild('workModelView') workModelView : JsonViewComponent;
    @ViewChild('viewModelView') viewModelView : JsonViewComponent;
    @ViewChild('eventsListView') eventsListView : EventsListComponent;


    preloadedEventsList = PRELOAD_EVENTS.map( (x) => { return { label: x.label, value: x.type }; } );

    @Input() selectedEvent: any = this.preloadedEventsList[0].value;
    @Input() eventData: string = PRELOAD_EVENTS[0].template; ;

    title = 'Deus 2017 Model Editor';

    subscription: any = null;

    activeModelView: string = "base";

    leftPaneType: string = "events";

    modelViews: any = {};

    constructor(private deusModelService: DeusModelService,
                private notifyService: NotificationService,
                private vcr: ViewContainerRef ) {}

    ngOnInit() {
        this.deusModelService.onInit();

        this.notifyService.rootViewContainer = this.vcr;

        this.activeModelView = "base";
        this.modelViews['base'] = this.baseModelView;
        this.modelViews['work'] = this.workModelView;
        this.modelViews['view'] = this.viewModelView;
    }

    ngOnDestroy(){
        this.deusModelService.onDestroy();
    }

    sentEvent(refresh: boolean): void {
        this.deusModelService.sentEvent(this.selectedEvent, this.eventData, refresh)
            .subscribe( response => {
                let m = `Successfully sent event: ${this.selectedEvent}\n`

                m+= `Result: ${response.status} ${response.statusText}`;
                this.notifyService.success(m, "Event sent!")

                this.connectViews();
            });
    }

    loadModel(): void {
        this.connectViews();
    }

    notifyWhenLoaded(count: number): number{
        if(count < 2) { return count+1; }

        this.notifyService.success("All model views reloaded!")
        return 0;
    }

    private modCheckSubscription: Subscription = null;

    connectViews(): void{
        let count = 0;

        if(this.modCheckSubscription && !this.modCheckSubscription.closed){
            this.modCheckSubscription.unsubscribe();
        }

        let baseSource = this.deusModelService.getModel("base");
        let workSource = this.deusModelService.getModel("work");
        let viewSource = this.deusModelService.getModel("view");

        this.baseModelView.dataSource = baseSource;
        this.workModelView.dataSource = workSource;

        this.modCheckSubscription = workSource.skip(1).take(1).delay(4000).subscribe(x => {
                                        this.notifyService.warning("Model changed! Stop auto-reloading!")
                                        this.disconnectViews();
                                    });

        this.viewModelView.dataSource = viewSource;

        this.connectEventView();
    }

    connectEventView(): void{
        this.eventsListView.dataSource = this.deusModelService.getEvents();
    }

    private jsonViewReloadFlag:boolean[] = [false, false, false];

    onJsonViewReload(index: number){
        this.jsonViewReloadFlag[index] = true;

        if(this.jsonViewReloadFlag.every(x => x)){
            this.notifyService.success("All model views reloaded!")
            this.jsonViewReloadFlag = [false, false, false];
        }
    }

    disconnectViews(){
        this.baseModelView.dataSource = null;
        this.workModelView.dataSource = null;
        this.viewModelView.dataSource = null;

        this.disconnectEventView();
    }

    disconnectEventView(){
        this.eventsListView.dataSource = null;
    }

    onEventSelectChange(value: any): void{
        let event = PRELOAD_EVENTS.find(x => x.type == value);
        if(event){
            this.eventData = event.template;
        }else{
            this.eventData = "{ }";
        }
    }

    testDBRequest(): void {
        this.eventsListView.dataSource = this.deusModelService.getEvents();
    }
}
