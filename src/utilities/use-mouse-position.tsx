import { useEffect, useState } from "react";

export const useMousePosition = ({
  isTouchIncluded,
}: {
  isTouchIncluded: boolean | undefined;
}) => {
  const [mousePosition, setMousePosition] = useState({ x: null, y: null });

  useEffect(() => {
    // TODO: investigate better typing than any here
    const updateMousePosition = (event: any) => {
      let x, y;
      if (event.touches) {
        const touch = event.touches[0];
        [x, y] = [touch.clientX, touch.clientY];
      } else {
        [x, y] = [event.clientX, event.clientY];
      }
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", updateMousePosition);
    if (isTouchIncluded) {
      window.addEventListener("touchmove", updateMousePosition);
    }
    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      if (isTouchIncluded) {
        window.removeEventListener("touchmove", updateMousePosition);
      }
    };
  }, [isTouchIncluded]);
  return mousePosition;
};
