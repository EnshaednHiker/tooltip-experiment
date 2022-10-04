import {
  KeyboardEvent,
  MouseEventHandler,
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useEventListener } from "../../utilities/use-event-listener";

import "./styles.css";

const TOOLTIP_CLASSNAME = "tooltip";
const DURATION_LEAVE = "3s";
const DURATION = "1s";
const DURATION_NONE = "0s";
const OPACITY_VISIBLE = "1";
const OPACITY_INVISIBLE = "0";
const CURSOR_HELP = "help";
const CURSOR_AUTO = "auto";
const KEYFRAME_POP_IN = "tooltip-pop-in";
const KEYFRAME_POP_OUT = "tooltip-pop-out";
const INITIAL_ROW_VALUE = "initial";

type Keyframes = typeof KEYFRAME_POP_IN | typeof KEYFRAME_POP_OUT;
type Duration = typeof DURATION_LEAVE | typeof DURATION | typeof DURATION_NONE;

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

      const animationDirection =
        animationKeyFrame === KEYFRAME_POP_IN ? "forwards" : "forwards";

      const topTooltipElement = topTooltipRef.current as HTMLElement;
      const bottomTooltipElement = bottomTooltipRef.current as HTMLElement;

      if (topTooltipElement && bottomTooltipElement) {
        // by setting the animation style to none, we strip out the existing animation,
        // this allows a new animation to placed on the elements and makes it so any animation
        // can be reset over and over again without removing elements from the DOM or removing and placing classNames
        topTooltipElement.style.animation = "none";
        bottomTooltipElement.style.animation = "none";

        // why we do this: https://css-tricks.com/restart-css-animation/
        void topTooltipElement.offsetWidth;
        void bottomTooltipElement.offsetWidth;

        topTooltipElement.style.animation = `${animationKeyFrame} ${animationDuration} ${animationDirection}`;
        // topTooltipElement.style.animationDelay = "1s";

        bottomTooltipElement.style.animation = `${animationKeyFrame} ${animationDuration} ${animationDirection}`;
        // bottomTooltipElement.style.animationDelay = "1s";
      }
    },
    []
  );

  useEffect(() => {
    if (animationState === "reset") {
      // reset exists to allow animationState a state to return to after tripping a new animation
      // and to allow this useEffect to be tripped by state changes going from reset => restart-leave or reset => restart.
      // because this state resets things, we don't actually need to do anything here
    } else if (animationState === "restart") {
      handleRequestAnimation(KEYFRAME_POP_IN, DURATION);

      setAnimationState("reset");
    } else if ("restart-leave") {
      setTooltipOpacity(OPACITY_VISIBLE);
      handleRequestAnimation(KEYFRAME_POP_OUT, DURATION_LEAVE);

      setAnimationState("reset");
    }
  }, [animationState, handleRequestAnimation]);

  const handleKeydownEventListener = useCallback(function (event: Event) {
    const keyboardEvent = event as unknown as KeyboardEvent;
    console.log("event.code", keyboardEvent.code);
    console.log("event", keyboardEvent);

    if (keyboardEvent.code === "Escape") {
      handleRequestAnimation(KEYFRAME_POP_OUT, DURATION_NONE);
    }
    return undefined as any;
  }, []);

  useEventListener("keydown", handleKeydownEventListener);

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
          role="tooltip"
          aria-hidden={true}
          ref={topTooltipRef}
        >
          {tooltipData}
        </div>
        <div
          className="tooltip-bottom"
          aria-hidden={true}
          ref={bottomTooltipRef}
        />
        {children}
      </div>
    </div>
  );
};

TooltipController.displayName = "TooltipController";

// TODO: I think we might need to have one tooltip component per row, then each component might be responsible for it's own animations. Might be better?
// this could work by setting up an HOC that wraps each row. The TooltipController component will still manage state but then that state will get pumped via
// context to the the HOC which contains the actual tooltip divs. That would mean that the tool tips would each be responsible for their own animations, and
// each tooltip will fully animate regardless of where the mouse cursor currently is. Actually, maybe we only have to forward the refs via context?
// But then again, maybe some logic will get broken out to the HOC? I'm so tired.

// TODO: look into onMouseEnter and onMouseOut to count down to one second before kicking off an animation. Would put this in the Row component and wire that up to context

// var time = 0;
// var hover = 0;
// var out = 0;

// function getInTime() {
//   hover = Date.now();
// }

// function getOutTime() {
//   out = Date.now();
//   time = out-hover;
//   document.getElementById('time').innerHTML = " Show hover time: " + time + 'ms';
// }

/* <button onmouseout="getOutTime()" onmouseenter="getInTime()" >Hover Here</button>
<br /><br />
<button id="time">Hover Time</button> */
