import { Entry } from "./Entry";

export enum ResultListItemType {
  Entry,
  Option,
}

export interface ResultListItemOption {
  type: ResultListItemType.Option;
  data: {
    id: string;
    label: string;
    onSelect: () => void;
  };
}

export interface ResultListItemEntry {
  type: ResultListItemType.Entry;
  data: Entry;
  order: number;
}

export type ListItem = ResultListItemOption | ResultListItemEntry;
