
declare namespace NodeJS {
  export interface Global {
      WidgetHelper: any;
      Logger: any;
      CONFIG_PATH: string;
  }
}

declare var WidgetHelper: any;

declare var Logger: any;