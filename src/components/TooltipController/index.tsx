import {
  MouseEventHandler,
  PropsWithChildren,
  useCallback,
  useRef,
  useState,
} from "react";

import { useMousePosition } from "../../utilities/use-mouse-position";

import "./styles.css";

const DURATION_LEAVE = "2s";
const DURATION = "0.3s";
const OPACITY_VISIBLE = "1";
const OPACITY_INVISIBLE = "0";
const CURSOR_HELP = "help";
const CURSOR_AUTO = "auto";

export const TooltipController = ({ children }: PropsWithChildren<any>) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [tooltipData, setTooltipData] = useState<string | undefined>();
  const [tooltipOpacity, setTooltipOpacity] = useState<
    typeof OPACITY_INVISIBLE | typeof OPACITY_VISIBLE
  >(OPACITY_INVISIBLE);
  const [tooltipDuration, setTooltipDuration] = useState<
    typeof DURATION_LEAVE | typeof DURATION
  >(DURATION);
  const [tooltipCursor, setTooltipCursor] = useState<
    typeof CURSOR_AUTO | typeof CURSOR_HELP
  >(CURSOR_HELP);

  const mousePosition = useMousePosition({ isTouchIncluded: undefined });

  const handleOnMouseLeave = useCallback<MouseEventHandler<HTMLDivElement>>(
    (event) => {
      setTooltipOpacity(OPACITY_INVISIBLE);
      setTooltipDuration(DURATION_LEAVE);
      setTooltipCursor(CURSOR_AUTO);
    },
    []
  );

  const handleOnMouseOver = useCallback<MouseEventHandler<HTMLDivElement>>(
    (event) => {
      const eventTarget = event.target as HTMLElement;
      const tooltipData = eventTarget.dataset?.tooltip;

      if (tooltipData) {
        setTooltipData(tooltipData);
        setTooltipOpacity(OPACITY_VISIBLE);
        setTooltipDuration(DURATION);
        setTooltipCursor(CURSOR_HELP);
      } else {
        setTooltipOpacity(OPACITY_INVISIBLE);
        setTooltipDuration(DURATION_LEAVE);
        setTooltipCursor(CURSOR_AUTO);
      }
    },
    []
  );

  const handleOnMouseEnter = useCallback<MouseEventHandler<HTMLDivElement>>(
    (event) => {
      setTooltipOpacity(OPACITY_VISIBLE);
      setTooltipDuration(DURATION);
      setTooltipCursor(CURSOR_HELP);
    },
    []
  );

  return (
    <div
      className="tooltip"
      data-tooltip={tooltipData}
      onMouseEnter={handleOnMouseEnter}
      onMouseLeave={handleOnMouseLeave}
      onMouseOver={handleOnMouseOver}
      ref={wrapperRef}
      style={{
        // @ts-ignore --tooltip custom css properties not allowed
        "--tooltip-opacity": tooltipOpacity,
        "--tooltip-duration": tooltipDuration,
        "--tooltip-cursor": tooltipCursor,
        "--tooltip-left-position": `${
          mousePosition.x -
          (wrapperRef.current?.getBoundingClientRect()?.left ?? 0) -
          20
        }px`,
        "--tooltip-top-position": `${
          mousePosition.y -
          (wrapperRef.current?.getBoundingClientRect()?.top ?? 0) -
          80
        }px`,
      }}
    >
      {children}
    </div>
  );
};

TooltipController.displayName = "TooltipController";
