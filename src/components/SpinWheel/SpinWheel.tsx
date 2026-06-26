import { useState } from "react";
import { createPieSlice } from "../../helpers/pieConvertor";
import Button from "../Button/Button";


interface Options{
    label: string
    value: string | number
}

interface ISpinWheelProps{
    options: Options[]
    onSpinComplete: (value: string| number)=> void
}

const colors =[
    'red','yellow','blue','green','purple','amber'
]
export default function SpinWheel({options, onSpinComplete}:ISpinWheelProps){
    const [rotation,setRotation]= useState<number>(0);
    const [spinning, setSpinning] = useState<boolean>(false)

    const segmentAngle = 360 / options.length

const spin = () => {
  if (spinning) return;

  setSpinning(true);

  const n = options.length;
  const segmentAngle = 360 / n;

  const index = Math.floor(Math.random() * n);

  const sliceCenter =
    index * segmentAngle +
    segmentAngle / 2;

  const targetAngle =
    360 - sliceCenter;

  const currentAngle =
    rotation % 360;

  const delta =
    (targetAngle - currentAngle + 360) % 360;

  const spins = 5 * 360;

  const rotationDelta =
    spins + delta;

  setRotation(prev => prev + rotationDelta);

  setTimeout(() => {
    setSpinning(false);
    onSpinComplete(options[index].value);
  }, 5000);
};

    return(
        <>
            <div className="relative w-72 h-72">

            {/* POINTER */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
            ▼
            </div>

            {/* ROTATING WHEEL */}
            <div
            className="w-full h-full transition-transform duration-5000 ease-in-out"
            style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: `center`
            }}
            >
            <svg viewBox="0 0 300 300" className="w-72 h-72">
                {options.map((_, i)=>{
                    const startAngle = (i * segmentAngle);
                    const endAngle = (i+1) * segmentAngle;

                    return(
                        <path
                        key={i}
                        d={
                            `${createPieSlice(
                                startAngle,
                                endAngle,
                                150,
                                150
                            )}`
                        }
                        fill={colors[i% colors.length]}
                        />
                    )
                } )}
            </svg>
            </div>

            </div>

        <Button label={spinning? 'Spinning': 'Spin'} onClick={spin}/>
        </>
    )
}