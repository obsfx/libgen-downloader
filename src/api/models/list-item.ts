import { Entry } from "./entry";

export enum IResultListItemType {
  Entry,
  Option,
}

export interface OptionItemSettings {
  disabled?: boolean;
  showSpinner?: boolean;
}

export interface OptionItemData extends OptionItemSettings {
  id: string;
  label: string;
  onSelect: () => void;
}

export interface IResultListItemOption {
  type: IResultListItemType.Option;
  data: OptionItemData;
}

export interface IResultListItemEntry {
  type: IResultListItemType.Entry;
  data: Entry;
  order: number;
}

export type ListItem = IResultListItemOption | IResultListItemEntry;
