import type {
  ClientRect,
  UniqueIdentifier,
  UseDndContextReturnValue,
} from '@dnd-kit/core';

export function getSortedRects(
  items: UniqueIdentifier[],
  clientRects: UseDndContextReturnValue['droppableRects']
) {
  return items.reduce<ClientRect[]>((accumulator, id, index) => {
    const clientRect = clientRects.get(id);

    if (clientRect) {
      accumulator[index] = clientRect;
    }

    return accumulator;
  }, Array(items.length));
}
