import { Entry } from "./Entry";

export enum IResultListItemType {
  Entry,
  Option,
}

export interface IResultListItemOption {
  type: IResultListItemType.Option;
  data: {
    id: string;
    label: string;
    onSelect: () => void;
  };
}

export interface IResultListItemEntry {
  type: IResultListItemType.Entry;
  data: Entry;
  order: number;
}

export type ListItem = IResultListItemOption | IResultListItemEntry;
