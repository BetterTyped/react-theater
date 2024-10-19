import { ActorProps } from "../components/actor/actor";
import { TheatreValuesType } from "../components/theatre/theatre";

const getIsVisible = (context: TheatreValuesType, start: number, end: number) => {
  const startMatch = context.position >= start;
  const endMatch = context.position < end;
  return startMatch && endMatch;
};

export const getScrollProgress = (
  context: TheatreValuesType,
  props: Pick<ActorProps, "start" | "end" | "unmount" | "out" | "screen">,
) => {
  const { start, end, unmount, out, screen } = props;

  const startValue = context.height * start;
  const endValue = context.height * end;
  const startScroll = window.innerHeight * start;
  const endScroll = window.innerHeight * end;

  const height = endValue - startValue;
  const scrollHeight = endScroll - startScroll;
  const isVisible = !unmount || getIsVisible(context, startValue, endValue);

  if (out) {
    const positionOut = context.positionOut - startValue;
    const progressOut = Math.max(0, Math.min(positionOut / height, 1));
    const positionScrollOut = context.positionScrollOut - startScroll;
    const progressScrollOut = Math.max(0, Math.min(positionScrollOut / scrollHeight, 1));

    return {
      position: screen ? positionScrollOut : positionOut,
      progress: screen ? progressScrollOut : progressOut,
      height,
      active: true,
      isVisible,
    };
  }

  const position = context.position - startValue;
  const progress = Math.max(0, Math.min(position / height, 1));
  const positionScroll = context.positionScroll - startScroll;
  const progressScroll = Math.max(0, Math.min(positionScroll / scrollHeight, 1));

  return {
    position: screen ? positionScroll : position,
    progress: screen ? progressScroll : progress,
    height,
    active: true,
    isVisible,
  };
};
