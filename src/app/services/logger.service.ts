import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  constructor() { }

  public log(...objects: any[]) {
    this.invokeConsoleMethod(console.log, objects);
  }

  public warn(...objects: any[]) {
    this.invokeConsoleMethod(console.warn, objects);
  }


  public error(...objects: any[]) {
    this.invokeConsoleMethod(console.error, objects);
  }

  private invokeConsoleMethod(func: Function, objects: any[]) {
    if (!environment.production) {
      func.apply(console, objects);
    }
  }

}
