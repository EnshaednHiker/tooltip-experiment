import {
  MouseEventHandler,
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import "./styles.css";

const TOOLTIP_CLASSNAME = "tooltip";
const DURATION_LEAVE = "3s";
const DURATION = "1s";
const OPACITY_VISIBLE = "1";
const OPACITY_INVISIBLE = "0";
const CURSOR_HELP = "help";
const CURSOR_AUTO = "auto";
const KEYFRAME_POP_IN = "tooltip-pop-in";
const KEYFRAME_POP_OUT = "tooltip-pop-out";
const INITIAL_ROW_VALUE = "initial";

type Keyframes = typeof KEYFRAME_POP_IN | typeof KEYFRAME_POP_OUT;
type Duration = typeof DURATION_LEAVE | typeof DURATION;

const cancelAnimation = function (requestId: number | undefined) {
  if (requestId) {
    window.cancelAnimationFrame(requestId);
    // animation frames increment numerically, and sometimes the last animation frame can get stuck when moving the mouse quickly
    // removing the 2nd to last frame seems to be a better experience
    window.cancelAnimationFrame(requestId - 1);
  }
  return requestId;
};

export const TooltipController = ({ children }: PropsWithChildren<any>) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const topTooltipRef = useRef<HTMLDivElement>(null);
  const bottomTooltipRef = useRef<HTMLDivElement>(null);

  const [tooltipData, setTooltipData] = useState<string | undefined>();
  const [tooltipOpacity, setTooltipOpacity] = useState<
    typeof OPACITY_INVISIBLE | typeof OPACITY_VISIBLE
  >(OPACITY_INVISIBLE);
  const [tooltipCursor, setTooltipCursor] = useState<
    typeof CURSOR_AUTO | typeof CURSOR_HELP
  >(CURSOR_AUTO);
  const [tooltipTop, setTooltipTop] = useState<number>(0);
  const [tooltipLeft, setTooltipLeft] = useState<number>(0);
  const [row, setRow] = useState<string>(INITIAL_ROW_VALUE);
  const [cursorIsInTableHeadRow, setIsCursorInTableHeadRow] =
    useState<boolean>(true);
  const [animationState, setAnimationState] = useState<
    "reset" | "restart" | "restart-leave"
  >("reset");

  const [animationRequestId, setAnimationRequestId] = useState<
    number | undefined
  >();

  const handleOnMouseLeave = useCallback<MouseEventHandler<HTMLDivElement>>(
    (event) => {
      setTooltipCursor(CURSOR_AUTO);
      setRow(INITIAL_ROW_VALUE);
      if (!cursorIsInTableHeadRow) {
        setAnimationState("restart-leave");
      }
    },
    [cursorIsInTableHeadRow]
  );

  const handleOnMouseOver = useCallback<MouseEventHandler<HTMLDivElement>>(
    (event) => {
      const eventTarget = event.target as HTMLElement;
      const tooltipData = eventTarget.dataset?.tooltip;
      const currentRow = eventTarget.dataset?.row ?? "";

      const isInTableHead = eventTarget.nodeName === "TH";
      const isInTableCell = eventTarget.nodeName === "TD";

      const outerTableDimensions = wrapperRef.current?.getBoundingClientRect();
      const currentTableCellDimensions = eventTarget.getBoundingClientRect();

      if (currentRow !== row) {
        setRow(currentRow);
      }

      if (currentRow !== row && isInTableCell && tooltipData) {
        setAnimationState("restart");
        setTooltipCursor(CURSOR_HELP);
        setIsCursorInTableHeadRow(false);
      }

      if (
        isInTableHead &&
        // when entering table head on initial page load we do not start an animation,
        // only when leaving from in a table cell to the table head should kick off an animation
        row !== "initial" &&
        currentRow !== row &&
        !tooltipData
      ) {
        setAnimationState("restart-leave");
        setTooltipCursor(CURSOR_AUTO);
        setIsCursorInTableHeadRow(true);
      }

      if (tooltipData) {
        setTooltipData(tooltipData);
      }

      // make sure we don't set the tooltip on top of the table headings
      if (isInTableCell && tooltipData) {
        setTooltipTop(
          currentTableCellDimensions.top - (outerTableDimensions?.top ?? 0) - 8
        );
        setTooltipLeft(
          currentTableCellDimensions.left -
            (outerTableDimensions?.left ?? 0) +
            eventTarget.offsetWidth / 2
        );
      }
    },
    [row]
  );

  const handleRequestAnimation = useCallback(
    (animationKeyFrame: Keyframes, animationDuration: Duration) => {
      if (animationKeyFrame === KEYFRAME_POP_IN) {
        setTooltipOpacity(OPACITY_INVISIBLE);
      } else {
        setTooltipOpacity(OPACITY_VISIBLE);
      }

      // cancel any currently running animations before starting a new one.
      // might not be strictly necessary since we're always resetting opacity to the the starting state of both animations
      cancelAnimation(animationRequestId);

      const topTooltipElement = topTooltipRef.current as HTMLElement;
      const bottomTooltipElement = bottomTooltipRef.current as HTMLElement;

      // by setting the animation style to none, we strip out the existing animation,
      // this allows a new animation to placed on the elements and makes it so any animation
      // can be reset over and over again without removing elements from the DOM or removing and placing classNames
      topTooltipElement.style.animation = "none";
      bottomTooltipElement.style.animation = "none";

      if (topTooltipElement && bottomTooltipElement) {
        const requestId = window.requestAnimationFrame(function () {
          topTooltipElement.style.animation = `${animationKeyFrame} ${animationDuration} both`;
          topTooltipElement.style.animationDelay = "100ms";

          bottomTooltipElement.style.animation = `${animationKeyFrame} ${animationDuration} both`;
          bottomTooltipElement.style.animationDelay = "100ms";
        });

        return requestId;
      }
      return undefined;
    },
    [animationRequestId]
  );

  useEffect(() => {
    if (animationState === "reset") {
      // reset exists to allow animationState a state to return to after tripping a new animation
      // and to allow this useEffect to be tripped by state changes going from reset => restart-leave or reset => restart.
      // because this state resets things, we don't actually need to do anything here
    } else if (animationState === "restart") {
      const currentAnimationRequestId = handleRequestAnimation(
        KEYFRAME_POP_IN,
        DURATION
      );
      setAnimationRequestId(currentAnimationRequestId);
      setAnimationState("reset");
    } else if ("restart-leave") {
      const currentAnimationRequestId = handleRequestAnimation(
        KEYFRAME_POP_OUT,
        DURATION_LEAVE
      );
      setAnimationRequestId(currentAnimationRequestId);
      setAnimationState("reset");
    }
  }, [animationState, handleRequestAnimation]);

  return (
    <div className="table-wrapper">
      <div
        className={TOOLTIP_CLASSNAME}
        data-tooltip={tooltipData}
        onMouseLeave={handleOnMouseLeave}
        onMouseOver={handleOnMouseOver}
        ref={wrapperRef}
        style={{
          // @ts-ignore --tooltip custom css properties not allowed
          "--tooltip-opacity": tooltipOpacity,
          "--tooltip-cursor": tooltipCursor,
          "--tooltip-left-position": `${tooltipLeft}px`,
          "--tooltip-top-position": `${tooltipTop}px`,
        }}
      >
        <div
          className="tooltip-top"
          // if the tooltip exposes new information, we'd want to announce that information to screen reader users
          role="alert"
          tabIndex={-1}
          aria-hidden={true}
          ref={topTooltipRef}
        >
          {tooltipData}
        </div>
        <div
          className="tooltip-bottom"
          tabIndex={-1}
          aria-hidden={true}
          ref={bottomTooltipRef}
        />
        {children}
      </div>
    </div>
  );
};

TooltipController.displayName = "TooltipController";
