import { useCallback, useRef } from "react";
import { useDidMount } from "@better-hooks/lifecycle";

import { useWindowSize } from "./use-window-size.hook";
import { useResize } from "./use-resize.hook";

const getHeight = (ref: React.RefObject<HTMLElement>): number => {
  return ref.current?.offsetHeight || 0;
};

let hydrated = true;

export const useHeight = (options: {
  ref: React.RefObject<HTMLElement>;
  onResize?: () => void;
  fallback?: number;
}) => {
  const { fallback = 1080, ref } = options || {};
  const heightRef = useRef(hydrated ? getHeight(ref) : fallback);

  const handleGetHeight = useCallback(() => {
    heightRef.current = getHeight(ref);
  }, []);

  useDidMount(() => {
    handleGetHeight();
    hydrated = true;
  });

  useWindowSize(() => {
    if (!ref) {
      handleGetHeight();
    }
  });

  useResize(ref?.current, () => {
    handleGetHeight();
  });

  return heightRef;
};
