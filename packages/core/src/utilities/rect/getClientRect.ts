import {
  Coordinates,
  getWindow,
  subtract as getCoordinatesDelta,
} from '@dnd-kit/utilities';

import type {ClientRect} from '../../types';
import {getScrollableAncestors, getScrollOffsets} from '../scroll';

type BoundingRect = Omit<ClientRect, 'offsetTop' | 'offsetLeft'>;

interface Options {
  ignoreTransform: boolean;
}

function getBoundingClientRect(
  element: HTMLElement,
  options: Options = {ignoreTransform: false}
) {
  let rect: BoundingRect = element.getBoundingClientRect();
  const scrollableAncestors = getScrollableAncestors(element);
  const scrollOffsets = getScrollOffsets(scrollableAncestors);

  if (options.ignoreTransform) {
    const {getComputedStyle} = getWindow(element);
    const {transform, transformOrigin} = getComputedStyle(element);

    if (transform) {
      rect = inverseTransformMatrix(rect, transform, transformOrigin);
    }
  }

  const {top, left, width, height, bottom, right} = rect;

  return {
    top,
    left,
    width,
    height,
    bottom,
    right,
    offsetTop: top + scrollOffsets.y,
    offsetLeft: left + scrollOffsets.x,
  };
}

export function getClientRect(element: HTMLElement) {
  return new Rect(element);
}

/**
 * Returns the bounding client rect of an element relative to the viewport.
 *
 * @remarks
 * The ClientRect returned by this method does not take into account transforms
 * applied to the element it measures.
 *
 */
export function getTransformAgnosticClientRect(
  element: HTMLElement
): ClientRect {
  return new Rect(element, {ignoreTransform: true});
}

function inverseTransformMatrix(
  rect: BoundingRect,
  transform: string,
  transformOrigin: string
): BoundingRect {
  let ta, sx, sy, dx, dy;

  if (transform.startsWith('matrix3d(')) {
    ta = transform.slice(9, -1).split(/, /);
    sx = +ta[0];
    sy = +ta[5];
    dx = +ta[12];
    dy = +ta[13];
  } else if (transform.startsWith('matrix(')) {
    ta = transform.slice(7, -1).split(/, /);
    sx = +ta[0];
    sy = +ta[3];
    dx = +ta[4];
    dy = +ta[5];
  } else {
    return rect;
  }

  const x = rect.left - dx - (1 - sx) * parseFloat(transformOrigin);
  const y =
    rect.top -
    dy -
    (1 - sy) *
      parseFloat(transformOrigin.slice(transformOrigin.indexOf(' ') + 1));
  const w = sx ? rect.width / sx : rect.width;
  const h = sy ? rect.height / sy : rect.height;

  return {
    width: w,
    height: h,
    top: y,
    right: x + w,
    bottom: y + h,
    left: x,
  };
}

export class Rect {
  public width: number;
  public height: number;
  public offsetTop: number;
  public offsetLeft: number;

  private initialTop: number;
  private initialLeft: number;
  private scrollOffsets: Coordinates;
  private scrollableAncestors: Element[];

  constructor(element: HTMLElement, options?: Options) {
    this.scrollableAncestors = getScrollableAncestors(element);
    this.scrollOffsets = getScrollOffsets(this.scrollableAncestors);
    const rect = getBoundingClientRect(element, options);

    this.width = rect.width;
    this.height = rect.height;
    this.initialLeft = rect.left;
    this.initialTop = rect.top;
    this.offsetLeft = rect.offsetLeft;
    this.offsetTop = rect.offsetTop;
  }

  private get scrollOffsetsDelta() {
    const currentOffsets = getScrollOffsets(this.scrollableAncestors);
    return getCoordinatesDelta(this.scrollOffsets, currentOffsets);
  }

  get top() {
    return this.initialTop + this.scrollOffsetsDelta.y;
  }

  get left() {
    return this.initialLeft + this.scrollOffsetsDelta.x;
  }

  get right() {
    return this.left + this.width;
  }

  get bottom() {
    return this.top + this.height;
  }
}
