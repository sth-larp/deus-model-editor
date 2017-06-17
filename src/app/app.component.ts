import { Component, Input, ViewChild } from '@angular/core';
import { JsonViewComponent, JsonTextLine } from './json-view/json-view.component'
import { DeusModelService } from './model/deus-model.service'
import { Observable, ConnectableObservable, Subscription } from 'rxjs/Rx';
import { NgbDropdown, NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { trigger, state, style, animate, transition } from '@angular/animations';


import { PRELOAD_EVENTS, REFRESH_EVENT_NAME } from './data/preload-events'
import { LogWindowComponent } from "./log-window/log-window.component"

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    providers: [DeusModelService],
    animations: [
        trigger('alertState',[
            state( 'hidden',style({
                opacity: 0
            })),
            state( 'visible',style({
                opacity: 1
            })),
            transition('hidden => visible', animate('300ms')),
            transition('visible => hidden', animate('300ms'))
        ])
    ]
})

export class AppComponent {
    @ViewChild(JsonViewComponent) jsonView : JsonViewComponent;

    @Input() eventName: string = REFRESH_EVENT_NAME;
    @Input() eventData: string = "";

    title = 'Deus 2017 Model Editor';

    alertText = "Test Alert";
    //isAlertVisible = false;
    alertState = "hidden";
    alertTimeout = -1;

    preloadEvents = PRELOAD_EVENTS;

    isAutoUpdate: boolean = false;
    subscription: any = null;

    modelViewType: string = "base";

    rightPaneType: string = "events";

    constructor(private deusModelService: DeusModelService) {
        //Observable.from([1]).delay(10000).subscribe(x => { this.alertState = "hidden"; } )
        // Observable.timer(0, 1000).subscribe(x => {
        //         if(this.alertTimeout > 0){   }
        //     }
        // )
    }

    sentEvent(refresh: boolean): void {
        this.deusModelService.sentEvent(this.eventName, this.eventData, refresh)
            .subscribe( response => console.log(`Sent result: ${response.statusText}`) );
    }

    loadModel(): void {
        this.jsonView.subscribeModel(this.modelViewType);
        this.isAutoUpdate = true;
    }

    autoUpdateToogle(): void{
        if(this.isAutoUpdate){
            this.jsonView.unsubscribeModel();
            this.isAutoUpdate = false;
        }else{
            this.jsonView.subscribeModel(this.modelViewType);
            this.isAutoUpdate = true;
        }
    }

    showAlertText(text: string): void{
        this.alertText = text;
        this.alertState = "visible";
        Observable.from([1]).delay(10000).subscribe(x => { this.alertState = "hidden"; } )
    }
}
