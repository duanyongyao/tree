import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { foliageVertexShader, foliageFragmentShader } from './FoliageShaders';
import { useStore } from '../store';
import { AppState } from '../types';

const COUNT = 15000;
const SCATTER_RADIUS = 35;
const TREE_HEIGHT = 18;
const TREE_RADIUS_BASE = 7;

const Foliage: React.FC = () => {
  const mesh = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const mode = useStore((state) => state.mode);

  // Generate Geometry Data once
  const { positions, treePositions, scatterPositions, sizes, randoms } = useMemo(() => {
    const p = new Float32Array(COUNT * 3); // Current positions (placeholder)
    const tp = new Float32Array(COUNT * 3); // Target: Tree
    const sp = new Float32Array(COUNT * 3); // Target: Scatter
    const s = new Float32Array(COUNT);
    const r = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;

      // 1. SCATTER POSITION (Random Sphere)
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r_scatter = Math.cbrt(Math.random()) * SCATTER_RADIUS; // Uniform distribution

      sp[i3] = r_scatter * Math.sin(phi) * Math.cos(theta);
      sp[i3 + 1] = r_scatter * Math.sin(phi) * Math.sin(theta);
      sp[i3 + 2] = r_scatter * Math.cos(phi);

      // 2. TREE POSITION (Cone Spiral)
      // Height from -height/2 to height/2
      const y = (Math.random() * TREE_HEIGHT) - (TREE_HEIGHT / 2);
      // Normalized height (0 at top, 1 at bottom approx) for radius calc
      const hNorm = 1 - ((y + (TREE_HEIGHT / 2)) / TREE_HEIGHT);
      const radiusAtH = hNorm * TREE_RADIUS_BASE;
      // Spiral angle
      const angle = i * 0.1 + Math.random() * Math.PI * 2;
      const r_tree = Math.sqrt(Math.random()) * radiusAtH; // Random fill inside cone

      tp[i3] = Math.cos(angle) * r_tree;
      tp[i3 + 1] = y;
      tp[i3 + 2] = Math.sin(angle) * r_tree;

      // 3. Attributes
      s[i] = Math.random() * 0.5 + 0.2; // Size
      r[i] = Math.random(); // Random seed
    }

    return { 
      positions: p, 
      treePositions: tp, 
      scatterPositions: sp, 
      sizes: s, 
      randoms: r 
    };
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMix: { value: 0 },
    uColor1: { value: new THREE.Color('#004225') }, // Deep Emerald
    uColor2: { value: new THREE.Color('#D4AF37') }, // Metallic Gold
  }), []);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      
      const targetMix = mode === AppState.TREE_SHAPE ? 1.0 : 0.0;
      // Smooth interpolation for the global mix uniform
      materialRef.current.uniforms.uMix.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uMix.value,
        targetMix,
        delta * 1.5 // Speed of transition
      );
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position" // Required by three.js even if we override in shader
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTreePos"
          count={treePositions.length / 3}
          array={treePositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScatterPos"
          count={scatterPositions.length / 3}
          array={scatterPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aSize"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={randoms.length}
          array={randoms}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={foliageVertexShader}
        fragmentShader={foliageFragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default Foliage;