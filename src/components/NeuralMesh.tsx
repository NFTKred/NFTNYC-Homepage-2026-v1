import { useEffect, useRef, useCallback } from 'react';
import { ECOSYSTEMS, CONNECTIONS, Ecosystem } from '@/data/nftnyc';
import { getEcoIconDataUri } from '@/components/EcoIcon';

const W = 1000, H = 720;
const CYCLE_MS = 4000;
const TRANSITION_MS = 1200;
const N = ECOSYSTEMS.length;

const FEATURED_POS = { x: 500, y: 115 };
const ORBIT_SLOTS = [
  { x: 175, y: 175 },
  { x: 820, y: 175 },
  { x: 140, y: 295 },
  { x: 855, y: 280 },
  { x: 155, y: 415 },
  { x: 845, y: 400 },
  { x: 200, y: 530 },
  { x: 805, y: 510 },
  { x: 310, y: 620 },
  { x: 690, y: 625 },
  { x: 500, y: 660 }
];
const SPINE_PTS = [
  { x: 500, y: 60 },
  { x: 480, y: 180 },
  { x: 520, y: 310 },
  { x: 490, y: 440 },
  { x: 510, y: 560 },
  { x: 500, y: 670 }
];

type Pos = { x: number; y: number };

function getRestPositions(featIdx: number): Pos[] {
  const positions: Pos[] = new Array(N);
  positions[featIdx] = { ...FEATURED_POS };
  let slotIdx = 0;
  for (let i = 0; i < N; i++) {
    if (i === featIdx) continue;
    positions[i] = { ...ORBIT_SLOTS[slotIdx] };
    slotIdx++;
  }
  return positions;
}

function buildSpinePath(): string {
  const pts = SPINE_PTS;
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
}

function nearestSpine(pos: Pos): Pos {
  let best = SPINE_PTS[0], bestDist = Infinity;
  SPINE_PTS.forEach(sp => {
    const d = Math.hypot(sp.x - pos.x, sp.y - pos.y);
    if (d < bestDist) { bestDist = d; best = sp; }
  });
  return best;
}

