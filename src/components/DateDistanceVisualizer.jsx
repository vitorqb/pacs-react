import React from 'react';
import { DateUtil } from '../utils';
import * as R from 'ramda';

const cssClass = "date-distance-visualizer";

export const propsLens = {
  date1: R.lensPath(["date1"]),
  date2: R.lensPath(["date2"]),
};

/**
 * Returns days between date1 and date2.
 */
export function getDaysBetween(props) {
  const d1 = R.view(propsLens.date1, props);
  const d2 = R.view(propsLens.date2, props);
  return DateUtil.daysBetween(d1, d2);
}

/**
 * Returns the color to display.
 */
export function getColor(daysBetween) {
  const R = Math.round(
    Math.min(
      255,
      Math.max(
        0,
        Math.log(1 + Math.abs(daysBetween)) / 0.02174
      )
    )
  );
  const G = 255 - R;
  const B = 0;
  return `rgb(${R}, ${G}, ${B})`;
}

/**
 * Visualizes the number of days between two dates.
 */
export default function DateDistanceVisualizer(props) {
  const distance = getDaysBetween(props);
  const color = getColor(distance);
  const style = {backgroundColor: color};
  return <span className={cssClass} style={style}>{distance}</span>;
};

