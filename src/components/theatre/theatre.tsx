import { EventEmitter } from "events";
import { useThrottle } from "@better-hooks/performance";
import { FC, createContext, useContext, useMemo, useRef } from "react";

import { useHeight, useScrollPosition } from "hooks";
import { getPosition } from "utils";

export type TheatreValuesType = {
  position: number;
  positionOut: number;
  positionScroll: number;
  positionScrollOut: number;
  progress: number;
  progressOut: number;
  progressScroll: number;
  progressScrollOut: number;
  height: number;
};

export type TheatreContextType = {
  active: boolean;
  onUpdate: (callback: (values: TheatreValuesType) => void) => () => void;
};

export const TheatreContext = createContext<TheatreContextType>({
  active: false,
  onUpdate: () => {
    return () => {};
  },
});

export type TheatreProps = {
  fallbackHeight?: number;
  absolute?: boolean;
  children: React.ReactNode;
};

export const useTheatre = () => {
  return useContext(TheatreContext);
};

export const Theatre: FC<TheatreProps & React.HTMLProps<HTMLDivElement>> = ({
  children,
  fallbackHeight = 1080,
  absolute = false,
  ...divProps
}) => {
  const events = useRef(new EventEmitter()).current;
  const ref = useRef<HTMLDivElement>(null);
  const { throttle } = useThrottle({ interval: 1, timeout: 1 });

  const heightRef = useHeight({
    ref,
    fallback: fallbackHeight,
  });

  useScrollPosition({
    ref: absolute ? undefined : ref,
    onScroll: (scroll) => {
      const height = heightRef.current;
      const { position, positionOut, positionScroll, positionScrollOut } = getPosition({
        scroll,
        height,
      });

      const progress = position / height;
      const progressOut = positionOut / height;
      const progressScroll = positionOut / window.innerHeight;
      const progressScrollOut = positionOut / window.innerHeight;

      const value = {
        position,
        positionOut,
        positionScroll,
        positionScrollOut,
        progress,
        progressOut,
        progressScroll,
        progressScrollOut,
        height,
        active: true,
      };
      throttle(() => {
        events.emit("update", value);
      });
    },
  });

  const value = useMemo(() => {
    return {
      active: true,
      onUpdate: (callback: Parameters<TheatreContextType["onUpdate"]>[0]) => {
        const listener = (context: TheatreValuesType) => {
          callback(context);
        };

        events.addListener("update", listener);
        return () => events.removeListener("update", listener);
      },
    };
  }, [events]);

  return (
    <TheatreContext.Provider value={value}>
      <div {...divProps} ref={ref}>
        {children}
      </div>
    </TheatreContext.Provider>
  );
};
