import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { JsonViewComponent } from './json-view/json-view.component';
import { JsonLineShowComponent } from './json-line-show/json-line-show.component';
import { LogWindowComponent } from './log-window/log-window.component';

@NgModule({
  declarations: [
    AppComponent,
    JsonViewComponent,
    JsonLineShowComponent,
    LogWindowComponent
  ],
  imports: [
    NgbModule.forRoot(),
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    JsonpModule,
    HttpModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
