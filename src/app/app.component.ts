import { Component, Input, ViewChild, ChangeDetectorRef, ViewContainerRef, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { JsonViewComponent } from './json-view/json-view.component'
import { DeusModelService } from './model/deus-model.service'
import { Observable, ConnectableObservable, Subscription, Subject } from 'rxjs/Rx';
import { NgbDropdown, NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { ToastOptions } from 'ng2-toastr/ng2-toastr';

import { NotificationService, DmeToastOptions  } from "./services/notification.service";
import { PRELOAD_EVENTS, REFRESH_EVENT_NAME } from './data/preload-events';
import { LogWindowComponent } from "./log-window/log-window.component";
import { EventsListComponent } from "./events-list/events-list.component";
import { SendEventsComponent } from './send-events/send-events.component';
import { ModelsPageComponent } from './pages/models-page.component';
import { AuthService } from './services/auth.service'
import { ConfigService, DMEConfig } from './services/config.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    providers: [ DeusModelService, NotificationService ]
})

export class AppComponent implements OnInit,OnDestroy  {
    @ViewChild('modelsPage') modelPage : ModelsPageComponent;

    title = 'Deus 2017 Model Editor';

    @Input() charID: string = "";

    private loadSubject = new Subject<any>();

    constructor(private deusModelService: DeusModelService,
                private notifyService: NotificationService,
                private vcr: ViewContainerRef,
                private authService: AuthService,
                private router: Router,
                private configService: ConfigService
                 ) {}

    ngOnInit() {
        this.notifyService.rootViewContainer = this.vcr;
    }

    ngOnDestroy(){ }

    onLogout() {
        this.authService.logout().subscribe( () => {
            this.router.navigate(['/login']);
        })
    }
}
