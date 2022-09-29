import {
  MouseEventHandler,
  PropsWithChildren,
  useCallback,
  useRef,
  useState,
} from "react";

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
  const [tooltipTop, setTooltipTop] = useState<number>(0);
  const [tooltipLeft, setTooltipLeft] = useState<number>(0);

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

      const outerTableDimensions = wrapperRef.current?.getBoundingClientRect();
      const currentTableCellDimensions = eventTarget.getBoundingClientRect();

      if (tooltipData) {
        setTooltipData(tooltipData);
        setTooltipOpacity(OPACITY_VISIBLE);
        setTooltipDuration(DURATION);
        setTooltipCursor(CURSOR_HELP);

        // make sure we don't set the tooltip on top of the table headings
        if (wrapperRef.current !== eventTarget) {
          setTooltipTop(
            currentTableCellDimensions.top -
              (outerTableDimensions?.top ?? 0) -
              8
          );
          setTooltipLeft(
            currentTableCellDimensions.left -
              (outerTableDimensions?.left ?? 0) +
              eventTarget.offsetWidth / 2
          );
        }
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
        "--tooltip-left-position": `${tooltipLeft}px`,
        "--tooltip-top-position": `${tooltipTop}px`,
      }}
    >
      {children}
    </div>
  );
};

TooltipController.displayName = "TooltipController";
