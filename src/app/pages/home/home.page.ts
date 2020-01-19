import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { CalendarState, DateRangeCalendarPage } from '../date-range-calendar/date-range-calendar.page';
import { UIService } from '../../services/ui.service';
import { LoggerService } from '../../services/logger.service';
import { FilterBtnConstants } from '../date-range-calendar/calendar-filters/calendar-filters';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  calendarData: CalendarState = {
    dateFrom: null,
    dateTo: null,
    scrollPosition: 0,
    selectedButtonName: FilterBtnConstants.empthyString
  };
  dateFrom = moment().clone().subtract(29, 'days');
  dateTo = moment();
  constructor(private uiService: UIService,
    private loggerService: LoggerService,
    private modalController: ModalController, ) { }

  public async openCalendar(): Promise<void> {
    // since our modal is async and it will take a little time to open so we can either prevent the user 
    // from opening the modal twice by using our prevent double click directive or alternatively we can prevent them
    // by showing a loading alert.
    // const loader = await this.uiService.showLoading(); // uncomment this line if you want to use loading indicator approach instead of prevent double click directive
    try {
      const modal = await this.modalController.create({
        component: DateRangeCalendarPage, // we are using our calendar page as a modal
        componentProps: {
          previousState: this.calendarData
        }
      });
      await modal.present().then(() => {
        // loader.dismiss();
      });
      modal.onDidDismiss().then((data: any) => {
        if (!data.data) {
          return;
        }
        this.calendarData = data.data['calendarData'];
        if (this.calendarData.dateFrom) {
          this.dateFrom = this.calendarData.dateFrom;
          this.dateTo = this.calendarData.dateTo;
        }
      });
    } catch (err) {
      this.loggerService.error(`HomePage->openCalendar():err`, err);
    }
  }

  public async openCalendarWithNoFiltersAndRestrictedSelection(): Promise<void> {
    const loader = await this.uiService.showLoading();
    try {
      const modal = await this.modalController.create({
        component: DateRangeCalendarPage,
        componentProps: {
          previousState: this.calendarData,
          showFilterBtns: false,
          restrictSelectionTo: 7
        }
      });
      await modal.present().then(() => {
        loader.dismiss();
      });
      modal.onDidDismiss().then((data: any) => {
        if (!data.data) {
          return;
        }
        this.calendarData = data.data['calendarData'];
        if (this.calendarData.dateFrom) {
          this.dateFrom = this.calendarData.dateFrom;
          this.dateTo = this.calendarData.dateTo;
        }
      });
    } catch (err) {
      this.loggerService.error(`HomePage->openCalendarWithNoFiltersAndRestrictedSelection():err`, err);
    }
  }
}
