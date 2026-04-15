import { AbsoluteFill, useCurrentFrame, interpolate, Sequence } from 'remotion';
import { IntroSlide } from './components/IntroSlide';
import { VerticalSlide } from './components/VerticalSlide';
import { CtaSlide } from './components/CtaSlide';

const VERTICALS = [
  { name: 'AI Agent Identity', subtitle: 'ERC-8004 Reputation', color: '#3B82F6', shape: 'neural' as const },
  { name: 'On-chain Infrastructure', subtitle: 'ENS, L1/L2, ZK Identity', color: '#06B6D4', shape: 'chain' as const },
  { name: 'Social NFTs', subtitle: 'Collaborative Art', color: '#EC4899', shape: 'social' as const },
  { name: 'Creator and IP Economy', subtitle: 'Community-Owned IP', color: '#F59E0B', shape: 'burst' as const },
  { name: 'Gaming and Virtual Worlds', subtitle: 'Player-Owned Assets', color: '#8B5CF6', shape: 'hexgrid' as const },
  { name: 'NFT Communities', subtitle: 'Identity & Belonging', color: '#EF4444', shape: 'rings' as const },
  { name: 'DeFi and Capital Markets', subtitle: 'NFT Lending & RWA', color: '#10B981', shape: 'bars' as const },
  { name: 'Culture, Art and Music', subtitle: 'On-Chain Attribution', color: '#D946EF', shape: 'wave' as const },
  { name: 'Brands and Engagement', subtitle: 'Loyalty & Phygital', color: '#F97316', shape: 'diamond' as const },
];

const INTRO_DURATION = 150;      // 5s
const VERTICAL_DURATION = 75;    // 2.5s each, 9 * 75 = 675 frames
const CTA_DURATION = 150;        // 5s
// Total: 150 + 675 + 150 = 975 frames = 32.5s

const fontFace = `
@font-face {
  font-family: 'Monument Extended';
  font-weight: 700;
  src: url('/public/fonts/MonumentExtended-Bold.woff') format('woff');
}
@font-face {
  font-family: 'Monument Extended';
  font-weight: 400;
  src: url('/public/fonts/MonumentExtended-Regular.woff') format('woff');
}
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap');
`;

export const SpeakerVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0f' }}>
      <style>{fontFace}</style>

      <Sequence from={0} durationInFrames={INTRO_DURATION}>
        <IntroSlide duration={INTRO_DURATION} />
      </Sequence>

      {VERTICALS.map((v, i) => (
        <Sequence
          key={v.name}
          from={INTRO_DURATION + i * VERTICAL_DURATION}
          durationInFrames={VERTICAL_DURATION}
        >
          <VerticalSlide
            name={v.name}
            subtitle={v.subtitle}
            color={v.color}
            shape={v.shape}
            index={i}
            duration={VERTICAL_DURATION}
          />
        </Sequence>
      ))}

      <Sequence from={INTRO_DURATION + VERTICALS.length * VERTICAL_DURATION} durationInFrames={CTA_DURATION}>
        <CtaSlide duration={CTA_DURATION} />
      </Sequence>
    </AbsoluteFill>
  );
};
