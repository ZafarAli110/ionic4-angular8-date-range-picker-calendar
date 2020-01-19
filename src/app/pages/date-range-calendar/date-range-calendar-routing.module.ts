import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DateRangeCalendarPage } from './date-range-calendar.page';

const routes: Routes = [
  {
    path: '',
    component: DateRangeCalendarPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DateRangeCalendarPageRoutingModule {}
