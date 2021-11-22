import {
  closestCorners,
  getScrollableAncestors,
  KeyboardCode,
  DroppableContainer,
  KeyboardCoordinateGetter,
} from '@dnd-kit/core';

const directions: string[] = [
  KeyboardCode.Down,
  KeyboardCode.Right,
  KeyboardCode.Up,
  KeyboardCode.Left,
];

export const sortableKeyboardCoordinates: KeyboardCoordinateGetter = (
  event,
  {context: {active, droppableContainers, translatedRect, scrollableAncestors}}
) => {
  if (directions.includes(event.code)) {
    event.preventDefault();

    if (!active || !translatedRect) {
      return;
    }

    const filteredContainers: DroppableContainer[] = [];

    droppableContainers.getEnabled().forEach((entry) => {
      if (!entry || entry?.disabled) {
        return;
      }

      const rect = entry?.rect.current;

      if (!rect) {
        return;
      }

      switch (event.code) {
        case KeyboardCode.Down:
          if (translatedRect.top + translatedRect.height <= rect.top) {
            filteredContainers.push(entry);
          }
          break;
        case KeyboardCode.Up:
          if (translatedRect.top >= rect.top + rect.height) {
            filteredContainers.push(entry);
          }
          break;
        case KeyboardCode.Left:
          if (translatedRect.left >= rect.left + rect.width) {
            filteredContainers.push(entry);
          }
          break;
        case KeyboardCode.Right:
          if (translatedRect.left + translatedRect.width <= rect.left) {
            filteredContainers.push(entry);
          }
          break;
      }
    });

    const closestId = closestCorners({
      active,
      collisionRect: translatedRect,
      droppableContainers: filteredContainers,
    });

    if (closestId) {
      const newDroppable = droppableContainers.get(closestId);
      const newNode = newDroppable?.node.current;
      const newRect = newDroppable?.rect.current;

      if (newNode && newRect) {
        const newScrollAncestors = getScrollableAncestors(newNode);
        const hasDifferentScrollAncestors = newScrollAncestors.some(
          (element, index) => scrollableAncestors[index] !== element
        );
        const offset = hasDifferentScrollAncestors
          ? {
              x: 0,
              y: 0,
            }
          : {
              x: translatedRect.width - newRect.width,
              y: translatedRect.height - newRect.height,
            };
        const newCoordinates = {
          x: newRect.left - offset.x,
          y: newRect.top - offset.y,
        };

        return newCoordinates;
      }
    }
  }

  return undefined;
};
