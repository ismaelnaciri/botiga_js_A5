import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
// @ts-ignore
import { TestComponent } from './test/test.component';
import { ActivitatsComponent } from './activitats/activitats.component';

@NgModule({
  declarations: [
    AppComponent,
    TestComponent,
    ActivitatsComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
