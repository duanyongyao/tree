import * as THREE from 'three';

export enum AppState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE'
}

export interface OrnamentData {
  id: number;
  scatterPos: THREE.Vector3;
  treePos: THREE.Vector3;
  rotation: THREE.Euler;
  scale: number;
  color: string;
  type: 'box' | 'sphere';
}

export interface Uniforms {
  uTime: { value: number };
  uMix: { value: number }; // 0 = Scattered, 1 = Tree
  uColor1: { value: THREE.Color };
  uColor2: { value: THREE.Color };
}