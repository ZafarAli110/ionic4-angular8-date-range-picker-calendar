import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { DateRangeCalendarPageRoutingModule } from "./date-range-calendar-routing.module";

import { DateRangeCalendarPage } from "./date-range-calendar.page";


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    DateRangeCalendarPageRoutingModule
  ],
  declarations: [DateRangeCalendarPage]
})
export class DateRangeCalendarPageModule {}
