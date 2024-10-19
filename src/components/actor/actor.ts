import { useCallback, useRef } from "react";
import { useDidMount } from "@better-hooks/lifecycle";

import { TheatreValuesType, useTheatre, useStage } from "components";
import { getScrollProgress } from "utils";

export type ActorProps = {
  start: number;
  end: number;
  out?: boolean;
  screen?: boolean;
  onUpdate: (
    values: Omit<
      TheatreValuesType,
      | "positionOut"
      | "progressOut"
      | "positionScroll"
      | "positionScrollOut"
      | "progressScroll"
      | "progressScrollOut"
    >,
  ) => void;
  /**
   * Unmount the component off stage
   */
  unmount?: boolean;
  children: React.ReactNode | ((context: TheatreValuesType) => React.ReactNode);
};

export const useActor = ({
  onUpdate,
  out,
  screen,
  start,
  end = 0,
}: Omit<ActorProps, "unmount" | "children">) => {
  const theatre = useTheatre();
  const stage = useStage();
  const previous = useRef<number>(0);

  if (!theatre.active && !stage.active) {
    throw new Error("useActor must be placed either inside Stage or Theatre.");
  }

  const handler = useCallback((context: TheatreValuesType) => {
    const output = getScrollProgress(context, {
      start,
      end,
      out,
      screen,
    });

    if (
      (output.progress < 1 && output.progress > 0) ||
      (previous.current && !output.progress) ||
      output.progress > 1
    ) {
      onUpdate(output);
    }

    previous.current = output.progress;
  }, []);

  useDidMount(() => {
    if (stage.active) {
      return stage.onUpdate(handler);
    }
    if (theatre.active) {
      return theatre.onUpdate(handler);
    }
  });
};

export const useActors = (actors: Array<Omit<ActorProps, "unmount" | "children">>) => {
  const theatre = useTheatre();
  const stage = useStage();
  const previous = useRef<number[]>([]);

  if (!theatre.active && !stage.active) {
    throw new Error("useActor must be placed either inside Stage or Theatre.");
  }

  const handler = useCallback((context: TheatreValuesType) => {
    actors.forEach(({ start, end, onUpdate, out, screen }, index) => {
      const output = getScrollProgress(context, {
        start,
        end,
        out,
        screen,
      });

      if (end < start) throw new Error("end must be greater than start");

      if (
        (output.progress < 1 && output.progress > 0) ||
        (previous.current[index] && !output.progress) ||
        (previous.current[index] < 1 && output.progress === 1)
      ) {
        onUpdate(output);
      }

      previous.current[index] = output.progress;
    });
  }, []);

  useDidMount(() => {
    if (stage.active) {
      return stage.onUpdate(handler);
    }
    if (theatre.active) {
      return theatre.onUpdate(handler);
    }
  });
};
