function polarToCartesian(
    centerX: number,
    centerY: number,
    angle: number,
    radius:number,
){
    const radians = (angle-90) * (Math.PI /180)
    return(
        {
            x: centerX + radius * Math.cos(radians),
            y: centerY + radius * Math.sin(radians)
        }
    )
}

export function createPieSlice(
    startAngle: number,
    endAngle: number,
    radius: number,
    label: string,
    center: number
){
    const start = polarToCartesian(
    center,
    center,
    endAngle,
    radius,
  );

  const end = polarToCartesian(
    center,
    center,
    startAngle,
    radius,
  );

  const largeArcFlag = endAngle - startAngle <= 180 ? 0: 1;

    return `
    M ${center} ${center}
    L ${start.x} ${start.y}
    A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}
    Z
  `;
}