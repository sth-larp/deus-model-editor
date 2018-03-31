import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {DropdownModule} from 'primeng/primeng';
import {ToastModule, ToastOptions} from 'ng2-toastr/ng2-toastr';

import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { AppComponent } from './app.component';
import { JsonViewComponent } from './json-view/json-view.component';
import { LogWindowComponent } from './log-window/log-window.component';
import { DmeToastOptions  } from './notification.service';
import { EventsListComponent } from './events-list/events-list.component'


@NgModule({
  declarations: [
    AppComponent,
    JsonViewComponent,
    LogWindowComponent,
    EventsListComponent
  ],
  imports: [
    NgbModule.forRoot(),
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    JsonpModule,
    HttpModule,
    BrowserAnimationsModule,
    DropdownModule,
    ToastModule.forRoot(),
    NgxDatatableModule
  ],
  providers: [
    {provide: ToastOptions, useClass: DmeToastOptions},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
