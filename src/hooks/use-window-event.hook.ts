import { useIsomorphicEffect } from "@better-hooks/performance";

import { isBrowser } from "constants/browser";

export type EventHandler<T extends Event = Event> = (e: T) => void;

export type WindowEventHook = {
  <K extends keyof WindowEventMap>(
    event: K | [K, AddEventListenerOptions],
    handler: EventHandler<WindowEventMap[K]>,
    dependencies?: unknown[],
  ): void;
};

const unpackValue = <K extends keyof WindowEventMap>(
  event: K | [K, AddEventListenerOptions],
): [K, AddEventListenerOptions] => {
  if (typeof event === "string") {
    return [event, {}];
  }
  return event;
};

/**
 *
 * @kind 15-Window
 */
export const useWindowEvent: WindowEventHook = (event, handler, dependencies = []) => {
  useIsomorphicEffect(() => {
    if (!isBrowser) return;

    const [name, options] = unpackValue(event);
    const windowOptions = typeof options === "object" ? options : {};

    window.addEventListener(name, handler, windowOptions);
    return () => {
      window.removeEventListener(name, handler, windowOptions);
    };
  }, [JSON.stringify(event), ...dependencies]);
};
