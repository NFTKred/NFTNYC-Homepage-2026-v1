import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const CtaSlide: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();

  const enterOpacity = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: 'clamp' });
  const exitOpacity = interpolate(frame, [duration - 25, duration], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opacity = Math.min(enterOpacity, exitOpacity);

  const ctaY = interpolate(frame, [0, 25], [30, 0], { extrapolateRight: 'clamp' });
  const urlOpacity = interpolate(frame, [15, 40], [0, 1], { extrapolateRight: 'clamp' });
  const urlY = interpolate(frame, [15, 40], [15, 0], { extrapolateRight: 'clamp' });

  const gradientShift = frame * 2;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        opacity,
      }}
    >
      {/* Multi-color glow */}
      <div
        style={{
          position: 'absolute',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: `conic-gradient(from ${gradientShift}deg, #3B82F620, #8B5CF620, #EC489920, #F59E0B20, #10B98120, #06B6D420, #3B82F620)`,
          filter: 'blur(80px)',
        }}
      />

      <div
        style={{
          transform: `translateY(${ctaY}px)`,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: "'Monument Extended', sans-serif",
            fontSize: 72,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: -2,
            lineHeight: 1.1,
            background: 'linear-gradient(135deg, #3B82F6, #8B5CF6, #EC4899, #F59E0B, #10B981, #06B6D4, #3B82F6)',
            backgroundSize: '300% 300%',
            backgroundPosition: `${gradientShift}% 50%`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Apply now
        </div>
      </div>

      <div
        style={{
          opacity: urlOpacity,
          transform: `translateY(${urlY}px)`,
          marginTop: 35,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 28,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.8)',
            letterSpacing: 1,
          }}
        >
          NFT.NYC/speak
        </div>
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 16,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.4)',
            marginTop: 15,
            letterSpacing: 4,
            textTransform: 'uppercase',
          }}
        >
          The community votes
        </div>
      </div>
    </AbsoluteFill>
  );
};
