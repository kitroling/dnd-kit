import type {Coordinates, ClientRect} from '../../types';
import {defaultCoordinates} from '../coordinates';

export function getRectDelta(
  rect1: ClientRect | null,
  rect2: ClientRect | null
): Coordinates {
  return rect1 && rect2
    ? {
        x: rect1.offsetLeft - rect2.offsetLeft,
        y: rect1.offsetTop - rect2.offsetTop,
      }
    : defaultCoordinates;
}
