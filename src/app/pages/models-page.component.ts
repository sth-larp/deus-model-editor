import { Component, Input, ViewChild, ChangeDetectorRef, ViewContainerRef, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { JsonViewComponent } from '../json-view/json-view.component'
import { DeusModelService } from '../model/deus-model.service'
import { Observable, ConnectableObservable, Subscription } from 'rxjs/Rx';
import { NgbDropdown, NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { ToastOptions } from 'ng2-toastr/ng2-toastr';

import { NotificationService, DmeToastOptions  } from "../services/notification.service"
import { PRELOAD_EVENTS, REFRESH_EVENT_NAME } from '../data/preload-events'
import { LogWindowComponent } from "../log-window/log-window.component"
import { EventsListComponent } from "../events-list/events-list.component"
import { SendEventsComponent } from '../send-events/send-events.component'

@Component({
    selector: 'models-page',
    templateUrl: './models-page.component.html',
    styleUrls: ['./models-page.component.scss']
})

export class ModelsPageComponent implements OnInit,OnDestroy  {
    @ViewChild('baseModelView') baseModelView : JsonViewComponent;
    @ViewChild('workModelView') workModelView : JsonViewComponent;
    @ViewChild('viewModelView') viewModelView : JsonViewComponent;
    @ViewChild('eventsListView') eventsListView : EventsListComponent;

    preloadedEventsList = PRELOAD_EVENTS.map( (x) => { return { label: x.label, value: x.type }; } );

    @Input() selectedEvent: any = this.preloadedEventsList[0].value;
    @Input() eventData: string = PRELOAD_EVENTS[0].template; ;

    subscription: any = null;

    activeModelView: string = "all";
    activeSideView: string = "events";

    modelViews: any = {};

    constructor(private deusModelService: DeusModelService,
                private notifyService: NotificationService ) {}

    ngOnInit() {
        this.modelViews['base'] = this.baseModelView;
        this.modelViews['work'] = this.workModelView;
        this.modelViews['view'] = this.viewModelView;

        this.deusModelService.getLoadButtonStream().subscribe(()=>{
            this.connectViews();
            this.deusModelService.refreshSources();
        });

        setTimeout(() => {
           this.activeModelView = "base";
        },100);
    }

    ngOnDestroy(){}

    // sentEvent(refresh: boolean): void {

    //     let data:any = null;
    //     try{
    //         data = JSON.parse(this.eventData);
    //     }catch(err){
    //         this.notifyService.error(`Error while sending event: ${this.selectedEvent}\nError: can't parse JSON data`, "Event sent error!");
    //     }

    //     this.deusModelService.sentEvent(this.selectedEvent, data, refresh)
    //         .do( () => { this.notifyService.success(`Successfully sent event: ${this.selectedEvent}`, "Event sent!") } )
    //         .delay(2000)
    //         .subscribe( (response) => {
    //                 this.deusModelService.refreshSources();
    //         },
    //         (error) => {
    //             this.notifyService.error(`Error while sending event: ${this.selectedEvent}\nError: ${error}`, "Event sent error!")
    //         });
    // }

    connectViews(): void{

        this.baseModelView.dataSource = this.deusModelService.getModelSource("base");
        this.workModelView.dataSource = this.deusModelService.getModelSource("work");
        this.viewModelView.dataSource = this.deusModelService.getModelSource("view");

        this.eventsListView.dataSource = this.deusModelService.getLastEventsSource(2000);
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

    onViewChangeButton(view: string){
        this.activeModelView = view;
        this.modelViews[view].refreshView();
    }

    //Отмена редактирования модели (перезагрузка редактора)
    cancelUpdate(){
         this.baseModelView.dataSource = this.deusModelService.getModelSource("base");
         this.deusModelService.refreshSources();
    }

    udpateModel(){
        Observable.from( [0] )
            .flatMap( (value) => this.deusModelService.updateModel( JSON.parse(this.baseModelView.getText()) ) )
            .do( () => {
                        this.notifyService.success(`Model updated, refresh event sent. Waiting for reload!`, "Model update!");
                        this.baseModelView.changeTracking = false;
                        this.baseModelView.isChanged = false;
                    } )
            .delay(2000)
            .subscribe( (response) => {
                    this.connectViews();
                    this.deusModelService.refreshSources();
            },
            (error) => {
                this.notifyService.error(`Error while updating model.\nError: ${error}`, "Update model error!")
            });
    }
}
