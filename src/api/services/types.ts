import type { Clock } from "../availability/clock";
import type { HttpClient } from "../http/http-client";
import type { CrossEncoderModel } from "../resolution/model/cross-encoder-model";
import type { SelectorStore } from "../resolution/store/selector-store";
import type { AttemptOptions } from "../../utilities";

export interface AppServiceOverrides {
  http?: HttpClient;
  selectorStore?: SelectorStore;
  crossEncoder?: CrossEncoderModel | false;
  clock?: Clock;
  downloadRetry?: AttemptOptions;
  random?: () => number;
}
