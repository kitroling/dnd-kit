import {useCallback, useEffect, useRef, useState} from 'react';
import {useLazyMemo} from '@dnd-kit/utilities';

import {getTransformAgnosticClientRect} from '../../utilities';
import type {DroppableContainer, ClientRectMap} from '../../store/types';
import type {ClientRect} from '../../types';

interface Arguments {
  dragging: boolean;
  dependencies: any[];
  config: Partial<DroppableMeasuring> | undefined;
}

export enum MeasuringStrategy {
  Always,
  BeforeDragging,
  WhileDragging,
}

export enum MeasuringFrequency {
  Optimized = 'optimized',
}

type MeasuringFunction = (element: HTMLElement) => ClientRect;

export interface DroppableMeasuring {
  measure: MeasuringFunction;
  strategy: MeasuringStrategy;
  frequency: MeasuringFrequency | number;
}

const defaultValue: ClientRectMap = new Map();

const defaultConfig: DroppableMeasuring = {
  measure: getTransformAgnosticClientRect,
  strategy: MeasuringStrategy.WhileDragging,
  frequency: MeasuringFrequency.Optimized,
};

export function useDroppableMeasuring(
  containers: DroppableContainer[],
  {dragging, dependencies, config}: Arguments
) {
  const [willRecomputeLayouts, setWillRecomputeLayouts] = useState(false);
  const {frequency, measure, strategy} = {
    ...defaultConfig,
    ...config,
  };
  const containersRef = useRef(containers);
  const recomputeLayouts = useCallback(() => setWillRecomputeLayouts(true), []);
  const recomputeLayoutsTimeoutId = useRef<NodeJS.Timeout | null>(null);
  const disabled = isDisabled();
  const clientRectMap = useLazyMemo<ClientRectMap>(
    (previousValue) => {
      if (disabled && !dragging) {
        return defaultValue;
      }

      if (
        !previousValue ||
        previousValue === defaultValue ||
        containersRef.current !== containers ||
        willRecomputeLayouts
      ) {
        for (let container of containers) {
          if (!container) {
            continue;
          }

          container.rect.current = container.node.current
            ? measure(container.node.current)
            : null;
        }

        return createClientRectMap(containers);
      }

      return previousValue;
    },
    [containers, dragging, disabled, measure, willRecomputeLayouts]
  );

  useEffect(() => {
    containersRef.current = containers;
  }, [containers]);

  useEffect(() => {
    if (willRecomputeLayouts) {
      setWillRecomputeLayouts(false);
    }
  }, [willRecomputeLayouts]);

  useEffect(
    function recompute() {
      if (disabled) {
        return;
      }

      requestAnimationFrame(recomputeLayouts);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dragging, disabled]
  );

  useEffect(
    function forceRecomputeLayouts() {
      if (
        disabled ||
        typeof frequency !== 'number' ||
        recomputeLayoutsTimeoutId.current !== null
      ) {
        return;
      }

      recomputeLayoutsTimeoutId.current = setTimeout(() => {
        recomputeLayouts();
        recomputeLayoutsTimeoutId.current = null;
      }, frequency);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [frequency, disabled, recomputeLayouts, ...dependencies]
  );

  return {
    clientRectMap,
    recomputeLayouts,
    willRecomputeLayouts,
  };

  function isDisabled() {
    switch (strategy) {
      case MeasuringStrategy.Always:
        return false;
      case MeasuringStrategy.BeforeDragging:
        return dragging;
      default:
        return !dragging;
    }
  }
}

function createClientRectMap(
  containers: DroppableContainer[] | null
): ClientRectMap {
  const clientRectMap: ClientRectMap = new Map();

  if (containers) {
    for (const container of containers) {
      if (!container) {
        continue;
      }

      const {id, rect} = container;

      if (rect.current == null) {
        continue;
      }

      clientRectMap.set(id, rect.current);
    }
  }

  return clientRectMap;
}
