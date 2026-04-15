import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { GeometricArt } from './GeometricArt';

type Shape = 'neural' | 'hexgrid' | 'chain' | 'social' | 'rings' | 'burst' | 'bars' | 'diamond' | 'wave';

export const VerticalSlide: React.FC<{
  name: string;
  subtitle: string;
  color: string;
  shape: Shape;
  index: number;
  duration: number;
}> = ({ name, subtitle, color, shape, duration }) => {
  const frame = useCurrentFrame();
  const totalFrames = duration;

  const enterOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  const exitOpacity = interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opacity = Math.min(enterOpacity, exitOpacity);

  const enterScale = interpolate(frame, [0, 10], [0.9, 1], { extrapolateRight: 'clamp' });
  const artY = interpolate(frame, [0, 10], [20, 0], { extrapolateRight: 'clamp' });
  const textY = interpolate(frame, [3, 13], [25, 0], { extrapolateRight: 'clamp' });
  const textOpacity = interpolate(frame, [3, 13], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        opacity,
      }}
    >
      {/* Color glow background */}
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}25 0%, transparent 70%)`,
          filter: 'blur(80px)',
        }}
      />

      {/* Geometric art */}
      <div
        style={{
          transform: `scale(${enterScale}) translateY(${artY}px)`,
          marginBottom: 30,
        }}
      >
        <GeometricArt shape={shape} color={color} />
      </div>

      {/* Vertical name */}
      <div
        style={{
          opacity: textOpacity,
          transform: `translateY(${textY}px)`,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: "'Monument Extended', sans-serif",
            fontSize: name.length > 20 ? 34 : 42,
            fontWeight: 700,
            color: '#fff',
            textTransform: 'uppercase',
            letterSpacing: -1,
            lineHeight: 1.1,
            maxWidth: 900,
            padding: '0 40px',
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 20,
            fontWeight: 400,
            color: color,
            marginTop: 12,
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}
        >
          {subtitle}
        </div>
      </div>
    </AbsoluteFill>
  );
};
