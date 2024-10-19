import React, { useMemo } from "react";

export const mergeRefs = <T = any>(
  ...refs: Array<
    React.MutableRefObject<T> | React.ForwardedRef<T> | React.LegacyRef<T> | null | undefined
  >
): React.RefCallback<T> => {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value);
      } else if (typeof ref === "object" && ref != null) {
        // eslint-disable-next-line no-param-reassign
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    });
  };
};

export function useMergeRefs<T>(
  ...refs: Array<
    React.MutableRefObject<T> | React.ForwardedRef<T> | React.LegacyRef<T> | null | undefined
  >
): React.RefCallback<T> {
  return useMemo(() => {
    if (refs.every((ref) => ref === null)) {
      return () => {};
    }

    return mergeRefs(...refs);
  }, [refs]);
}
