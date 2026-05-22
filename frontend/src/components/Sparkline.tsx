interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

export default function Sparkline({
  data,
  color = "#185FA5",
  width = 80,
  height = 28,
}: SparklineProps) {
  if (!data || data.length < 2) {
    return <svg width={width} height={height} />;
  }

  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);

  const points = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });

  const pathD = `M${points.join(" L")}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
      <path d={pathD} stroke={color} strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
