import type {ClientRect} from '@dnd-kit/core';
import type {SortingStrategy} from '../types';

// To-do: We should be calculating scale transformation
const defaultScale = {
  scaleX: 1,
  scaleY: 1,
};

export const verticalListSortingStrategy: SortingStrategy = ({
  activeIndex,
  activeNodeRect: fallbackActiveRect,
  index,
  clientRects,
  overIndex,
}) => {
  const activeNodeRect = clientRects[activeIndex] ?? fallbackActiveRect;

  if (!activeNodeRect) {
    return null;
  }

  if (index === activeIndex) {
    const overIndexRect = clientRects[overIndex];

    if (!overIndexRect) {
      return null;
    }

    return {
      x: 0,
      y:
        activeIndex < overIndex
          ? overIndexRect.offsetTop +
            overIndexRect.height -
            (activeNodeRect.offsetTop + activeNodeRect.height)
          : overIndexRect.offsetTop - activeNodeRect.offsetTop,
      ...defaultScale,
    };
  }

  const itemGap = getItemGap(clientRects, index, activeIndex);

  if (index > activeIndex && index <= overIndex) {
    return {
      x: 0,
      y: -activeNodeRect.height - itemGap,
      ...defaultScale,
    };
  }

  if (index < activeIndex && index >= overIndex) {
    return {
      x: 0,
      y: activeNodeRect.height + itemGap,
      ...defaultScale,
    };
  }

  return {
    x: 0,
    y: 0,
    ...defaultScale,
  };
};

function getItemGap(
  clientRects: ClientRect[],
  index: number,
  activeIndex: number
) {
  const currentRect: ClientRect | undefined = clientRects[index];
  const previousRect: ClientRect | undefined = clientRects[index - 1];
  const nextRect: ClientRect | undefined = clientRects[index + 1];

  if (!currentRect) {
    return 0;
  }

  if (activeIndex < index) {
    return previousRect
      ? currentRect.offsetTop - (previousRect.offsetTop + previousRect.height)
      : nextRect
      ? nextRect.offsetTop - (currentRect.offsetTop + currentRect.height)
      : 0;
  }

  return nextRect
    ? nextRect.offsetTop - (currentRect.offsetTop + currentRect.height)
    : previousRect
    ? currentRect.offsetTop - (previousRect.offsetTop + previousRect.height)
    : 0;
}
