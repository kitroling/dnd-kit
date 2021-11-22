import type {ClientRect} from '@dnd-kit/core';
import type {Transform} from '@dnd-kit/utilities';

export type SortingStrategy = (args: {
  activeNodeRect: ClientRect | null;
  activeIndex: number;
  index: number;
  clientRects: ClientRect[];
  overIndex: number;
}) => Transform | null;
