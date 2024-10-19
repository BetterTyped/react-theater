import { CSSProperties, useCallback, useLayoutEffect, useRef } from "react";

import { useWindowEvent } from "hooks";

export type StyleOptions = {
  scale?: number | string;
  translate?: string | [string, string, string];
  translateX?: string;
  translateY?: string;
  translateZ?: string;
  rotate?: number | string;
} & Omit<CSSProperties, "rotate" | "scale">;

export const useMakeup = <Ref extends HTMLElement = HTMLElement>(props?: {
  onScrollInit?: (props: {
    isBefore: boolean;
    isAfter: boolean;
    setStyle: (styles: StyleOptions) => void;
  }) => void;
}) => {
  const mounted = useRef(false);
  const ref = useRef<Ref>(null);
  const stylesCache = useRef<StyleOptions>({});

  const setStyle = useCallback((styles: StyleOptions) => {
    if (!ref.current) return;

    stylesCache.current = { ...stylesCache.current, ...styles };

    const { scale, translate, translateX, translateY, translateZ, rotate, ...rest } =
      stylesCache.current;

    const transform: string[] = [];
    if (scale) transform.push(`scale(${scale})`);
    if (translate) transform.push(`translate(${translate})`);
    if (translateX) transform.push(`translateX(${translateX})`);
    if (translateY) transform.push(`translateY(${translateY})`);
    if (translateZ) transform.push(`translateZ(${translateZ})`);
    if (rotate) transform.push(`rotate(${rotate}${typeof rotate === "number" ? "deg" : ""})`);

    if (transform.length) {
      ref.current.style.transform = transform.join(" ");
    }

    Object.entries(rest).forEach(([key, value]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ref.current! as Record<string, any>).style[key] = value;
    });
  }, []);

  const handleInitialStyle = useCallback(() => {
    if (!ref.current) return;
    const { top, bottom } = ref.current.getBoundingClientRect();
    const position = window.scrollY;
    const isBefore = position < top;
    const isAfter = bottom < position;

    props?.onScrollInit?.({
      isAfter,
      isBefore,
      setStyle,
    });
  }, []);

  useWindowEvent("scroll", () => {
    if (!mounted.current) {
      handleInitialStyle();
      mounted.current = true;
    }
  });

  useLayoutEffect(() => {
    if (!ref.current) return;
    handleInitialStyle();
  }, []);

  return [ref, setStyle] as const;
};
