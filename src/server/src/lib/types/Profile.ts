import { IColumn } from "./Config";

export interface IProfile {
  name: string; 
  label: string;
  active: boolean;
  columns?: IColumn[];
  welcome?: string;
}