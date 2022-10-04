import { useEffect, useRef } from "react";

/**
 * When adding event listeners to components, prefer the React props (onClick, onChange, etc.).
 * This hook is primarily for adding event listeners to the window or another global element.
 *
 * Credit: https://usehooks.com/useEventListener
 */
export function useEventListener(
  eventName: string,
  handler: (event: Event, ...args: any[]) => void,
  element: any = global
) {
  const handlerRef = useRef(handler);

  // any time the handler changes, update the ref
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  const savedHandler = (event: Event, ...args: any[]) =>
    handlerRef.current(event, ...args);

  // only update the listener if the element or the event name changes, NOT if the handler changes
  useEffect(() => {
    if (!element || !element.addEventListener) return;

    element.addEventListener(eventName, savedHandler);

    return function cleanup() {
      element.removeEventListener(eventName, savedHandler);
    };
  }, [element, eventName]);
}
