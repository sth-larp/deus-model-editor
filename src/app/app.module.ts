import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';


import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {DropdownModule} from 'primeng/primeng';
import {ToastModule, ToastOptions} from 'ng2-toastr/ng2-toastr';

import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { AceEditorModule } from 'ng2-ace-editor';

import { AppComponent } from './app.component';
import { JsonViewComponent } from './json-view/json-view.component';
import { LogWindowComponent } from './log-window/log-window.component';
import { DmeToastOptions  } from "./services/notification.service";
import { EventsListComponent } from './events-list/events-list.component';
import { SendEventsComponent } from './send-events/send-events.component'
import { ModelsPageComponent } from './pages/models-page.component';
import { LoginPageComponent } from './pages/login-page.component';
import { AuthGuard } from './services/auth-guard.service';
import { AuthService } from './services/auth.service';


const appRoutes: Routes = [
    { path: 'models', component: ModelsPageComponent, canActivate: [AuthGuard] },
    { path: 'login', component: LoginPageComponent },
    { path: '',   redirectTo: '/models', pathMatch: 'full' },
];

@NgModule({
  declarations: [
    AppComponent,
    JsonViewComponent,
    LogWindowComponent,
    EventsListComponent,
    SendEventsComponent,
    ModelsPageComponent,
    LoginPageComponent
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
    NgxDatatableModule,
    AceEditorModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    )
  ],
  providers: [
    {provide: ToastOptions, useClass: DmeToastOptions},
    AuthGuard,
    AuthService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
