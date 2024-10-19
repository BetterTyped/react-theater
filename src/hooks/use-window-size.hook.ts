import { useState } from "react";

import { useWindowEvent } from "./use-window-event.hook";
import { isBrowser } from "constants/browser";

export type WindowWidthType = number;
export type WindowHeightType = number;
export type UseWindowSizeType = [WindowWidthType, WindowHeightType];

const getSize = (): UseWindowSizeType => [
  isBrowser ? window.innerWidth : 0,
  isBrowser ? window.innerHeight : 0,
];

/**
 *
 * @kind 15-Window
 */
export const useWindowSize = (onResize?: (size: UseWindowSizeType) => void) => {
  const [windowSize, setWindowSize] = useState<UseWindowSizeType>(getSize);

  const handleResize = () => {
    const size = getSize();
    setWindowSize(size);
    onResize?.(size);
  };

  useWindowEvent("resize", handleResize);

  return windowSize;
};
