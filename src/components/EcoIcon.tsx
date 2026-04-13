/**
 * Static SVG icons for each ecosystem vertical.
 * Adapted from the Remotion GeometricArt component (remotion/src/components/GeometricArt.tsx).
 * These are non-animated versions suitable for the website.
 */

type EcoShape = 'neural' | 'hexgrid' | 'chain' | 'social' | 'rings' | 'burst' | 'bars' | 'diamond' | 'wave' | 'pillars' | 'orbit' | 'helix';

const SHAPE_MAP: Record<string, EcoShape> = {
  ai: 'neural',
  gaming: 'hexgrid',
  infra: 'chain',
  social: 'social',
  creator: 'burst',
  defi: 'bars',
  rwa: 'pillars',
  brands: 'diamond',
  culture: 'wave', // now includes former communities
  domains: 'orbit',
  desci: 'helix',
  marketplaces: 'rings',
  // Legacy fallback
  communities: 'wave',
};

interface EcoIconProps {
  ecoId: string;
  color: string;
  size?: number;
}

export default function EcoIcon({ ecoId, color, size = 32, animated = true }: EcoIconProps & { animated?: boolean }) {
  const shape = SHAPE_MAP[ecoId] ?? 'rings';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 320 320"
      style={{ display: 'block', flexShrink: 0, overflow: 'visible' }}
    >
      {animated && (
        <defs>
          <style>{`
            @keyframes ecoPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.06); } }
            @keyframes ecoRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @keyframes ecoRotateReverse { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
            .eco-pulse { animation: ecoPulse 3s ease-in-out infinite; transform-origin: 160px 160px; }
            .eco-rotate { animation: ecoRotate 12s linear infinite; transform-origin: 160px 160px; }
            .eco-rotate-slow { animation: ecoRotate 20s linear infinite; transform-origin: 160px 160px; }
            .eco-rotate-reverse { animation: ecoRotateReverse 15s linear infinite; transform-origin: 160px 160px; }
          `}</style>
        </defs>
      )}
      <g className={animated ? 'eco-pulse' : undefined}>
        <ShapeContent shape={shape} color={color} animated={animated} />
      </g>
    </svg>
  );
}

