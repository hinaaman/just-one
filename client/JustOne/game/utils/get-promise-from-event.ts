import { EventType } from "../types";

export function getPromiseFromEvent(event: EventType) {
  return new Promise((resolve) => {
    const listener = (data: any) => {
      document.removeEventListener(event, listener);
      resolve(data);
    };
    document.addEventListener(event, listener);
  });
}
