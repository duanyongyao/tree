import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { foliageVertexShader, foliageFragmentShader } from './FoliageShaders';
import { useStore } from '../store';
import { AppState } from '../types';

// 修改点：增加数量
const COUNT = 20000; 
const SCATTER_RADIUS = 35;
const TREE_HEIGHT = 20; // 稍微增高
const TREE_RADIUS_BASE = 9; // 稍微变胖，显得更丰满

const Foliage: React.FC = () => {
  const mesh = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const mode = useStore((state) => state.mode);

  // Generate Geometry Data once
  const { positions, treePositions, scatterPositions, sizes, randoms } = useMemo(() => {
    const p = new Float32Array(COUNT * 3); 
    const tp = new Float32Array(COUNT * 3); 
    const sp = new Float32Array(COUNT * 3); 
    const s = new Float32Array(COUNT);
    const r = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;

      // 1. SCATTER POSITION
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r_scatter = Math.cbrt(Math.random()) * SCATTER_RADIUS;

      sp[i3] = r_scatter * Math.sin(phi) * Math.cos(theta);
      sp[i3 + 1] = r_scatter * Math.sin(phi) * Math.sin(theta);
      sp[i3 + 2] = r_scatter * Math.cos(phi);

      // 2. TREE POSITION
      const y = (Math.random() * TREE_HEIGHT) - (TREE_HEIGHT / 2);
      const hNorm = 1 - ((y + (TREE_HEIGHT / 2)) / TREE_HEIGHT);
      // 修改点：增加曲线，让树下面更胖，呈漂亮的圆锥形
      const radiusAtH = Math.pow(hNorm, 1.2) * TREE_RADIUS_BASE;
      
      const angle = i * 0.1 + Math.random() * Math.PI * 2;
      // 修改点：填充更致密，主要分布在表面，中间稍微空一点
      const r_tree = (Math.sqrt(Math.random()) * 0.2 + 0.8) * radiusAtH; 

      tp[i3] = Math.cos(angle) * r_tree;
      tp[i3 + 1] = y;
      tp[i3 + 2] = Math.sin(angle) * r_tree;

      // 3. Attributes (关键修改点：尺寸)
      // 原来是 0.2~0.7，现在改为 0.5~2.5，有些粒子会非常大
      s[i] = Math.random() * 2.0 + 0.5; 
      r[i] = Math.random(); 
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
    uColor1: { value: new THREE.Color('#022D18') }, // 改回更深的祖母绿
    uColor2: { value: new THREE.Color('#FFD700') }, // 更亮的纯金
  }), []);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      
      const targetMix = mode === AppState.TREE_SHAPE ? 1.0 : 0.0;
      materialRef.current.uniforms.uMix.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uMix.value,
        targetMix,
        delta * 1.5 
      );
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
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
        blending={THREE.AdditiveBlending} // 保持加法混合，这是发光的关键
      />
    </points>
  );
};

export default Foliage;