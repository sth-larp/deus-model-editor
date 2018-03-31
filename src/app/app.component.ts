import { Component, Input, ViewChild, ChangeDetectorRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { JsonViewComponent } from './json-view/json-view.component'
import { DeusModelService } from './model/deus-model.service'
import { Observable, ConnectableObservable, Subscription } from 'rxjs/Rx';
import { NgbDropdown, NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { ToastOptions } from 'ng2-toastr/ng2-toastr';

import { NotificationService, DmeToastOptions } from './notification.service'
import { PRELOAD_EVENTS, REFRESH_EVENT_NAME } from './data/preload-events'
import { LogWindowComponent } from './log-window/log-window.component'
import { EventsListComponent } from './events-list/events-list.component'

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    providers: [DeusModelService, NotificationService]
})

export class AppComponent implements OnInit, OnDestroy {
    @ViewChild('baseModelView') baseModelView: JsonViewComponent;
    @ViewChild('workModelView') workModelView: JsonViewComponent;
    @ViewChild('viewModelView') viewModelView: JsonViewComponent;
    @ViewChild('eventsListView') eventsListView: EventsListComponent;

    // ================================================================
    // Данные формы
    @Input() charID = '';
    // ================================================================

    preloadedEventsList = PRELOAD_EVENTS.map((x) => ({ label: x.label, value: x.type }));

    @Input() selectedEvent: any = this.preloadedEventsList[0].value;
    @Input() eventData: string = PRELOAD_EVENTS[0].template; ;

    title = 'Deus 2017 Model Editor';

    subscription: any = null;

    activeModelView = 'base';

    leftPaneType = 'events';

    modelViews: any = {};

    private jsonViewReloadFlag: boolean[] = [false, false, false];

    constructor(private deusModelService: DeusModelService,
        private notifyService: NotificationService,
        private vcr: ViewContainerRef) { }

    ngOnInit() {
        this.deusModelService.onInit();

        this.notifyService.rootViewContainer = this.vcr;

        this.activeModelView = 'base';
        this.modelViews['base'] = this.baseModelView;
        this.modelViews['work'] = this.workModelView;
        this.modelViews['view'] = this.viewModelView;
    }

    ngOnDestroy() {
        this.deusModelService.onDestroy();
    }

    sentEvent(refresh: boolean): void {
        this.deusModelService.sentEvent(this.selectedEvent, this.eventData, refresh)
            .do(() => { this.notifyService.success(`Successfully sent event: ${this.selectedEvent}`, 'Event sent!') })
            .delay(2000)
            .subscribe((response) => {
                this.deusModelService.config = this.deusModelService.config;
            },
                (error) => {
                    this.notifyService.error(`Error while sending event: ${this.selectedEvent}\nError: ${error}`, 'Event sent error!')
                });
    }

    loadModel(): void {
        this.connectViews();
        this.deusModelService.characterID = this.charID;
    }

    connectViews(): void {
        this.baseModelView.dataSource = this.deusModelService.getModelSource('base');
        this.workModelView.dataSource = this.deusModelService.getModelSource('work');
        this.viewModelView.dataSource = this.deusModelService.getModelSource('view');

        this.eventsListView.dataSource = this.deusModelService.getLastEventsSource(100);
    }

    onJsonViewReload(index: number) {
        this.jsonViewReloadFlag[index] = true;

        if (this.jsonViewReloadFlag.every(x => x)) {
            this.notifyService.success('All model views reloaded!')
            this.jsonViewReloadFlag = [false, false, false];
        }
    }

    disconnectViews() {
        this.baseModelView.dataSource = null;
        this.workModelView.dataSource = null;
        this.viewModelView.dataSource = null;
        this.eventsListView.dataSource = null;
    }

    onEventSelectChange(value: any): void {
        const event = PRELOAD_EVENTS.find(x => x.type === value);
        if (event) {
            this.eventData = event.template;
        } else {
            this.eventData = '{ }';
        }
    }
}
