/*!
 * long-press-event
 * Pure JavaScript long-press-event
 * https://github.com/john-doherty/long-press-event
 * @author John Doherty <www.johndoherty.info>
 * @license MIT
 */

import { Platform } from "obsidian";

import type ALxFolderNote from "../fn-main";

// local timer object based on rAF
let timer: {
  value: number;
} | null = null;

// track number of pixels the mouse moves during long press
let startX = 0; // mouse x position when timer started
let startY = 0; // mouse y position when timer started
const maxDiffX = 10; // max number of X pixels the mouse can move during long press before it is canceled
const maxDiffY = 10; // max number of Y pixels the mouse can move during long press before it is canceled

/**
 * Behaves the same as setTimeout except uses requestAnimationFrame() where possible for better performance
 * @param {function} fn The callback function
 * @param {int} delay The delay in milliseconds
 * @returns {object} handle to the timeout object
 */
const requestTimeout = (fn: Function, delay: number): { value: number } => {
  const start = new Date().getTime();
  const handle: { value?: number } = {};

  const loop = () => {
    const current = new Date().getTime();
    const delta = current - start;

    if (delta >= delay) {
      fn();
    } else {
      handle.value = requestAnimationFrame(loop);
    }
  };

  handle.value = requestAnimationFrame(loop);

  return handle as Required<typeof handle>;
};

/**
 * Behaves the same as clearTimeout except uses cancelRequestAnimationFrame() where possible for better performance
 * @param {object} handle The callback function
 * @returns {void}
 */
const clearRequestTimeout = (handle: typeof timer) => {
  handle && cancelAnimationFrame(handle.value);
};

/**
 * method responsible for clearing a pending long press timer
 * @returns {void}
 */
const clearLongPressTimer = () => {
  clearRequestTimeout(timer);
  timer = null;
};

export type LongPressEvent = CustomEvent<{ clientX: number; clientY: number }>;

/**
 * Fires the 'long-press' event on element
 * @param originalEvent The original event being fired
 * @returns {void}
 */
const fireLongPressEvent = (originalEvent: PointerEvent): void => {
  clearLongPressTimer();

  // fire the long-press event
  const allowClickEvent = originalEvent.target?.dispatchEvent(
    new CustomEvent("long-press", {
      bubbles: true,
      cancelable: true,

      // custom event data (legacy)
      detail: {
        clientX: originalEvent.clientX,
        clientY: originalEvent.clientY,
      },

      // add coordinate data that would typically acompany a touch/click event
      // @ts-ignore
      clientX: originalEvent.clientX,
      clientY: originalEvent.clientY,
      offsetX: originalEvent.offsetX,
      offsetY: originalEvent.offsetY,
      pageX: originalEvent.pageX,
      pageY: originalEvent.pageY,
      screenX: originalEvent.screenX,
      screenY: originalEvent.screenY,
    }) as LongPressEvent,
  );

  if (!allowClickEvent) {
    const suppressEvent = (e: Event) => {
      moniterIn?.removeEventListener("click", suppressEvent, true);
      cancelEvent(e);
    };

    // suppress the next click event if e.preventDefault() was called in long-press handler
    moniterIn?.addEventListener("click", suppressEvent, true);
  }
};

/**
 * method responsible for starting the long press timer
 * @param {event} e - event object
 * @returns {void}
 */
const startLongPressTimer = (e: PointerEvent) => {
  clearLongPressTimer();

  const el = e.target as EventTarget;

  // get delay from html attribute if it exists, otherwise default to 800
  const longPressDelayInMs = parseInt(
    getNearestAttribute(el, "data-long-press-delay", "800"),
    10,
  ); // default 800

  // start the timer
  timer = requestTimeout(fireLongPressEvent.bind(el, e), longPressDelayInMs);
};

/**
 * Cancels the current event
 * @param {object} e - browser event object
 * @returns {void}
 */
const cancelEvent = (e: Event) => {
  e.stopImmediatePropagation();
  e.preventDefault();
  e.stopPropagation();
};

/**
 * Starts the timer on mouse down and logs current position
 * @param {object} e - browser event object
 * @returns {void}
 */
const mouseDownHandler = (e: PointerEvent) => {
  startX = e.clientX;
  startY = e.clientY;
  startLongPressTimer(e);
};

/**
 * If the mouse moves n pixels during long-press, cancel the timer
 * @param {object} e - browser event object
 * @returns {void}
 */
const mouseMoveHandler = (e: DragEvent) => {
  clearLongPressTimer();
  // // calculate total number of pixels the pointer has moved
  // let diffX = Math.abs(startX - e.clientX);
  // let diffY = Math.abs(startY - e.clientY);

  // console.log(diffX >= maxDiffX || diffY >= maxDiffY, diffX, diffY);
  // // if pointer has moved more than allowed, cancel the long-press timer and therefore the event
  // if (diffX >= maxDiffX || diffY >= maxDiffY) {
  //   clearLongPressTimer();
  // }
};

/**
 * Gets attribute off HTML element or nearest parent
 * @param {object} el - HTML element to retrieve attribute from
 * @param {string} attributeName - name of the attribute
 * @param {any} defaultValue - default value to return if no match found
 * @returns {any} attribute value or defaultValue
 */
const getNearestAttribute = (
  el: EventTarget | null,
  attributeName: string,
  defaultValue: string,
) => {
  // walk up the dom tree looking for data-action and data-trigger
  while (el instanceof Element && el !== document.documentElement) {
    const attributeValue = el.getAttribute(attributeName);

    if (attributeValue) {
      return attributeValue;
    }

    el = el.parentNode;
  }

  return defaultValue;
};

let moniterIn: HTMLElement | null;

const removeEvtListener = (el: HTMLElement) => {
  moniterIn = null;
  el.removeEventListener("pointerup", clearLongPressTimer, true);
  el.removeEventListener("drag", mouseMoveHandler, true);
  el.removeEventListener("wheel", clearLongPressTimer, true);
  el.removeEventListener("scroll", clearLongPressTimer, true);

  el.removeEventListener("pointerdown", mouseDownHandler, true); // <- start
};

const AddLongPressEvt = (plugin: ALxFolderNote, el: HTMLElement) => {
  // disable on mobile (conflict with file-menu)
  if (!plugin.settings.longPressFocus || Platform.isMobile) return;
  if (moniterIn) {
    removeEvtListener(moniterIn);
  }
  moniterIn = el;
  // hook events that clear a pending long press event
  el.addEventListener("pointerup", clearLongPressTimer, true);
  el.addEventListener("drag", mouseMoveHandler, true);
  el.addEventListener("wheel", clearLongPressTimer, true);
  el.addEventListener("scroll", clearLongPressTimer, true);

  // hook events that can trigger a long press event
  el.addEventListener("pointerdown", mouseDownHandler, true); // <- start

  plugin.register(() => removeEvtListener(el));
};

export default AddLongPressEvt;
