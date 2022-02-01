
export interface IHotword {
  trigger: string;
  event: string;
  value?: string;
}

export interface ISonusHotword {
  file: string;
  hotword: string;
  sensitivity: string;
}