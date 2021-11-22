import {useMemo} from 'react';
import {useNodeRef} from '@dnd-kit/utilities';

import {getMeasurableNode} from '../../utilities/nodes';
import {getTransformAgnosticClientRect} from '../../utilities/rect';
import type {DndContextDescriptor} from '../../store';
import type {ClientRect} from '../../types';

import {createUseRectFn} from './useRect';

interface Arguments {
  measure?(element: HTMLElement): ClientRect;
  disabled: boolean;
  forceRecompute: boolean;
}

export function useDragOverlayMeasuring({
  measure = getTransformAgnosticClientRect,
  disabled,
  forceRecompute,
}: Arguments): DndContextDescriptor['dragOverlay'] {
  const [nodeRef, setRef] = useNodeRef();
  const useDragOverlayRect = useMemo(() => createUseRectFn(measure), [measure]);
  const rect = useDragOverlayRect(
    disabled ? null : getMeasurableNode(nodeRef.current),
    forceRecompute
  );

  return useMemo(
    () => ({
      nodeRef,
      rect,
      setRef,
    }),
    [rect, nodeRef, setRef]
  );
}
