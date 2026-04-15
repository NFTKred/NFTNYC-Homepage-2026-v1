import { useCurrentFrame, interpolate } from 'remotion';

type Shape = 'neural' | 'hexgrid' | 'chain' | 'social' | 'rings' | 'burst' | 'bars' | 'diamond' | 'wave';

export const GeometricArt: React.FC<{ shape: Shape; color: string }> = ({ shape, color }) => {
  const frame = useCurrentFrame();
  const pulse = Math.sin(frame * 0.15) * 0.1 + 1;
  const rot = frame * 0.8;

  const common: React.SVGProps<SVGSVGElement> = {
    width: 320,
    height: 320,
    viewBox: '0 0 320 320',
    style: { transform: `scale(${pulse})` },
  };

  switch (shape) {
    case 'neural':
      return (
        <svg {...common}>
          {[
            [160, 80], [80, 160], [240, 160], [120, 240], [200, 240], [160, 160],
          ].map(([cx, cy], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r={12 + Math.sin(frame * 0.2 + i) * 4} fill={color} opacity={0.7} />
              {i < 5 && <line x1={cx} y1={cy} x2={160} y2={160} stroke={color} strokeWidth={1.5} opacity={0.3} />}
            </g>
          ))}
          {[[80,160,160,80],[240,160,160,80],[120,240,80,160],[200,240,240,160],[120,240,200,240]].map(([x1,y1,x2,y2], i) => (
            <line key={`l${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={1} opacity={0.2} />
          ))}
        </svg>
      );

    case 'hexgrid':
      return (
        <svg {...common}>
          {Array.from({ length: 7 }, (_, i) => {
            const angle = (i / 7) * Math.PI * 2 + rot * 0.01;
            const r = 90 + Math.sin(frame * 0.1 + i) * 10;
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
                transform={`rotate(${rot + i * 15}, ${160 + Math.cos(angle) * r}, ${160 + Math.sin(angle) * r})`}
              />
            );
          })}
          <rect x={140} y={140} width={40} height={40} rx={6} fill={color} opacity={0.8} transform={`rotate(${rot}, 160, 160)`} />
        </svg>
      );

    case 'chain':
      return (
        <svg {...common}>
          {Array.from({ length: 5 }, (_, i) => {
            const y = 60 + i * 50;
            const xOffset = Math.sin(frame * 0.12 + i) * 15;
            return (
              <g key={i}>
                <rect x={110 + xOffset} y={y} width={100} height={30} rx={15} fill="none" stroke={color} strokeWidth={2.5} opacity={0.5 + i * 0.1} />
                {i < 4 && <line x1={160 + xOffset} y1={y + 30} x2={160 + Math.sin(frame * 0.12 + i + 1) * 15} y2={60 + (i + 1) * 50} stroke={color} strokeWidth={1.5} opacity={0.3} />}
              </g>
            );
          })}
        </svg>
      );

    case 'social':
      return (
        <svg {...common}>
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const r = 80 + Math.sin(frame * 0.15 + i * 0.7) * 20;
            const cx = 160 + Math.cos(angle) * r;
            const cy = 160 + Math.sin(angle) * r;
            return (
              <g key={i}>
                <circle cx={cx} cy={cy} r={8} fill={color} opacity={0.6} />
                <line x1={cx} y1={cy} x2={160} y2={160} stroke={color} strokeWidth={1} opacity={0.2} />
                <line x1={cx} y1={cy} x2={160 + Math.cos(angle + Math.PI / 4) * r} y2={160 + Math.sin(angle + Math.PI / 4) * r} stroke={color} strokeWidth={0.8} opacity={0.15} />
              </g>
            );
          })}
          <circle cx={160} cy={160} r={14} fill={color} opacity={0.9} />
        </svg>
      );

    case 'rings':
      return (
        <svg {...common}>
          {[100, 75, 50, 25].map((r, i) => (
            <circle
              key={i}
              cx={160}
              cy={160}
              r={r + Math.sin(frame * 0.1 + i) * 5}
              fill="none"
              stroke={color}
              strokeWidth={2}
              opacity={0.2 + i * 0.2}
              strokeDasharray={`${10 + i * 5} ${5 + i * 3}`}
              transform={`rotate(${rot * (i % 2 === 0 ? 1 : -1)}, 160, 160)`}
            />
          ))}
          <circle cx={160} cy={160} r={10} fill={color} opacity={0.9} />
        </svg>
      );

    case 'burst':
      return (
        <svg {...common}>
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i / 12) * Math.PI * 2 + rot * 0.015;
            const len = 50 + Math.sin(frame * 0.2 + i) * 20;
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
        </svg>
      );

    case 'bars':
      return (
        <svg {...common}>
          {Array.from({ length: 7 }, (_, i) => {
            const h = 40 + Math.sin(frame * 0.15 + i * 0.8) * 30 + i * 15;
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
        </svg>
      );

    case 'diamond':
      return (
        <svg {...common}>
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
                transform={`rotate(${45 + rot * 0.5 + i * 5}, 160, 160)`}
              />
            );
          })}
          <rect x={145} y={145} width={30} height={30} rx={4} fill={color} opacity={0.8} transform={`rotate(${45 + rot}, 160, 160)`} />
        </svg>
      );

    case 'wave':
      return (
        <svg {...common}>
          {Array.from({ length: 5 }, (_, row) => {
            const points = Array.from({ length: 20 }, (_, i) => {
              const x = 40 + i * 13;
              const y = 100 + row * 35 + Math.sin(i * 0.5 + frame * 0.12 + row) * (15 + row * 3);
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
        </svg>
      );
  }
};
