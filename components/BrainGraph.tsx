// components/BrainGraph.tsx
import React from "react";
import { View } from "react-native";
import Svg, {
  Polyline,
  Line,
  Circle,
  G,
  LinearGradient as SvgGradient,
  Defs,
  Stop,
} from "react-native-svg";
import Colors from "@/constants/colors";

interface BrainGraphProps {
  data: number[];
  height?: number;
  width?: number;
  color?: string;
  fillColor?: string;
  showDots?: boolean;
  strokeWidth?: number;
}

export default function BrainGraph({
  data,
  height = 120,
  width = 300,
  color = "#00D4AA",
  fillColor,
  showDots = false,
  strokeWidth = 2,
}: BrainGraphProps) {
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const normalize = (value: number) => {
    return height - ((value - min) / range) * height;
  };

  const stepX = width / (data.length - 1);

  const points = data
    .map((value, index) => {
      const x = index * stepX;
      const y = normalize(value);
      return `${x},${y}`;
    })
    .join(" ");

  // For area fill, we need a closed polygon: start at bottom-left, then points, then bottom-right.
  const areaPoints = fillColor
    ? `0,${height} ${points} ${width},${height}`
    : "";

  return (
    <View>
      <Svg width={width} height={height}>
        {fillColor && (
          <>
            <Defs>
              <SvgGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={color} stopOpacity="0.3" />
                <Stop offset="1" stopColor={color} stopOpacity="0" />
              </SvgGradient>
            </Defs>
            <Polyline points={areaPoints} fill="url(#grad)" stroke="none" />
          </>
        )}
        <Polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
        />
        {showDots &&
          data.map((value, index) => {
            const x = index * stepX;
            const y = normalize(value);
            return (
              <Circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill={color}
                stroke={Colors.background}
                strokeWidth="1.5"
              />
            );
          })}
      </Svg>
    </View>
  );
}
