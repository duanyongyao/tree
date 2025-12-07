import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import Foliage from './Foliage';
import Ornaments from './Ornaments';

const Scene: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: false, toneMappingExposure: 1.2 }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 45]} fov={50} />
        
        <color attach="background" args={['#000502']} />
        
        {/* Cinematic Lighting */}
        <ambientLight intensity={0.2} color="#002211" />
        <spotLight 
          position={[20, 50, 20]} 
          angle={0.2} 
          penumbra={1} 
          intensity={2} 
          color="#FFE5B4" 
          castShadow 
        />
        <pointLight position={[-10, 0, 10]} intensity={1} color="#FFD700" distance={30} />
        <pointLight position={[10, -10, -10]} intensity={1} color="#00ff88" distance={30} />

        <Suspense fallback={null}>
          <Environment preset="city" />
          
          <group position={[0, -2, 0]}>
            <Foliage />
            <Ornaments />
          </group>

          {/* Background Ambiance */}
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </Suspense>

        <OrbitControls 
            enablePan={false} 
            minPolarAngle={Math.PI / 4} 
            maxPolarAngle={Math.PI / 1.5}
            minDistance={10}
            maxDistance={60}
            autoRotate={true}
            autoRotateSpeed={0.5}
        />

        {/* Post Processing for the "Arix Signature" Look */}
        <EffectComposer disableNormalPass>
          <Bloom 
            luminanceThreshold={0.4} 
            luminanceSmoothing={0.9} 
            height={300} 
            intensity={1.5} // High glow for the gold
          />
          <Noise opacity={0.05} />
          <Vignette eskil={false} offset={0.1} darkness={0.8} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default Scene;