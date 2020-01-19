import { 
  Component, 
  OnInit, 
  Input, 
  ViewChild, 
  ChangeDetectorRef, 
  AfterContentInit, 
  ChangeDetectionStrategy,
  NgZone
} from '@angular/core';
import { IonContent, ModalController, NavParams, DomController } from '@ionic/angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { filter, distinctUntilChanged, tap } from 'rxjs/operators';
import * as moment from 'moment';
import { month, CalendarService } from '../../services/calendar.service';
import { UIService } from '../../services/ui.service';

export enum FilterBtnConstants {
  empthyString = '',
  today = 'Today',
  yesterday = 'Yesterday',
  lastSevenDays = 'LastSevenDays',
  lastThirtyDays = 'LastThirtyDays',
  thisMonth = 'ThisMonth',
  lastMonth = 'LastMonth',
}

interface SubjectType {
  date: moment.Moment;
  event: any;
}

export interface CalendarState {
  dateFrom: moment.Moment;
  dateTo: moment.Moment;
  scrollPosition: number;
  selectedButtonName: FilterBtnConstants;
}

@Component({
  selector: 'app-date-range-calendar',
  templateUrl: './date-range-calendar.page.html',
  styleUrls: ['./date-range-calendar.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateRangeCalendarPage implements OnInit,AfterContentInit {
  @Input() showFilterBtns = true;
  @Input() restrictSelectionTo: number;
  @ViewChild('scrollMe', { static: true }) scrollMe: IonContent;
  public currentDate = moment().clone();
  public dateForm: FormGroup;
  calendar: month[] = [{ dates: null, monthName: null, year: null }];
  selectedButtonName = FilterBtnConstants.empthyString;
  scrollPositionValue = 0;
  valueTop = 6985;  //calculated value of the scrollHeight
  previousState: CalendarState = {
    dateFrom: null,
    dateTo: null,
    scrollPosition: 0,
    selectedButtonName: FilterBtnConstants.empthyString
  };
  subject$ = new Subject<SubjectType>();
  subjectSubscription: Subscription;
  

  constructor(private fb: FormBuilder,
    private modalController: ModalController,
    private navParams: NavParams,
    private uiService: UIService,
    private changeDetectionRef: ChangeDetectorRef,
    private domController: DomController,
    private calendarService: CalendarService,
    private zone: NgZone) {
    this.initDateRangeForm();
    this.previousState = this.navParams.get('previousState');
  }

  private initDateRangeForm(): void {
    this.dateForm = this.fb.group({
      dateFrom: [null, Validators.required],
      dateTo: [null, Validators.required],
      datesRefGroup: this.fb.group({
        startDateRef: [null, Validators.required],
        endDateRef: [null, Validators.required],
      })
    });
  }

  get datesRefGroup(): FormGroup {
    return this.dateForm.get('datesRefGroup') as FormGroup;
  }

  ngOnInit() {
    this.calendar = this.calendarService.getCalendar();
    if (this.previousState.dateFrom) {
      this.setPreviousStateData();
    } else {
      this.selectLastSevenDays();
      this.scrollMe.scrollToPoint(0, this.valueTop, 300);
    }
  }

  ngAfterContentInit() {
    this.subjectSubscription = this.subject$.pipe(
      filter(({ date }) => !!date),
      distinctUntilChanged((prev, curr) => prev.date.isSame(curr.date, 'day')),
      tap(({ event }) => {
        this.selectedButtonName = FilterBtnConstants.empthyString;
        this.domController.read(() => {
          const distanceFromTop = event.target.offsetTop;
          this.scrollPositionValue = distanceFromTop;
        });
      }),
    ).subscribe(({ date }) => {
      const formattedDate = date.format('DD-MMM-YY');
      const areBothDatesSelected = this.datesRefGroup.valid;
      this.when(areBothDatesSelected, this.resetDates);
      const { startDateRef } = this.datesRefGroup.value;
      this.when(!startDateRef, this.setStartDate.bind(null, date, formattedDate));
      const isFutureDate = date.isAfter(startDateRef);
      this.when(isFutureDate, this.setEndDate.bind(null, date, formattedDate));
      this.when(!isFutureDate, this.setStartDate.bind(null, date, formattedDate));
      this.when(this.canSelectionBeRestricted(), this.showRestrictSelectionAlertAndResetDates);
    });

  }

  private setPreviousStateData(): void {
    const { dateFrom, dateTo, scrollPosition, selectedButtonName } = this.previousState;
    this.dateForm.patchValue({
      dateFrom: this.formatDate(dateFrom),
      dateTo: this.formatDate(dateTo)
    });
    this.datesRefGroup.patchValue({
      startDateRef: dateFrom,
      endDateRef: dateTo
    });
    this.scrollPositionValue = scrollPosition;
    this.selectedButtonName = selectedButtonName;
    this.scrollPositionValue ? this.scrollMe && this.scrollMe.scrollToPoint(0, (this.scrollPositionValue - 100), 300)
      : this.scrollMe && this.scrollMe.scrollToPoint(0, this.valueTop, 300);
  }

  noop = () => ({});

  when = (cond: boolean, fn: Function): void => cond ? fn() : this.noop();

  setStartDate = (date: moment.Moment, formattedDate: string): void => {
    this.dateForm.patchValue({ dateFrom: formattedDate, dateTo: formattedDate });
    this.datesRefGroup.patchValue({ startDateRef: date });
  };

  setEndDate = (date: moment.Moment, formattedDate: string): void => {
    this.dateForm.patchValue({ dateTo: formattedDate });
    this.datesRefGroup.patchValue({ endDateRef: date });
  };

  resetDates = (): void => this.datesRefGroup.reset();

  canSelectionBeRestricted = (): boolean => this.restrictSelectionTo && this.datesRefGroup.value.endDateRef && !this.isSelectionInRestrictedRange();

  showRestrictSelectionAlertAndResetDates = (): void => {
    const { startDateRef } = this.datesRefGroup.value;
    this.uiService.showAlertWithDismissCallback('Alert', `Please select ${this.restrictSelectionTo} days`, 'Ok', () => {
      this.datesRefGroup.patchValue({ endDateRef: startDateRef });
      this.setStartDate(startDateRef, this.dateForm.value.dateFrom);
      this.changeDetectionRef.markForCheck();
    });
  }

  public isSelectionInRestrictedRange(): boolean {
    const { endDateRef, startDateRef } = this.datesRefGroup.value;
    const diff = endDateRef && endDateRef.diff(startDateRef, 'days') + 1;
    return diff && diff == this.restrictSelectionTo;
  }

  private formatDate(date: moment.Moment): string {
    return date.format('DD-MMM-YY');
  }

  public isInRange(day: moment.Moment): boolean {
    if (!day) {
      return false;
    }
    const { endDateRef, startDateRef } = this.datesRefGroup.value;
    return day.isBetween(startDateRef, endDateRef, 'day');
  }

  public isSelectionStart(day: moment.Moment): boolean {
    if (!day) {
      return false;
    }
    return day.isSame(this.datesRefGroup.value.startDateRef, 'day');
  }

  public isSelectionEnd(day: moment.Moment): boolean {
    if (!day) {
      return false;
    }
    const { endDateRef, startDateRef } = this.datesRefGroup.value;
    return day.isSame(endDateRef, 'day') && endDateRef.isAfter(startDateRef, 'day');
  }

  public isStartAndEndDateSame(): boolean {
    return this.dateForm.value.dateFrom == this.dateForm.value.dateTo;
  }

  public selectThisMonth(): void {
    this.selectedButtonName = FilterBtnConstants.thisMonth;
    this.scrollPositionValue = this.valueTop;
    this.scrollToBottom();
    const firstDay = moment().clone().startOf("month");
    const lastDay = moment().clone();
    this.setStartDate(firstDay, this.formatDate(firstDay));
    this.setEndDate(lastDay, this.formatDate(lastDay));
  }

  public selectLastMonth(): void {
    this.scrollToBottom();
    this.selectedButtonName = FilterBtnConstants.lastMonth;
    this.scrollPositionValue = this.valueTop;
    const lastMonth = moment().clone().subtract(1, "month");
    const firstDay = lastMonth.clone().startOf("month");
    const lastDay = lastMonth.clone().endOf("month");
    this.setStartDate(firstDay, this.formatDate(firstDay));
    this.setEndDate(lastDay, this.formatDate(lastDay));
  }

  public selectLastThirtyDays(): void {
    this.selectedButtonName = FilterBtnConstants.lastThirtyDays;
    this.scrollPositionValue = this.valueTop;
    this.scrollToBottom();
    this.filterSelectionByDaysAgo(29);
  }

  public selectLastSevenDays(): void {
    this.selectedButtonName = FilterBtnConstants.lastSevenDays;
    this.scrollPositionValue = this.valueTop;
    this.scrollToBottom();
    this.filterSelectionByDaysAgo(6);
  }

  private filterSelectionByDaysAgo(daysAgo: number): void {
    const endDate = moment().clone();
    const startDate = endDate.clone().subtract(daysAgo, "days");
    this.setStartDate(startDate, this.formatDate(startDate));
    this.setEndDate(endDate, this.formatDate(endDate));
  }

  public selectYesterday(): void {
    this.selectedButtonName = FilterBtnConstants.yesterday;
    this.scrollPositionValue = this.valueTop;
    this.scrollToBottom();
    const yesterday = moment().clone().subtract(1, "days");
    this.setStartDate(yesterday, this.formatDate(yesterday));
    this.setEndDate(yesterday, this.formatDate(yesterday));
  }

  public selectToday(): void {
    this.selectedButtonName = FilterBtnConstants.today;
    this.scrollPositionValue = this.valueTop;
    this.scrollToBottom();
    const today = moment().clone();
    this.setStartDate(today, this.formatDate(today));
    this.setEndDate(today, this.formatDate(today));
  }

  private scrollToBottom(): void {
    this.zone.runOutsideAngular(() => {
      setTimeout(() => {
        this.scrollMe && this.scrollMe.scrollToBottom(300);
      });
    });
  }

  public dismissPage(): void {
    this.unsubscribe();
    this.modalController.dismiss();
  }

  private unsubscribe(): void {
    this.subjectSubscription.unsubscribe();
  }

  public applyDates(): void {
    const { endDateRef, startDateRef } = this.datesRefGroup.value;
    const endDate = endDateRef;
    const data: CalendarState = {
      dateFrom: startDateRef,
      dateTo: endDate ? endDate : startDateRef,
      scrollPosition: this.scrollPositionValue,
      selectedButtonName: this.selectedButtonName
    };
    this.unsubscribe();
    this.modalController.dismiss({
      calendarData: data
    });
  }
}
