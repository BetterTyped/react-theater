import { RefObject, useCallback, useLayoutEffect } from "react";
import { useDidMount } from "@better-hooks/lifecycle";

import { useWindowEvent } from "./use-window-event.hook";
import { useWindowSize } from "./use-window-size.hook";

export type NonNullableKeys<T> = {
  [P in keyof T]-?: NonNullable<T[P]>;
};

export type Nullable<T> = T | null | undefined;

type UseScrollPosition = {
  onScroll: (scroll: number) => void;
  fallback?: number;
  ref?: RefObject<HTMLElement>;
};

const getWindowScrollPosition = (options: NonNullableKeys<Pick<UseScrollPosition, "fallback">>) => {
  return typeof window === "undefined" ? options.fallback || 0 : window.scrollY;
};

const getRelativeScrollPosition = (options: NonNullableKeys<UseScrollPosition>) => {
  const { ref, fallback } = options;

  if (!ref.current) return fallback;

  return -ref.current.getBoundingClientRect().top;
};

const getPosition = (
  options: NonNullableKeys<Pick<UseScrollPosition, "fallback">> & Pick<UseScrollPosition, "ref">,
) => {
  if (options.ref) {
    return getRelativeScrollPosition(options as NonNullableKeys<UseScrollPosition>);
  }

  return getWindowScrollPosition(options);
};

export const useScrollPosition = (options: UseScrollPosition) => {
  const { fallback = 0, ref, onScroll } = options || {};

  const handleScroll = useCallback(() => {
    onScroll(getPosition({ fallback, ref }));
  }, []);

  useDidMount(() => {
    handleScroll();
  });

  useLayoutEffect(() => {
    handleScroll();
  }, []);

  useWindowEvent("scroll", handleScroll);
  useWindowSize(handleScroll);
};
