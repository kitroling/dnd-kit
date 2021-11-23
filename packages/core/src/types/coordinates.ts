import type {Coordinates} from '@dnd-kit/utilities';

export type {Coordinates};

export type DistanceMeasurement =
  | number
  | Coordinates
  | Pick<Coordinates, 'x'>
  | Pick<Coordinates, 'y'>;

export type Translate = Coordinates;

export interface BoundingRect {
  width: number;
  height: number;
  top: number;
  left: number;
  right: number;
  bottom: number;
}

export interface ClientRect extends BoundingRect {
  offsetTop: number;
  offsetLeft: number;
}

export interface ScrollCoordinates {
  initial: Coordinates;
  current: Coordinates;
  delta: Coordinates;
}
