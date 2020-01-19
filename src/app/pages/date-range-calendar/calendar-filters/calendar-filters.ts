import {
  Component,
  ChangeDetectionStrategy,
  Input,
  NgZone,
  OnInit
} from "@angular/core";
import * as moment from "moment";
import { FormGroup } from "@angular/forms";
import { IonContent } from "@ionic/angular";

export enum FilterBtnConstants {
  empthyString = "",
  today = "Today",
  yesterday = "Yesterday",
  lastSevenDays = "LastSevenDays",
  lastThirtyDays = "LastThirtyDays",
  thisMonth = "ThisMonth",
  lastMonth = "LastMonth"
}

@Component({
  selector: "calendar-filters",
  templateUrl: "calendar-filters.html",
  styleUrls: ["calendar-filters.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarFiltersComponent implements OnInit {
  @Input() scrollMe: IonContent;
  @Input() dateForm: FormGroup;
  @Input() selectedButtonName: FilterBtnConstants;
  @Input() scrollPositionValue: number;
  @Input() valueTop: number;
  @Input() enableDefaultSelection: boolean;

  constructor(private zone: NgZone) { }

  ngOnInit() {
    this.enableDefaultSelection && this.selectLastSevenDays();
  }

  get datesRefGroup(): FormGroup {
    return this.dateForm.get("datesRefGroup") as FormGroup;
  }

  setStartDate = (date: moment.Moment, formattedDate: string): void => {
    this.dateForm.patchValue({
      dateFrom: formattedDate,
      dateTo: formattedDate
    });
    this.datesRefGroup.patchValue({ startDateRef: date });
  };

  setEndDate = (date: moment.Moment, formattedDate: string): void => {
    this.dateForm.patchValue({ dateTo: formattedDate });
    this.datesRefGroup.patchValue({ endDateRef: date });
  };

  private formatDate(date: moment.Moment): string {
    return date.format("DD-MMM-YY");
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
}
