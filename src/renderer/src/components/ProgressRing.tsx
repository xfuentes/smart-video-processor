/*
 * Smart Video Processor
 * Copyright (c) 2025-2026. Xavier Fuentes <xfuentes-dev@serviam.cc>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { makeStyles, mergeClasses, tokens } from '@fluentui/react-components'

type Props = {
  /** Float between 0 and 1, undefined means indeterminate. */
  value?: number
  /** Diameter in pixels. */
  size?: number
  /** Stroke thickness in pixels. */
  thickness?: number
  label?: string
  className?: string
}

const useStyles = makeStyles({
  root: {
    display: 'inline-block',
    flexShrink: 0,
    lineHeight: 0
  },
  track: {
    stroke: tokens.colorBrandStroke2Contrast,
    fill: 'none'
  },
  arc: {
    stroke: tokens.colorBrandStroke1,
    fill: 'none',
    strokeLinecap: 'round',
    transformOrigin: 'center',
    transitionProperty: 'stroke-dashoffset',
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveEasyEase
  },
  determinate: {
    transform: 'rotate(-90deg)'
  },
  indeterminate: {
    animationName: {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' }
    },
    animationDuration: '1.5s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
    '@media (prefers-reduced-motion: reduce)': {
      animationDuration: '6s'
    }
  }
})

// Circular progress indicator following the Fluent spinner look, with an optional determinate value.
export const ProgressRing = ({ value, size = 16, thickness = 2, label, className }: Props) => {
  const styles = useStyles()
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  const determinate = value !== undefined
  const clamped = determinate ? Math.min(Math.max(value, 0), 1) : 0
  const visibleLength = determinate ? clamped * circumference : circumference * 0.25

  return (
    <span
      role="progressbar"
      aria-label={label}
      aria-valuemin={determinate ? 0 : undefined}
      aria-valuemax={determinate ? 100 : undefined}
      aria-valuenow={determinate ? Math.round(clamped * 100) : undefined}
      className={mergeClasses(styles.root, className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle className={styles.track} cx={size / 2} cy={size / 2} r={radius} strokeWidth={thickness} />
        <circle
          className={mergeClasses(styles.arc, determinate ? styles.determinate : styles.indeterminate)}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={thickness}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - visibleLength}
        />
      </svg>
    </span>
  )
}
