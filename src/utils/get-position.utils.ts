export const getPosition = ({ scroll, height }: { scroll: number; height: number }) => {
  const position = Math.max(0, Math.min(scroll + window.innerHeight, height));
  const positionOut = Math.max(0, Math.min(scroll + window.innerHeight / 10, height));
  const positionScroll = Math.max(0, Math.min(scroll + window.innerHeight, window.innerHeight));
  const positionScrollOut = Math.max(0, Math.min(scroll + window.innerHeight - height, window.innerHeight));

  return {
    position,
    positionOut,
    positionScroll,
    positionScrollOut,
  };
};
