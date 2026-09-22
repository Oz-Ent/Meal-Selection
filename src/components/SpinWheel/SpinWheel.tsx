import { useState, useRef, useEffect } from 'react';
import { createPieSlice } from '../../helpers/pieConvertor';
import { parseMealName } from '../../helpers/parsers';
import { LoaderCircleIcon } from 'lucide-react';

interface Options {
  label: string;
  value: string | number;
}

interface ISpinWheelProps {
  options: Options[];
  onSpinComplete: (value: string | number) => void;
}

const sliceFills = ['var(--color-wheel-slice-1)', 'var(--color-wheel-slice-2)'];
const labelColors = [
  'var(--color-wheel-label-1)',
  'var(--color-wheel-label-2)',
  'var(--color-wheel-label-3)',
  'var(--color-wheel-label-4)',
  'var(--color-wheel-label-5)',
  'var(--color-wheel-label-6)',
];
const WHEEL_RADIUS = 150;
const MAX_LABEL_WIDTH = WHEEL_RADIUS * 0.9;
const LABEL_FONT_SIZE = 13;
const AVERAGE_CHARACTER_WIDTH = LABEL_FONT_SIZE * 0.6;
const MAX_LABEL_CHARACTERS = Math.floor(MAX_LABEL_WIDTH / AVERAGE_CHARACTER_WIDTH);

const truncateLabel = (label: string) =>
  label.length > MAX_LABEL_CHARACTERS
    ? `${label.slice(0, MAX_LABEL_CHARACTERS - 1).trimEnd()}...`
    : label;

export default function SpinWheel({ options, onSpinComplete }: ISpinWheelProps) {
  const [rotation, setRotation] = useState<number>(0);
  const [spinning, setSpinning] = useState<boolean>(false);
  const [winner, setWinner] = useState<Options | null>(null);

  const segmentAngle = 360 / options.length;

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const triggerHaptic = (pattern: number | number[]) => {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator && typeof navigator.vibrate === 'function') {
        navigator.vibrate(pattern);
      }
    } catch {
      // Safe fallback if vibration is unsupported or restricted
    }
  };

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      timeoutsRef.current = [];
    };
  }, []);

  const spin = () => {
    if (spinning) return;

    // Subtle tactile tap on button press
    triggerHaptic(15);
    setSpinning(true);

    const n = options.length;
    const segmentAngle = 360 / n;
    const index = Math.floor(Math.random() * n);

    const sliceCenter = index * segmentAngle + segmentAngle / 2;
    const targetAngle = 360 - sliceCenter;
    const currentAngle = rotation % 360;
    const delta = (targetAngle - currentAngle + 360) % 360;
    const spins = 5 * 360;
    const rotationDelta = spins + delta;

    setRotation((prev) => prev + rotationDelta);

    // Schedule polished decelerating peg ticks during the 5s spin
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];

    const tickDelays = [
      80, 160, 250, 350, 460, 580, 720, 880, 1060, 1260, 1490, 1750, 2040, 2370, 2740, 3150, 3600,
      4100, 4650,
    ];

    tickDelays.forEach((delay) => {
      const timeoutId = setTimeout(() => {
        triggerHaptic(6);
      }, delay);
      timeoutsRef.current.push(timeoutId);
    });

    const completionTimeout = setTimeout(() => {
      setSpinning(false);
      setWinner(options[index]);
      onSpinComplete(options[index].value);
      // Subtle double pulse celebratory landing feedback
      triggerHaptic([20, 50, 30]);
    }, 5000);

    timeoutsRef.current.push(completionTimeout);
  };

  return (
    <section className="flex flex-col items-center gap-8 pb-12 font-sans">
      <div className="relative w-72 h-72 rounded-full shadow-md bg-surface">
        <div className="relative w-72 h-72 items-center flex flex-col gap-4">
          {/* POINTER */}
          <div className="absolute text-xl text-secondary top-0 left-1/2 -translate-x-1/2 z-10 select-none scale-200">
            ▼
          </div>

          <button
            type="button"
            aria-label="Spin"
            disabled={spinning}
            onClick={spin}
            className="absolute top-27 left-27.5 p-2 shadow-md z-20 w-17 h-17 rounded-full bg-secondary border-4 border-[var(--color-wheel-center-border)] text-white hover:scale-95 transition-transform cursor-pointer font-bold text-sm flex items-center justify-center"
          >
            {spinning ? <LoaderCircleIcon className="animate-spin w-5 h-5" /> : 'Spin'}
          </button>

          {/* ROTATING WHEEL */}
          <div
            className="w-full h-full transition-transform duration-5000 ease-in-out"
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: `center`,
            }}
          >
            <svg
              viewBox="0 0 300 300"
              className="w-72 h-72 border-2 border-[var(--color-wheel-border)] p-2 rounded-full bg-surface shadow-lg"
            >
              {options.map((option, i) => {
                const startAngle = i * segmentAngle;
                const endAngle = (i + 1) * segmentAngle;
                const sectorCenterAngle = startAngle + segmentAngle / 2;
                const labelRadius = 82;
                const labelRadians = (sectorCenterAngle - 90) * (Math.PI / 180);
                const labelX = Math.round(150 + labelRadius * Math.cos(labelRadians));
                const labelY = Math.round(150 + labelRadius * Math.sin(labelRadians));
                const radialAngle = (sectorCenterAngle + 90) % 360;
                const labelRotation =
                  radialAngle > 90 && radialAngle < 270 ? (radialAngle + 180) % 360 : radialAngle;

                return (
                  <g key={option.value}>
                    <path
                      d={`${createPieSlice(startAngle, endAngle, 150, 150)}`}
                      fill={sliceFills[i % 2]}
                      stroke="var(--color-wheel-stroke)"
                      strokeWidth={2}
                    />
                    <text
                      x={labelX}
                      y={labelY}
                      fill={labelColors[i % labelColors.length]}
                      fontSize={LABEL_FONT_SIZE}
                      fontWeight="600"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${labelRotation} ${labelX} ${labelY})`}
                    >
                      {truncateLabel(parseMealName(option.label))}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {winner ? (
            <div className="flex flex-col items-center">
              <span className="text-sm text-text-secondary">You Got</span>
              <span className="text-lg font-bold text-text-primary text-center">{winner.label}</span>
            </div>
          ) : (
            <span className="text-sm text-text-secondary font-medium">
              {spinning ? 'Spinning...' : 'Spin the wheel to pick a dish'}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