function curvePath(x1: number, y1: number, x2: number, y2: number, curvature: number): string {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const dx = x2 - x1, dy = y2 - y1;
  const cx = mx - dy * curvature, cy = my + dx * curvature;
  return `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function wrapText(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text];
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  words.forEach(w => {
    if ((current + ' ' + w).trim().length > maxChars && current) {
      lines.push(current.trim());
      current = w;
    } else {
      current = (current + ' ' + w).trim();
    }
  });
  if (current) lines.push(current.trim());
  return lines.slice(0, 2);
}

function createSvgPath(d: string, stroke: string, strokeWidth: number, opacity: number): SVGPathElement {
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  p.setAttribute('d', d);
  p.setAttribute('fill', 'none');
  p.setAttribute('stroke', stroke);
  p.setAttribute('stroke-width', String(strokeWidth));
  p.setAttribute('opacity', String(opacity));
  p.setAttribute('stroke-linecap', 'round');
  return p;
}

function addSvgText(
  parent: Element, x: number, y: number, text: string,
  fill: string, font: string, size: string | number, weight: string, anchor: string
): SVGTextElement {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  el.setAttribute('x', String(x));
  el.setAttribute('y', String(y));
  el.setAttribute('text-anchor', anchor);
  el.setAttribute('dominant-baseline', 'middle');
  el.setAttribute('fill', fill);
  el.setAttribute('font-family', font);
  el.setAttribute('font-size', String(size));
  el.setAttribute('font-weight', weight);
  el.textContent = text;
  parent.appendChild(el);
  return el;
}

export default function NeuralMesh() {
  const svgRef = useRef<SVGSVGElement>(null);
  const stateRef = useRef({
    featuredIdx: 0,
    transitionStart: null as number | null,
    prevFeatured: 0,
    nextFeatured: 1,
    currentPositions: getRestPositions(0),
    targetPositions: getRestPositions(0),
    sourcePositions: getRestPositions(0),
    rafId: 0,
    timeoutId: undefined as ReturnType<typeof setTimeout> | undefined,
    initialized: false,
  });

  const renderFrame = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const dynLinesG = svg.getElementById('dynLines');
    const dynNodesG = svg.getElementById('dynNodes');
    if (!dynLinesG || !dynNodesG) return;

    dynLinesG.innerHTML = '';
    dynNodesG.innerHTML = '';

    const s = stateRef.current;
    const pos = s.currentPositions;

    const featFactor = new Array(N).fill(0);
    if (s.transitionStart !== null) {
      const elapsed = performance.now() - s.transitionStart;
      const rawT = Math.min(elapsed / TRANSITION_MS, 1);
      const t = rawT < 0.5 ? 4 * rawT * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 3) / 2;
      featFactor[s.prevFeatured] = 1 - t;
      featFactor[s.nextFeatured] = t;
    } else {
      featFactor[s.featuredIdx] = 1;
    }

    // Synapse connections
    for (let i = 0; i < N; i++) {
      const p = pos[i];
      const sp = nearestSpine(p);
      const curv = (p.x < 500 ? 0.1 : -0.1) * (i % 2 === 0 ? 1 : -1);
      const pathD = curvePath(sp.x, sp.y, p.x, p.y, curv);
      const isFeat = featFactor[i] > 0.5;

      const gPath = createSvgPath(pathD, ECOSYSTEMS[i].color, isFeat ? 10 : 6, isFeat ? 0.06 : 0.03);
      gPath.setAttribute('filter', 'url(#synGlow)');
      dynLinesG.appendChild(gPath);

      const mPath = createSvgPath(pathD, ECOSYSTEMS[i].color, isFeat ? 1.8 : 1, isFeat ? 0.4 : 0.2);
      mPath.classList.add('synapse-line');
      dynLinesG.appendChild(mPath);
    }

    // Cross-connections
    CONNECTIONS.forEach(([a, b]) => {
      const pa = pos[a], pb = pos[b];
      const curv = ((a + b) % 3 - 1) * 0.04;
      const pathD = curvePath(pa.x, pa.y, pb.x, pb.y, curv);
      const isConnFeat = featFactor[a] > 0.3 || featFactor[b] > 0.3;
      const crossPath = createSvgPath(pathD,
        isConnFeat ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
        isConnFeat ? 0.7 : 0.4, 1
      );
      crossPath.classList.add('synapse-cross');
      dynLinesG.appendChild(crossPath);
    });

    // Nodes
    for (let i = 0; i < N; i++) {
      const eco: Ecosystem = ECOSYSTEMS[i];
      const p = pos[i];
      const ff = featFactor[i];

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.style.cursor = 'pointer';

      const baseR = 34, featR = 45;
      const nodeR = baseR + (featR - baseR) * ff;
      const ambientR = 42 + 43 * ff;
      const ringR = nodeR + 8;

      const amb = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      amb.setAttribute('cx', String(p.x)); amb.setAttribute('cy', String(p.y));
      amb.setAttribute('r', String(ambientR));
      amb.setAttribute('fill', hexToRgba(eco.color, 0.03 + 0.04 * ff));
      amb.setAttribute('filter', ff > 0.5 ? 'url(#coreGlow)' : 'url(#synGlow)');
      if (ff > 0.5) amb.classList.add('ai-ambient');
      g.appendChild(amb);

      if (ff > 0.2) {
        const pulseRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        pulseRing.setAttribute('cx', String(p.x)); pulseRing.setAttribute('cy', String(p.y));
        pulseRing.setAttribute('r', String(ringR + 6));
        pulseRing.setAttribute('fill', 'none');
        pulseRing.setAttribute('stroke', eco.color);
        pulseRing.setAttribute('stroke-width', '1');
        pulseRing.setAttribute('opacity', String(0.25 * ff));
        if (ff > 0.8) pulseRing.classList.add('ai-pulse-ring');
        g.appendChild(pulseRing);
      }

      const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      ring.setAttribute('cx', String(p.x)); ring.setAttribute('cy', String(p.y));
      ring.setAttribute('r', String(ringR));
      ring.setAttribute('fill', 'none');
      ring.setAttribute('stroke', hexToRgba(eco.color, 0.2 + 0.15 * ff));
      ring.setAttribute('stroke-width', '1');
      g.appendChild(ring);

      const fill = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      fill.setAttribute('cx', String(p.x)); fill.setAttribute('cy', String(p.y));
      fill.setAttribute('r', String(nodeR));
      fill.setAttribute('fill', hexToRgba(eco.color, 0.06 + 0.05 * ff));
      fill.setAttribute('stroke', eco.color);
      fill.setAttribute('stroke-width', String(1 + 0.5 * ff));
      fill.setAttribute('opacity', String(0.7 + 0.3 * ff));
      g.appendChild(fill);

      const iconSize = 18 + 8 * ff;
      const iconImg = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      iconImg.setAttribute('href', getEcoIconDataUri(eco.id, eco.color, iconSize));
      iconImg.setAttribute('x', String(p.x - iconSize / 2));
      iconImg.setAttribute('y', String(p.y - (8 + 10 * ff) - iconSize / 2));
      iconImg.setAttribute('width', String(iconSize));
      iconImg.setAttribute('height', String(iconSize));
      g.appendChild(iconImg);

      const nameSize = 9 + 5 * ff;
      const nameWeight = ff > 0.5 ? '700' : '600';
      const nameLines = wrapText(eco.name, 14);
      nameLines.forEach((line, li) => {
        addSvgText(g, p.x, p.y + 10 + li * 12, line, '#fff', "'Clash Display', sans-serif", nameSize, nameWeight, 'middle');
      });

      if (ff < 0.15 || ff > 0.85) {
        const subs = eco.subs || [];
        if (ff > 0.85) {
          const now = performance.now();
          const orbitRadius = 80;
          const swayAmount = 0.35; // radians of sway (~20 degrees)
          const swaySpeed = 0.0008; // radians per ms
          subs.forEach((sub, j) => {
            // Fixed base angle: left and right of center
            const baseAngle = j === 0 ? Math.PI : 0;
            const sway = Math.sin(now * swaySpeed + j * Math.PI) * swayAmount;
            const angle = baseAngle + sway;
            const sl = {
              x: p.x + Math.cos(angle) * orbitRadius,
              y: p.y - 35 + Math.sin(angle) * orbitRadius * 0.15,
            };
            const subLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            subLine.setAttribute('x1', String(p.x)); subLine.setAttribute('y1', String(p.y));
            subLine.setAttribute('x2', String(sl.x)); subLine.setAttribute('y2', String(sl.y));
            subLine.setAttribute('stroke', eco.color);
            subLine.setAttribute('stroke-width', '1');
            subLine.setAttribute('opacity', '0.4');
            dynLinesG.appendChild(subLine);

            const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            dot.setAttribute('cx', String(sl.x)); dot.setAttribute('cy', String(sl.y));
            dot.setAttribute('r', '5');
            dot.setAttribute('fill', eco.color);
            dot.setAttribute('opacity', '0.85');
            g.appendChild(dot);
            addSvgText(g, sl.x, sl.y - 12, sub, hexToRgba(eco.color, 0.9), "'Inter', sans-serif", '9', '600', 'middle');
          });
        } else {
          const baseAngle = Math.atan2(p.y - 360, p.x - 500);
          subs.forEach((sub, j) => {
            const angle = baseAngle + (j === 0 ? 0.5 : -0.5);
            const dist = 62;
            const sx = p.x + Math.cos(angle) * dist;
            const sy = p.y + Math.sin(angle) * dist;

            const subLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            subLine.setAttribute('x1', String(p.x)); subLine.setAttribute('y1', String(p.y));
            subLine.setAttribute('x2', String(sx)); subLine.setAttribute('y2', String(sy));
            subLine.setAttribute('stroke', eco.color);
            subLine.setAttribute('stroke-width', '0.8');
            subLine.setAttribute('opacity', '0.3');
            dynLinesG.appendChild(subLine);

            const subDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            subDot.setAttribute('cx', String(sx)); subDot.setAttribute('cy', String(sy));
            subDot.setAttribute('r', '4');
            subDot.setAttribute('fill', eco.color);
            subDot.setAttribute('opacity', '0.7');
            g.appendChild(subDot);

            const isRight = sx > 500;
            addSvgText(g, isRight ? sx + 8 : sx - 8, sy + 1, sub,
              'rgba(255,255,255,0.65)', "'Inter', sans-serif", '8', '500',
              isRight ? 'start' : 'end');
          });
        }
      }

      dynNodesG.appendChild(g);
    }
  }, []);

  const startNextCycle = useCallback(() => {
    const s = stateRef.current;
    s.prevFeatured = s.featuredIdx;
    s.nextFeatured = (s.featuredIdx + 1) % N;
    s.sourcePositions = s.currentPositions.map(p => ({ ...p }));
    s.targetPositions = getRestPositions(s.nextFeatured);
    s.transitionStart = performance.now();
  }, []);

  const animationLoop = useCallback((timestamp: number) => {
    const s = stateRef.current;
    if (s.transitionStart !== null) {
      const elapsed = timestamp - s.transitionStart;
      const rawT = Math.min(elapsed / TRANSITION_MS, 1);
      const t = rawT < 0.5 ? 4 * rawT * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 3) / 2;

      for (let i = 0; i < N; i++) {
        s.currentPositions[i] = {
          x: s.sourcePositions[i].x + (s.targetPositions[i].x - s.sourcePositions[i].x) * t,
          y: s.sourcePositions[i].y + (s.targetPositions[i].y - s.sourcePositions[i].y) * t,
        };
      }

      if (rawT >= 1) {
        s.transitionStart = null;
        s.featuredIdx = s.nextFeatured;
        s.currentPositions = getRestPositions(s.featuredIdx);
        s.timeoutId = setTimeout(startNextCycle, CYCLE_MS);
      }
    }
    renderFrame();
    s.rafId = requestAnimationFrame(animationLoop);
  }, [renderFrame, startNextCycle]);

  const buildMesh = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;

    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

    // Check if already built
    if (svg.querySelector('#dynLines')) return;

    const defs = svg.querySelector('defs') || document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const linesGroup = svg.getElementById('meshLines');
    const nodesGroup = svg.getElementById('meshNodes');
    if (!linesGroup || !nodesGroup) return;

    // Spine gradient
    const spineGrad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    spineGrad.id = 'spineGrad';
    spineGrad.setAttribute('x1', '0'); spineGrad.setAttribute('y1', '0');
    spineGrad.setAttribute('x2', '0'); spineGrad.setAttribute('y2', '1');
    [
      { offset: '0%',   color: '#3B82F6', opacity: '1' },
      { offset: '20%',  color: '#8B5CF6', opacity: '1' },
      { offset: '45%',  color: '#EC4899', opacity: '1' },
      { offset: '65%',  color: '#F59E0B', opacity: '1' },
      { offset: '85%',  color: '#10B981', opacity: '1' },
      { offset: '100%', color: '#38BDF8', opacity: '1' },
    ].forEach(s => {
      const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop.setAttribute('offset', s.offset);
      stop.setAttribute('stop-color', s.color);
      stop.setAttribute('stop-opacity', s.opacity);
      spineGrad.appendChild(stop);
    });
    defs.appendChild(spineGrad);

    // Syn glow filter
    const synGlow = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    synGlow.id = 'synGlow';
    synGlow.setAttribute('x', '-50%'); synGlow.setAttribute('y', '-50%');
    synGlow.setAttribute('width', '200%'); synGlow.setAttribute('height', '200%');
    const synBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    synBlur.setAttribute('in', 'SourceGraphic'); synBlur.setAttribute('stdDeviation', '6');
    synGlow.appendChild(synBlur);
    defs.appendChild(synGlow);

    // Core glow filter
    const coreGlow = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    coreGlow.id = 'coreGlow';
    coreGlow.setAttribute('x', '-100%'); coreGlow.setAttribute('y', '-100%');
    coreGlow.setAttribute('width', '300%'); coreGlow.setAttribute('height', '300%');
    const coreBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    coreBlur.setAttribute('in', 'SourceGraphic'); coreBlur.setAttribute('stdDeviation', '18');
    coreGlow.appendChild(coreBlur);
    defs.appendChild(coreGlow);

    svg.insertBefore(defs, linesGroup);

    // Ambient particles
    const particlesG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    particlesG.setAttribute('class', 'ambient-particles');
    for (let i = 0; i < 50; i++) {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', String(Math.random() * W));
      c.setAttribute('cy', String(Math.random() * H));
      c.setAttribute('r', String(Math.random() * 1.2 + 0.3));
      c.setAttribute('fill', `rgba(255,255,255,${Math.random() * 0.06 + 0.01})`);
      c.style.animation = `particleDrift ${10 + Math.random() * 15}s ease-in-out infinite`;
      c.style.animationDelay = `${Math.random() * -20}s`;
      particlesG.appendChild(c);
    }
    svg.insertBefore(particlesG, linesGroup);

    // Spine
    const spineD = buildSpinePath();

    const spineGlowPath = createSvgPath(spineD, 'url(#spineGrad)', 50, 0.2);
    spineGlowPath.setAttribute('filter', 'url(#coreGlow)');
    spineGlowPath.classList.add('spine-glow');
    linesGroup.appendChild(spineGlowPath);

    const spineMedPath = createSvgPath(spineD, 'url(#spineGrad)', 14, 0.4);
    spineMedPath.setAttribute('filter', 'url(#synGlow)');
    linesGroup.appendChild(spineMedPath);

    const spineSharp = createSvgPath(spineD, 'url(#spineGrad)', 3, 0.85);
    spineSharp.classList.add('spine-line');
    linesGroup.appendChild(spineSharp);

    const spineSharp2 = createSvgPath(spineD, 'url(#spineGrad)', 1.5, 0.5);
    spineSharp2.setAttribute('stroke-dasharray', '8 12');
    linesGroup.appendChild(spineSharp2);

    // Spine labels
    {
      const pill = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      pill.setAttribute('x', '420'); pill.setAttribute('y', '334');
      pill.setAttribute('width', '160'); pill.setAttribute('height', '22');
      pill.setAttribute('rx', '11');
      pill.setAttribute('fill', 'rgba(139,92,246,0.12)');
      pill.setAttribute('stroke', 'rgba(139,92,246,0.25)');
      pill.setAttribute('stroke-width', '0.5');
      pill.classList.add('spine-label-pill');
      nodesGroup.appendChild(pill);

      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', '500'); t.setAttribute('y', '345');
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('dominant-baseline', 'middle');
      t.setAttribute('fill', 'rgba(200,180,255,0.75)');
      t.setAttribute('font-family', "'Monument Extended', sans-serif");
      t.setAttribute('font-size', '11');
      t.setAttribute('font-weight', '900');
      t.setAttribute('letter-spacing', '0.15em');
      t.textContent = 'TOKENIZATION LAYER';
      t.classList.add('spine-label');
      nodesGroup.appendChild(t);
    }

    // Spine pulses
    for (let p = 0; p < 4; p++) {
      const pulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      pulse.setAttribute('r', p % 2 === 0 ? '4' : '3');
      pulse.setAttribute('fill', p % 2 === 0 ? '#8B5CF6' : '#3B82F6');
      pulse.setAttribute('opacity', '0.9');
      pulse.classList.add('spine-pulse');
      const anim = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
      anim.setAttribute('dur', `${5 + p}s`);
      anim.setAttribute('repeatCount', 'indefinite');
      anim.setAttribute('begin', `${p * 1.5}s`);
      anim.setAttribute('path', spineD);
      if (p % 2 === 1) { anim.setAttribute('keyPoints', '1;0'); anim.setAttribute('keyTimes', '0;1'); }
      pulse.appendChild(anim);
      linesGroup.appendChild(pulse);
    }

    // Dynamic groups
    const dynLinesG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    dynLinesG.id = 'dynLines';
    linesGroup.appendChild(dynLinesG);

    const dynNodesG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    dynNodesG.id = 'dynNodes';
    nodesGroup.appendChild(dynNodesG);

    renderFrame();
    stateRef.current.rafId = requestAnimationFrame(animationLoop);
    stateRef.current.timeoutId = setTimeout(startNextCycle, CYCLE_MS);
  }, [renderFrame, animationLoop, startNextCycle]);

  useEffect(() => {
    buildMesh();
    return () => {
      const s = stateRef.current;
      cancelAnimationFrame(s.rafId);
      clearTimeout(s.timeoutId);
    };
  }, [buildMesh]);

  return (
    <div
      className="w-full max-w-[900px] relative z-10 -mt-4"
      aria-label="Interactive ecosystem network visualization showing NFTs at the center connected to 10 adjacent ecosystems"
    >
      <svg
        ref={svgRef}
        id="meshSvg"
        className="w-full h-full"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="glowStrong" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <g id="meshLines"></g>
        <g id="meshNodes"></g>
      </svg>
    </div>
  );
}
