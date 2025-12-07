import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';
import { AppState, OrnamentData } from '../types';

const COUNT = 300; // 150 spheres, 150 boxes
const SCATTER_RADIUS = 40;
const TREE_HEIGHT = 16;
const TREE_RADIUS_BASE = 7.5;

const Ornaments: React.FC = () => {
  const sphereMesh = useRef<THREE.InstancedMesh>(null);
  const boxMesh = useRef<THREE.InstancedMesh>(null);
  const mode = useStore((state) => state.mode);
  
  // Dummy object for matrix calculations
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Generate Data
  const data = useMemo<OrnamentData[]>(() => {
    const items: OrnamentData[] = [];
    const colors = ['#C5A000', '#FFD700', '#B8860B', '#F5F5F5', '#8B0000']; // Gold variations + Silver + Dark Red accent

    for (let i = 0; i < COUNT; i++) {
      // Tree Position (Surface of cone)
      const y = (Math.random() * TREE_HEIGHT) - (TREE_HEIGHT / 2);
      const hNorm = 1 - ((y + (TREE_HEIGHT / 2)) / TREE_HEIGHT);
      const r_at_h = hNorm * TREE_RADIUS_BASE;
      const angle = Math.random() * Math.PI * 2;
      
      // Add slight offset so they aren't perfectly on the cone surface (depth)
      const r_final = r_at_h + (Math.random() * 0.5); 
      
      const treePos = new THREE.Vector3(
        Math.cos(angle) * r_final,
        y,
        Math.sin(angle) * r_final
      );

      // Scatter Position
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r_scatter = 15 + Math.cbrt(Math.random()) * SCATTER_RADIUS;
      
      const scatterPos = new THREE.Vector3(
        r_scatter * Math.sin(phi) * Math.cos(theta),
        r_scatter * Math.sin(phi) * Math.sin(theta),
        r_scatter * Math.cos(phi)
      );

      items.push({
        id: i,
        scatterPos,
        treePos,
        rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
        scale: Math.random() * 0.4 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: i % 2 === 0 ? 'box' : 'sphere'
      });
    }
    return items;
  }, []);

  useLayoutEffect(() => {
    // Initialize Colors
    let sphereIndex = 0;
    let boxIndex = 0;

    data.forEach((item) => {
      const color = new THREE.Color(item.color);
      if (item.type === 'sphere' && sphereMesh.current) {
        sphereMesh.current.setColorAt(sphereIndex++, color);
      } else if (item.type === 'box' && boxMesh.current) {
        boxMesh.current.setColorAt(boxIndex++, color);
      }
    });

    if(sphereMesh.current) sphereMesh.current.instanceColor!.needsUpdate = true;
    if(boxMesh.current) boxMesh.current.instanceColor!.needsUpdate = true;
  }, [data]);

  // Current animation progress (0 = Scattered, 1 = Tree)
  const progress = useRef(0);

  useFrame((state, delta) => {
    const target = mode === AppState.TREE_SHAPE ? 1 : 0;
    // Lerp progress
    progress.current = THREE.MathUtils.lerp(progress.current, target, delta * 2);

    let sphereIndex = 0;
    let boxIndex = 0;

    data.forEach((item) => {
      // Interpolate Position
      const currentPos = new THREE.Vector3().lerpVectors(item.scatterPos, item.treePos, progress.current);
      
      // Add "Float" noise
      // Higher float magnitude when scattered (progress near 0)
      const floatMag = THREE.MathUtils.lerp(0.05, 0.01, progress.current);
      const time = state.clock.elapsedTime;
      currentPos.y += Math.sin(time * 2 + item.id) * floatMag;
      currentPos.x += Math.cos(time * 1.5 + item.id) * floatMag;

      // Rotation (Spin faster when scattered)
      const rotSpeed = THREE.MathUtils.lerp(1.0, 0.1, progress.current);
      dummy.rotation.copy(item.rotation);
      dummy.rotation.x += time * 0.2 * rotSpeed;
      dummy.rotation.y += time * 0.3 * rotSpeed;

      dummy.position.copy(currentPos);
      dummy.scale.setScalar(item.scale);
      dummy.updateMatrix();

      if (item.type === 'sphere' && sphereMesh.current) {
        sphereMesh.current.setMatrixAt(sphereIndex++, dummy.matrix);
      } else if (item.type === 'box' && boxMesh.current) {
        boxMesh.current.setMatrixAt(boxIndex++, dummy.matrix);
      }
    });

    if(sphereMesh.current) sphereMesh.current.instanceMatrix.needsUpdate = true;
    if(boxMesh.current) boxMesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {/* Glossy Spheres */}
      <instancedMesh ref={sphereMesh} args={[undefined, undefined, COUNT / 2]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
            roughness={0.1} 
            metalness={0.9} 
            envMapIntensity={1.5}
            color="#ffffff"
        />
      </instancedMesh>

      {/* Gift Boxes */}
      <instancedMesh ref={boxMesh} args={[undefined, undefined, COUNT / 2]}>
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        <meshStandardMaterial 
            roughness={0.2} 
            metalness={0.7} 
            envMapIntensity={1.2}
            color="#ffffff"
        />
      </instancedMesh>
    </group>
  );
};

export default Ornaments;