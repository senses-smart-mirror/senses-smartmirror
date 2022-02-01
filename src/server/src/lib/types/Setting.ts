
// option
export interface IOption {
  name: string;
  value: string;
}

// basic setting
export interface IBasicSetting {
  name: string;
  value: string | number | boolean | undefined;
  valueLabel?: string | number | boolean | undefined;
}

// setting
export interface ISetting {
  name: string;
  label: string;
  type: string;
  description: string;

  scramble?: boolean;
  placeholder?: string;
  link?: string;
  value?: string | number | boolean | undefined | string[];
  defaultValue?: string | boolean | number;
  options?: IOption[];
  items?: any[];
  disabled?: boolean;
  displayOnly?: boolean;
  order?: number;
  min?: number;
  max?: number;
  buttonLabel?: string;
  listLabel?: string;
  hide?: boolean;
  validation?: {[key:string]: string | number};
  socketInfo?: {emitter: string, subscribe: string};
  dependsOn?: string;
  optionsProperty?: string[];
}