import { Injectable } from '@angular/core';
import * as moment from 'moment';

export interface month {
  dates: moment.Moment[];
  monthName: string;
  year: string;
}

interface state {
  date: moment.Moment;
  calendar: month[];
}

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  state: state = {
    date: moment(),
    calendar: [
      {
        dates: null,
        monthName: null,
        year: null
      }
    ]
  };

  setState = (nextState: Partial<state>) => {
    this.state = { ...this.state, ...nextState };
  }

  constructor() {
    //this service is a singleton therefore its constructor will only
    //be called once during the application life cycle
    this.initCalendar();
  }

  public getCalendar() {
    return [...this.state.calendar];
  }

  private initCalendar(): void {
    const { date } = this.state;
    const firstMonth = this.generateMonth(date);
    const calendar = [firstMonth];
    const currentDate = moment().clone();
    const dateYearAgo = currentDate.clone().subtract(1, 'year');
    while (date.isSameOrAfter(dateYearAgo)) { // creating one year calendar
      calendar.unshift(this.previousMonth());
    }
    const currentMonthIndex = calendar.length - 1;
    calendar[currentMonthIndex].dates = calendar[currentMonthIndex].dates.filter(this.filterFutureDates);
    this.setState({ calendar: calendar });
  }

  private previousMonth(): month {
    const { date } = this.state;
    const newDate = date.subtract(1, 'month');
    const month = this.generateMonth(newDate);
    this.setState({ date: newDate });
    return month;
  }


  private filterFutureDates(date: moment.Moment) {
    if (!date) {
      return true;
    }
    return date.isSameOrBefore(moment());
  }

  private generateMonth(date: moment.Moment): month {
    const firstDay = moment(date).startOf('month');
    const monthName = moment(date).format('MMM');
    const year = moment(date).format('YYYY');
    const monthLength = date.daysInMonth();
    const totalDatesInMonth = this.generateMonthDates(firstDay, monthLength);
    const emptyCellsBeforeFirstDay = Array(firstDay.weekday()).fill(null);
    const dates = [...emptyCellsBeforeFirstDay, ...totalDatesInMonth];
    return {
      dates,
      monthName,
      year
    };
  }

  private generateMonthDates(firstDay: moment.Moment, length: number): moment.Moment[] {
    return Array(length).fill(null).map((v, i) => moment(firstDay).add(i, 'day'));
  }
}