function ShapeContent({ shape, color, animated = false }: { shape: EcoShape; color: string; animated?: boolean }) {
  switch (shape) {
    case 'neural':
      return (
        <g>
          {[
            [160, 80], [80, 160], [240, 160], [120, 240], [200, 240], [160, 160],
          ].map(([cx, cy], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r={14} fill={color} opacity={0.7} />
              {i < 5 && <line x1={cx} y1={cy} x2={160} y2={160} stroke={color} strokeWidth={1.5} opacity={0.3} />}
            </g>
          ))}
          {[[80,160,160,80],[240,160,160,80],[120,240,80,160],[200,240,240,160],[120,240,200,240]].map(([x1,y1,x2,y2], i) => (
            <line key={`l${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={1} opacity={0.2} />
          ))}
        </g>
      );

    case 'hexgrid':
      return (
        <g className={animated ? 'eco-rotate-slow' : undefined}>
          {Array.from({ length: 7 }, (_, i) => {
            const angle = (i / 7) * Math.PI * 2;
            const r = 90;
            return (
              <rect
                key={i}
                x={160 + Math.cos(angle) * r - 20}
                y={160 + Math.sin(angle) * r - 20}
                width={40}
                height={40}
                rx={6}
                fill={color}
                opacity={0.15 + i * 0.08}
                transform={`rotate(${i * 15}, ${160 + Math.cos(angle) * r}, ${160 + Math.sin(angle) * r})`}
              />
            );
          })}
          <rect x={140} y={140} width={40} height={40} rx={6} fill={color} opacity={0.8} />
        </g>
      );

    case 'chain':
      return (
        <g>
          {Array.from({ length: 5 }, (_, i) => {
            const y = 60 + i * 50;
            return (
              <g key={i}>
                <rect x={110} y={y} width={100} height={30} rx={15} fill="none" stroke={color} strokeWidth={2.5} opacity={0.5 + i * 0.1} />
                {i < 4 && <line x1={160} y1={y + 30} x2={160} y2={60 + (i + 1) * 50} stroke={color} strokeWidth={1.5} opacity={0.3} />}
              </g>
            );
          })}
        </g>
      );

    case 'social':
      return (
        <g>
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const r = 90;
            const cx = 160 + Math.cos(angle) * r;
            const cy = 160 + Math.sin(angle) * r;
            return (
              <g key={i}>
                <circle cx={cx} cy={cy} r={8} fill={color} opacity={0.6} />
                <line x1={cx} y1={cy} x2={160} y2={160} stroke={color} strokeWidth={1} opacity={0.2} />
              </g>
            );
          })}
          <circle cx={160} cy={160} r={14} fill={color} opacity={0.9} />
        </g>
      );

    case 'rings':
      return (
        <g>
          {[100, 75, 50, 25].map((r, i) => (
            <circle
              key={i}
              cx={160}
              cy={160}
              r={r}
              fill="none"
              stroke={color}
              strokeWidth={2}
              opacity={0.2 + i * 0.2}
              strokeDasharray={`${10 + i * 5} ${5 + i * 3}`}
              className={animated ? (i % 2 === 0 ? 'eco-rotate' : 'eco-rotate-reverse') : undefined}
            />
          ))}
          <circle cx={160} cy={160} r={10} fill={color} opacity={0.9} />
        </g>
      );

    case 'burst':
      return (
        <g className={animated ? 'eco-rotate-slow' : undefined}>
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const len = 60;
            return (
              <line
                key={i}
                x1={160 + Math.cos(angle) * 30}
                y1={160 + Math.sin(angle) * 30}
                x2={160 + Math.cos(angle) * (30 + len)}
                y2={160 + Math.sin(angle) * (30 + len)}
                stroke={color}
                strokeWidth={3}
                opacity={0.4 + (i % 3) * 0.2}
                strokeLinecap="round"
              />
            );
          })}
          <circle cx={160} cy={160} r={20} fill={color} opacity={0.8} />
        </g>
      );

    case 'bars':
      return (
        <g>
          {Array.from({ length: 7 }, (_, i) => {
            const h = 40 + i * 18;
            const x = 65 + i * 30;
            return (
              <rect
                key={i}
                x={x}
                y={280 - h}
                width={22}
                height={h}
                rx={4}
                fill={color}
                opacity={0.3 + i * 0.08}
              />
            );
          })}
        </g>
      );

    case 'diamond':
      return (
        <g className={animated ? 'eco-rotate-slow' : undefined}>
          {[0, 1, 2].map(i => {
            const s = 40 + i * 30;
            const o = 0.7 - i * 0.2;
            return (
              <rect
                key={i}
                x={160 - s}
                y={160 - s}
                width={s * 2}
                height={s * 2}
                rx={8}
                fill="none"
                stroke={color}
                strokeWidth={2}
                opacity={o}
                transform={`rotate(${45 + i * 5}, 160, 160)`}
              />
            );
          })}
          <rect x={145} y={145} width={30} height={30} rx={4} fill={color} opacity={0.8} transform="rotate(45, 160, 160)" />
        </g>
      );

    case 'wave':
      return (
        <g>
          {Array.from({ length: 5 }, (_, row) => {
            const points = Array.from({ length: 20 }, (_, i) => {
              const x = 40 + i * 13;
              const y = 100 + row * 35 + Math.sin(i * 0.5 + row) * (15 + row * 3);
              return `${x},${y}`;
            }).join(' ');
            return (
              <polyline
                key={row}
                points={points}
                fill="none"
                stroke={color}
                strokeWidth={2.5}
                opacity={0.2 + row * 0.15}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}
        </g>
      );

    case 'pillars':
      // RWA Tokenization — classical building columns representing real-world institutions
      return (
        <g>
          {/* Roof */}
          <polygon points="60,100 260,100 240,75 80,75" fill={color} opacity={0.7} />
          <rect x={70} y={100} width={180} height={8} fill={color} opacity={0.5} />
          {/* 4 columns */}
          {[0, 1, 2, 3].map(i => {
            const x = 80 + i * 50;
            return (
              <g key={i}>
                <rect x={x} y={108} width={20} height={120} fill={color} opacity={0.4 + i * 0.1} />
                <rect x={x - 4} y={108} width={28} height={6} fill={color} opacity={0.6} />
                <rect x={x - 4} y={222} width={28} height={6} fill={color} opacity={0.6} />
              </g>
            );
          })}
          {/* Base */}
          <rect x={60} y={228} width={200} height={14} fill={color} opacity={0.6} />
          <rect x={50} y={242} width={220} height={8} fill={color} opacity={0.5} />
        </g>
      );

    case 'orbit':
      // DNS / ENS Domains — central node with 3 orbiting satellites at different orbital paths
      return (
        <g>
          {/* Outer orbit */}
          <ellipse cx={160} cy={160} rx={110} ry={42} fill="none" stroke={color} strokeWidth={1.5} opacity={0.25} className={animated ? 'eco-rotate-slow' : undefined} />
          {/* Mid orbit */}
          <ellipse cx={160} cy={160} rx={42} ry={110} fill="none" stroke={color} strokeWidth={1.5} opacity={0.35} className={animated ? 'eco-rotate-reverse' : undefined} />
          {/* Diagonal orbit */}
          <ellipse cx={160} cy={160} rx={95} ry={50} fill="none" stroke={color} strokeWidth={1.5} opacity={0.3} transform="rotate(45 160 160)" className={animated ? 'eco-rotate' : undefined} />
          {/* Satellites */}
          <circle cx={270} cy={160} r={10} fill={color} opacity={0.8} />
          <circle cx={160} cy={50} r={8} fill={color} opacity={0.7} />
          <circle cx={95} cy={225} r={9} fill={color} opacity={0.75} />
          {/* Central node */}
          <circle cx={160} cy={160} r={22} fill={color} opacity={0.9} />
          <circle cx={160} cy={160} r={28} fill="none" stroke={color} strokeWidth={1.5} opacity={0.4} />
        </g>
      );

    case 'helix':
      // DeSci / Longevity — DNA double helix, two interweaving strands
      return (
        <g>
          {/* Two strands (sine waves offset by PI) */}
          {Array.from({ length: 2 }, (_, strand) => {
            const phase = strand * Math.PI;
            const points = Array.from({ length: 40 }, (_, i) => {
              const t = i / 39;
              const y = 50 + t * 220;
              const x = 160 + Math.sin(t * Math.PI * 3 + phase) * 60;
              return `${x},${y}`;
            }).join(' ');
            return (
              <polyline
                key={strand}
                points={points}
                fill="none"
                stroke={color}
                strokeWidth={3}
                opacity={0.7}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}
          {/* Rungs connecting strands at intervals */}
          {Array.from({ length: 8 }, (_, i) => {
            const t = (i + 0.5) / 8;
            const y = 50 + t * 220;
            const x1 = 160 + Math.sin(t * Math.PI * 3) * 60;
            const x2 = 160 + Math.sin(t * Math.PI * 3 + Math.PI) * 60;
            return (
              <line key={i} x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth={1.5} opacity={0.35} />
            );
          })}
        </g>
      );
  }
}

/**
 * Generates a data URI for use in SVG <image> elements (e.g., NeuralMesh).
 * Returns an inline SVG as a data URI string.
 */
export function getEcoIconDataUri(ecoId: string, color: string, size = 32): string {
  const shape = SHAPE_MAP[ecoId] ?? 'rings';
  // Generate minimal SVG string for each shape
  const svgContent = getShapeSvgString(shape, color);
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 320 320">${svgContent}</svg>`)}`;
}

function getShapeSvgString(shape: EcoShape, c: string): string {
  switch (shape) {
    case 'neural':
      return `<circle cx="160" cy="80" r="14" fill="${c}" opacity="0.7"/><circle cx="80" cy="160" r="14" fill="${c}" opacity="0.7"/><circle cx="240" cy="160" r="14" fill="${c}" opacity="0.7"/><circle cx="120" cy="240" r="14" fill="${c}" opacity="0.7"/><circle cx="200" cy="240" r="14" fill="${c}" opacity="0.7"/><circle cx="160" cy="160" r="14" fill="${c}" opacity="0.7"/><line x1="160" y1="80" x2="160" y2="160" stroke="${c}" stroke-width="1.5" opacity="0.3"/><line x1="80" y1="160" x2="160" y2="160" stroke="${c}" stroke-width="1.5" opacity="0.3"/><line x1="240" y1="160" x2="160" y2="160" stroke="${c}" stroke-width="1.5" opacity="0.3"/><line x1="120" y1="240" x2="160" y2="160" stroke="${c}" stroke-width="1.5" opacity="0.3"/><line x1="200" y1="240" x2="160" y2="160" stroke="${c}" stroke-width="1.5" opacity="0.3"/>`;
    case 'hexgrid':
      return `<rect x="140" y="140" width="40" height="40" rx="6" fill="${c}" opacity="0.8"/>${Array.from({length:7},(_,i)=>{const a=(i/7)*Math.PI*2;const r=90;return `<rect x="${160+Math.cos(a)*r-20}" y="${160+Math.sin(a)*r-20}" width="40" height="40" rx="6" fill="${c}" opacity="${0.15+i*0.08}"/>`}).join('')}`;
    case 'chain':
      return Array.from({length:5},(_,i)=>`<rect x="110" y="${60+i*50}" width="100" height="30" rx="15" fill="none" stroke="${c}" stroke-width="2.5" opacity="${0.5+i*0.1}"/>${i<4?`<line x1="160" y1="${60+i*50+30}" x2="160" y2="${60+(i+1)*50}" stroke="${c}" stroke-width="1.5" opacity="0.3"/>`:''}`).join('');
    case 'social':
      return `<circle cx="160" cy="160" r="14" fill="${c}" opacity="0.9"/>${Array.from({length:8},(_,i)=>{const a=(i/8)*Math.PI*2;const cx=160+Math.cos(a)*90;const cy=160+Math.sin(a)*90;return `<circle cx="${cx}" cy="${cy}" r="8" fill="${c}" opacity="0.6"/><line x1="${cx}" y1="${cy}" x2="160" y2="160" stroke="${c}" stroke-width="1" opacity="0.2"/>`}).join('')}`;
    case 'rings':
      return `${[100,75,50,25].map((r,i)=>`<circle cx="160" cy="160" r="${r}" fill="none" stroke="${c}" stroke-width="2" opacity="${0.2+i*0.2}" stroke-dasharray="${10+i*5} ${5+i*3}"/>`).join('')}<circle cx="160" cy="160" r="10" fill="${c}" opacity="0.9"/>`;
    case 'burst':
      return `${Array.from({length:12},(_,i)=>{const a=(i/12)*Math.PI*2;return `<line x1="${160+Math.cos(a)*30}" y1="${160+Math.sin(a)*30}" x2="${160+Math.cos(a)*90}" y2="${160+Math.sin(a)*90}" stroke="${c}" stroke-width="3" opacity="${0.4+(i%3)*0.2}" stroke-linecap="round"/>`}).join('')}<circle cx="160" cy="160" r="20" fill="${c}" opacity="0.8"/>`;
    case 'bars':
      return Array.from({length:7},(_,i)=>`<rect x="${65+i*30}" y="${280-(40+i*18)}" width="22" height="${40+i*18}" rx="4" fill="${c}" opacity="${0.3+i*0.08}"/>`).join('');
    case 'diamond':
      return `${[0,1,2].map(i=>{const s=40+i*30;return `<rect x="${160-s}" y="${160-s}" width="${s*2}" height="${s*2}" rx="8" fill="none" stroke="${c}" stroke-width="2" opacity="${0.7-i*0.2}" transform="rotate(${45+i*5} 160 160)"/>`}).join('')}<rect x="145" y="145" width="30" height="30" rx="4" fill="${c}" opacity="0.8" transform="rotate(45 160 160)"/>`;
    case 'wave':
      return Array.from({length:5},(_,row)=>{const pts=Array.from({length:20},(_,i)=>`${40+i*13},${100+row*35+Math.sin(i*0.5+row)*(15+row*3)}`).join(' ');return `<polyline points="${pts}" fill="none" stroke="${c}" stroke-width="2.5" opacity="${0.2+row*0.15}" stroke-linecap="round" stroke-linejoin="round"/>`}).join('');
    case 'pillars':
      return `<polygon points="60,100 260,100 240,75 80,75" fill="${c}" opacity="0.7"/><rect x="70" y="100" width="180" height="8" fill="${c}" opacity="0.5"/>${[0,1,2,3].map(i=>{const x=80+i*50;return `<rect x="${x}" y="108" width="20" height="120" fill="${c}" opacity="${0.4+i*0.1}"/><rect x="${x-4}" y="108" width="28" height="6" fill="${c}" opacity="0.6"/><rect x="${x-4}" y="222" width="28" height="6" fill="${c}" opacity="0.6"/>`}).join('')}<rect x="60" y="228" width="200" height="14" fill="${c}" opacity="0.6"/><rect x="50" y="242" width="220" height="8" fill="${c}" opacity="0.5"/>`;
    case 'orbit':
      return `<ellipse cx="160" cy="160" rx="110" ry="42" fill="none" stroke="${c}" stroke-width="1.5" opacity="0.25"/><ellipse cx="160" cy="160" rx="42" ry="110" fill="none" stroke="${c}" stroke-width="1.5" opacity="0.35"/><ellipse cx="160" cy="160" rx="95" ry="50" fill="none" stroke="${c}" stroke-width="1.5" opacity="0.3" transform="rotate(45 160 160)"/><circle cx="270" cy="160" r="10" fill="${c}" opacity="0.8"/><circle cx="160" cy="50" r="8" fill="${c}" opacity="0.7"/><circle cx="95" cy="225" r="9" fill="${c}" opacity="0.75"/><circle cx="160" cy="160" r="22" fill="${c}" opacity="0.9"/><circle cx="160" cy="160" r="28" fill="none" stroke="${c}" stroke-width="1.5" opacity="0.4"/>`;
    case 'helix':
      return `${Array.from({length:2},(_,strand)=>{const phase=strand*Math.PI;const pts=Array.from({length:40},(_,i)=>{const t=i/39;const y=50+t*220;const x=160+Math.sin(t*Math.PI*3+phase)*60;return `${x.toFixed(1)},${y.toFixed(1)}`}).join(' ');return `<polyline points="${pts}" fill="none" stroke="${c}" stroke-width="3" opacity="0.7" stroke-linecap="round" stroke-linejoin="round"/>`}).join('')}${Array.from({length:8},(_,i)=>{const t=(i+0.5)/8;const y=50+t*220;const x1=160+Math.sin(t*Math.PI*3)*60;const x2=160+Math.sin(t*Math.PI*3+Math.PI)*60;return `<line x1="${x1.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${c}" stroke-width="1.5" opacity="0.35"/>`}).join('')}`;
  }
}
