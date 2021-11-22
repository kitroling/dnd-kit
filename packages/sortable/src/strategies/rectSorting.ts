import {arrayMove} from '../utilities';
import type {SortingStrategy} from '../types';

export const rectSortingStrategy: SortingStrategy = ({
  clientRects,
  activeIndex,
  overIndex,
  index,
}) => {
  const newRects = arrayMove(clientRects, overIndex, activeIndex);

  const oldRect = clientRects[index];
  const newRect = newRects[index];

  if (!newRect || !oldRect) {
    return null;
  }

  return {
    x: newRect.offsetLeft - oldRect.offsetLeft,
    y: newRect.offsetTop - oldRect.offsetTop,
    scaleX: newRect.width / oldRect.width,
    scaleY: newRect.height / oldRect.height,
  };
};
