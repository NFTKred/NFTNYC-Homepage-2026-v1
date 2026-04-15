import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const IntroSlide: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [0, 30], [30, 0], { extrapolateRight: 'clamp' });
  const labelOpacity = interpolate(frame, [20, 50], [0, 1], { extrapolateRight: 'clamp' });
  const labelY = interpolate(frame, [20, 50], [20, 0], { extrapolateRight: 'clamp' });
  const exitOpacity = interpolate(frame, [duration - 20, duration], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        opacity: exitOpacity,
      }}
    >
      {/* Subtle radial glow */}
      <div
        style={{
          position: 'absolute',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: "'Monument Extended', sans-serif",
            fontSize: 82,
            fontWeight: 700,
            letterSpacing: -2,
            lineHeight: 1,
          }}
        >
          <span style={{ color: '#fff' }}>NFT.NYC</span>
          <span
            style={{
              background: 'linear-gradient(135deg, #3B82F6, #8B5CF6, #EC4899, #F59E0B, #10B981, #06B6D4, #3B82F6)',
              backgroundSize: '300% 300%',
              backgroundPosition: `${frame * 1.5}% 50%`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            2026
          </span>
        </div>
      </div>

      <div
        style={{
          opacity: labelOpacity,
          transform: `translateY(${labelY}px)`,
          marginTop: 40,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: 8,
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          Call for speakers
        </div>
      </div>
    </AbsoluteFill>
  );
};
