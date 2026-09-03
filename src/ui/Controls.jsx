import React, { useEffect, useRef } from 'react';
import * as I from 'lucide-react';

/**
 * Large touch stepper: a big central value with − / + buttons on either side.
 * No keyboard required. Holding either button repeats the step automatically
 * (long-press-to-repeat) so large changes don't need many taps.
 */
export function Stepper({ label, value, onChange, step = 1, min = 0, max = 999, unit = '' }) {
  const holdTimer = useRef(null);
  const holdInterval = useRef(null);
  // setInterval's callback closes over whatever `value` was when the hold started; without a
  // ref it would keep re-applying the same stale delta on every tick instead of accumulating.
  const valueRef = useRef(value);
  useEffect(() => { valueRef.current = value; }, [value]);

  const clamp = v => Math.max(min, Math.min(max, v));
  const round = v => Math.round(v * 100) / 100; // avoid float drift from repeated 0.5/2.5 steps
  const bump = dir => {
    const next = clamp(round(valueRef.current + dir * step));
    valueRef.current = next;
    onChange(next);
  };

  const startHold = dir => {
    bump(dir);
    holdTimer.current = setTimeout(() => {
      holdInterval.current = setInterval(() => bump(dir), 90);
    }, 420);
  };
  const endHold = () => { clearTimeout(holdTimer.current); clearInterval(holdInterval.current); };
  useEffect(() => endHold, []);

  return <div className="stepper">
    {label && <span className="stepperLabel">{label}</span>}
    <div className="stepperRow">
      <button type="button" className="stepperBtn" disabled={value <= min}
        onPointerDown={() => startHold(-1)} onPointerUp={endHold} onPointerLeave={endHold}
        aria-label={`Decrease ${label || 'value'}`}><I.Minus size={20} /></button>
      <div className="stepperValue" aria-live="polite">{value}{unit}</div>
      <button type="button" className="stepperBtn" disabled={value >= max}
        onPointerDown={() => startHold(1)} onPointerUp={endHold} onPointerLeave={endHold}
        aria-label={`Increase ${label || 'value'}`}><I.Plus size={20} /></button>
    </div>
  </div>;
}

/** Thumb-friendly segmented control — replaces a <select> for small, fixed option sets like RIR. */
export function SegmentedControl({ label, value, onChange, options }) {
  return <div className="segmented">
    {label && <span className="stepperLabel">{label}</span>}
    <div className="segmentedRow" role="radiogroup" aria-label={label}>
      {options.map(opt => <button type="button" key={opt} role="radio" aria-checked={value === opt}
        className={'segmentedBtn' + (value === opt ? ' active' : '')} onClick={() => onChange(opt)}>{opt}</button>)}
    </div>
  </div>;
}

/**
 * Touch-drag slider for a continuous range (e.g. session length). Built on a native
 * <input type="range"> rather than custom pointer-drag logic — the native control already
 * handles touch, mouse, and keyboard input correctly across browsers; this just restyles it.
 * `marks` are optional reference labels shown under the track (purely visual, don't snap to them).
 */
export function Slider({ label, value, onChange, min, max, step = 1, unit = '', marks }) {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return <div className="sliderWrap">
    {label && <span className="stepperLabel">{label}</span>}
    <div className="sliderValue">{value}{unit}</div>
    <input type="range" className="sliderInput" min={min} max={max} step={step} value={value}
      style={{ '--pct': pct + '%' }}
      onChange={e => onChange(Number(e.target.value))} aria-label={label} />
    {marks && <div className="sliderMarks">{marks.map(m => <span key={m}>{m}</span>)}</div>}
  </div>;
}
