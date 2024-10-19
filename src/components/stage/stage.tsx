import React, { HTMLProps, createContext, forwardRef, useContext, useMemo, useRef } from "react";
import { EventEmitter } from "events";
import { useThrottle } from "@better-hooks/performance";

import { TheatreContextType, TheatreValuesType } from "components";
import { useScrollPosition, useHeight } from "hooks";
import { getPosition } from "utils";
import { useMergeRefs } from "hooks/use-merge-refs";

export const StageContext = createContext<TheatreContextType>({
  active: false,
  onUpdate: () => {
    return () => {};
  },
});

export type StageProps = {
  children: React.ReactNode;
  fallbackHeight?: number;
} & HTMLProps<HTMLDivElement>;

export const useStage = () => {
  return useContext(StageContext);
};

export const Stage = forwardRef<HTMLDivElement, StageProps>(
  ({ children, fallbackHeight = 1080, ...divProps }, mainRef) => {
    const events = useRef(new EventEmitter()).current;
    const ref = useRef<HTMLDivElement>(null);
    const mergedRefs = useMergeRefs(ref, mainRef);
    const { throttle } = useThrottle({ interval: 1, timeout: 1 });

    const heightRef = useHeight({
      ref,
      fallback: fallbackHeight,
    });

    useScrollPosition({
      ref,
      onScroll: (scroll) => {
        const height = heightRef.current;
        const { position, positionOut, positionScroll, positionScrollOut } = getPosition({
          scroll,
          height,
        });

        const progress = position / height;
        const progressOut = positionOut / height;
        const progressScroll = positionScroll / window.innerHeight;
        const progressScrollOut = positionScrollOut / window.innerHeight;

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
    }, []);

    return (
      <StageContext.Provider value={value}>
        <div {...divProps} ref={mergedRefs}>
          {children}
        </div>
      </StageContext.Provider>
    );
  },
);
