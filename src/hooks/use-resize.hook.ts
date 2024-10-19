import { useWillUnmount } from "@better-hooks/lifecycle";
import { useEffect, useRef, RefObject, RefCallback, useCallback } from "react";

import { NonNullableKeys, Nullable } from "./use-scroll-position.hook";

export type ElementRect = Omit<DOMRect, "toJSON">;

const initialElementRect: ElementRect = {
  width: 0,
  height: 0,
  y: 0,
  x: 0,
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
};

type SubscriberResponse = VoidFunction | void;

function useResolvedElement<T extends HTMLElement>(
  subscriber: (element: T) => SubscriberResponse,
  refOrElement?: T | RefObject<T> | null,
): RefCallback<T> {
  let ref: RefObject<T> | null = null;
  const refElement = useRef<T | null>(null);
  const callbackRefElement = useRef<T | null>(null);
  const lastReportedElementRef = useRef<T | null>(null);
  const cleanupRef = useRef<SubscriberResponse | null>();

  const callSubscriber = useCallback(() => {
    let element: T | null = null;
    if (callbackRefElement.current) {
      element = callbackRefElement.current;
    } else if (refElement.current) {
      element = refElement.current;
    } else if (refOrElement instanceof HTMLElement) {
      element = refOrElement;
    }

    if (lastReportedElementRef.current === element) return;

    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    lastReportedElementRef.current = element;

    if (element) {
      cleanupRef.current = subscriber(element);
    }
  }, [refOrElement, subscriber]);

  const refCallback = useCallback(
    (element: T) => {
      callbackRefElement.current = element;
      callSubscriber();
    },
    [callSubscriber],
  );

  if (refOrElement && !(refOrElement instanceof HTMLElement)) {
    ref = refOrElement;
  }

  useEffect(() => {
    if (ref) {
      refElement.current = ref.current;
    }
    callSubscriber();
  }, [ref, ref?.current, refOrElement]);

  return refCallback;
}

type ResizeHandler<T extends HTMLElement> = (elementRect: ElementRect, element: T) => void;

type HookResponse<T extends HTMLElement> = {
  ref: RefCallback<T>;
  elementRect: NonNullableKeys<RefObject<ElementRect>>;
};

export const useResize = <T extends HTMLElement>(
  ref?: Nullable<RefObject<T> | T>,
  onResize?: ResizeHandler<T>,
): HookResponse<T> => {
  const onResizeRef = useRef<ResizeHandler<T> | undefined>(undefined);
  onResizeRef.current = onResize;

  const resizeObserverRef = useRef<ResizeObserver>();

  const rectRef = useRef(initialElementRect);

  const didUnmount = useRef(false);
  useWillUnmount(() => {
    didUnmount.current = true;
  });

  const refCallback = useResolvedElement<T>((element) => {
    if (!resizeObserverRef.current) {
      resizeObserverRef.current = new ResizeObserver((entries: ResizeObserverEntry[]) => {
        if (!Array.isArray(entries) || !entries.length || didUnmount.current) return;

        const newSize = element.getBoundingClientRect();

        if (onResizeRef.current) onResizeRef.current(newSize, element);
        rectRef.current = newSize;
      });
    }

    resizeObserverRef.current.observe(element);

    return () => {
      resizeObserverRef.current?.unobserve(element);
    };
  }, ref);

  return {
    ref: refCallback,
    elementRect: rectRef,
  };
};
