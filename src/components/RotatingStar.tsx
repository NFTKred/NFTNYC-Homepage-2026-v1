import { Component, useRef, Suspense, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import type { Group } from 'three';

function StarFallback({ size }: { size: number }) {
  return (
    <div style={{ width: size, height: size, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: '3rem' }}>⭐</span>
    </div>
  );
}

class StarErrorBoundary extends Component<{ children: ReactNode; size: number }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function StarModel() {
  const ref = useRef<Group>(null);
  const { scene } = useGLTF('/y2k-star.glb');

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.5;
    }
  });

  // Center the model (GLB has y-offset of ~1.14)
  return <primitive ref={ref} object={scene} scale={1} position={[0, -1.14, 0]} />;
}

export default function RotatingStar({ size = 120 }: { size?: number }) {
  return (
    <StarErrorBoundary size={size}>
      <div style={{ width: size, height: size, margin: '0 auto' }}>
        <Canvas
          camera={{ position: [0, 0, 4], fov: 40 }}
          style={{ background: 'transparent' }}
          gl={{ alpha: true, antialias: true }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[3, 3, 5]} intensity={1.5} />
          <Environment preset="city" />
          <Suspense fallback={null}>
            <StarModel />
          </Suspense>
        </Canvas>
      </div>
    </StarErrorBoundary>
  );
}

useGLTF.preload('/y2k-star.glb');
