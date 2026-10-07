import { AppServices } from "./app-services";

let sharedServices: AppServices | undefined;

export function appServices(): AppServices {
  if (!sharedServices) {
    sharedServices = new AppServices();
  }
  return sharedServices;
}

export function setAppServices(services: AppServices | undefined): void {
  sharedServices = services;
}
