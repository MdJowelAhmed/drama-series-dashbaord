import { useMemo } from "react";

export const Custom3DBarWithWatermark = ({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  fill = "#000",
  dataKey,
  payload,
  maxValues,
}) => {
  const depth = 10;
  const maxValue = maxValues?.[dataKey] || 1;
  const currentValue = payload[dataKey] || 0;
  const scale = maxValue > 0 && currentValue > 0 ? maxValue / currentValue : 1;
  const watermarkHeight = height * scale;
  const watermarkY = y - (watermarkHeight - height);

  return (
    <g>
      <g opacity={0.1}>
        <rect
          x={x}
          y={watermarkY}
          width={width}
          height={watermarkHeight}
          fill={fill}
        />
        <polygon
          points={`${x},${watermarkY} ${x + depth},${watermarkY - depth} ${
            x + width + depth
          },${watermarkY - depth} ${x + width},${watermarkY}`}
          fill={fill}
        />
        <polygon
          points={`${x + width},${watermarkY} ${x + width + depth},${
            watermarkY - depth
          } ${x + width + depth},${watermarkY + watermarkHeight} ${x + width},${
            watermarkY + watermarkHeight
          }`}
          fill={fill}
        />
      </g>
      <rect x={x} y={y} width={width} height={height} fill={fill} opacity={0.4} />
      <polygon
        points={`${x},${y} ${x + depth},${y - depth} ${x + width + depth},${
          y - depth
        } ${x + width},${y}`}
        fill={fill}
        opacity={0.6}
      />
      <polygon
        points={`${x + width},${y} ${x + width + depth},${y - depth} ${
          x + width + depth
        },${y + height} ${x + width},${y + height}`}
        fill={fill}
        opacity={0.7}
      />
    </g>
  );
};

export function useSeriesMaxValues(data, keys) {
  return useMemo(() => {
    const result = {};
    (keys || []).forEach((key) => {
      result[key] = data?.length
        ? Math.max(...data.map((d) => Number(d[key] ?? 0)), 1)
        : 1;
    });
    return result;
  }, [data, keys]);
}
