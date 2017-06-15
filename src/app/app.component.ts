import { Component, Input, ViewChild } from '@angular/core';
import { JsonViewComponent, JsonTextLine } from './json-view/json-view.component'
import { DeusModelService } from './model/deus-model.service'
import { Observable, ConnectableObservable, Subscription } from 'rxjs/Rx';

import { TestServiceService } from './test-service.service'

import { NgbDropdown, NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    providers: [DeusModelService, TestServiceService]
})

export class AppComponent {
    @ViewChild(JsonViewComponent) jsonView : JsonViewComponent;

    @Input() eventName: string = "_RefreshModel";
    @Input() eventData: string = "{ }";

    title = 'Deus 2017 Model Editor';

    preloadEvents = [
            {
                name: "Event 1",
                type: "event1"
            },
            {
                name: "Event 2",
                type: "event2"
            },
            {
                name: "Event 3",
                type: "event3"
            },
        ];

    isAutoUpdate: boolean = false;
    subscription: any = null;

    modelViewType: string = "base";

    rightPaneType: string = "events";

    constructor(private deusModelService: DeusModelService) {
    }

    sentEvent(){
        this.deusModelService.sentEvent(this.eventName, this.eventData).subscribe( response => console.log(`Sent result: ${response.statusText}`) );
    }

    loadModel(): void {
        this.jsonView.subscribeModel(this.modelViewType);
        this.isAutoUpdate = true;
    }

    autoUpdateToogle(){
        if(this.isAutoUpdate){
            this.jsonView.unsubscribeModel();
            this.isAutoUpdate = false;
        }else{
            this.jsonView.subscribeModel(this.modelViewType);
            this.isAutoUpdate = true;
        }
    }
}
