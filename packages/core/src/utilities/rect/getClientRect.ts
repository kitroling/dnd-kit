import {Coordinates, getWindow} from '@dnd-kit/utilities';

import type {BoundingRect, ClientRect} from '../../types';
import {
  getScrollableAncestors,
  getScrollOffsets,
  getScrollXOffset,
  getScrollYOffset,
} from '../scroll';
import {inverseTransform} from '../transform';

interface Options {
  ignoreTransform?: boolean;
  scrollOffsets?: Coordinates;
}

function getExtendedClientRect(
  element: HTMLElement,
  options: Options = {ignoreTransform: false}
) {
  let rect: BoundingRect = element.getBoundingClientRect();
  const scrollOffsets =
    options.scrollOffsets ?? getScrollOffsets(getScrollableAncestors(element));

  if (options.ignoreTransform) {
    const {getComputedStyle} = getWindow(element);
    const {transform, transformOrigin} = getComputedStyle(element);

    if (transform) {
      rect = inverseTransform(rect, transform, transformOrigin);
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

/**
 * Returns the bounding client rect of an element relative to the viewport.
 */
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

const properties = [
  ['x', ['left', 'right'], getScrollXOffset],
  ['y', ['top', 'bottom'], getScrollYOffset],
] as const;

export class Rect {
  constructor(element: HTMLElement, options?: Options) {
    const scrollableAncestors = getScrollableAncestors(element);
    const scrollOffsets = getScrollOffsets(scrollableAncestors);
    const rect = getExtendedClientRect(element, {
      ...options,
      scrollOffsets,
    });

    this.width = rect.width;
    this.height = rect.height;
    this.offsetTop = rect.offsetTop;
    this.offsetLeft = rect.offsetLeft;

    for (const [axis, keys, getScrollOffset] of properties) {
      for (const key of keys) {
        Object.defineProperty(this, key, {
          get: () => {
            const currentOffsets = getScrollOffset(scrollableAncestors);
            const scrollOffsetsDeltla = scrollOffsets[axis] - currentOffsets;

            return rect[key] + scrollOffsetsDeltla;
          },
          enumerable: true,
        });
      }
    }
  }

  public width: number;
  public height: number;
  public offsetTop: number;
  public offsetLeft: number;

  // @ts-ignore
  public top: number;
  // @ts-ignore
  public bottom: number;
  // @ts-ignore
  public right: number;
  // @ts-ignore
  public left: number;
}
