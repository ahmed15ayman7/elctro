"use client";

import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function FloatingFood() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
  });

  return (
    <group ref={groupRef}>
      {/* Central glowing orb representing the food brand */}
      <Float speed={2} rotationIntensity={0.4} floatIntensity={0.8}>
        <Sphere args={[1.2, 64, 64]} position={[0, 0, 0]}>
          <MeshDistortMaterial
            color="#f97316"
            distort={0.35}
            speed={2}
            roughness={0.1}
            metalness={0.2}
          />
        </Sphere>
      </Float>

      {/* Orbiting accent spheres */}
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2;
        const radius = 2.4;
        return (
          <Float
            key={i}
            speed={1.5 + i * 0.2}
            rotationIntensity={0.3}
            floatIntensity={0.5}
          >
            <Sphere
              args={[0.22, 32, 32]}
              position={[
                Math.cos(angle) * radius,
                Math.sin(angle * 0.7) * 0.6,
                Math.sin(angle) * radius,
              ]}
            >
              <meshStandardMaterial
                color={i % 2 === 0 ? "#fb923c" : "#fbbf24"}
                roughness={0.3}
                metalness={0.5}
              />
            </Sphere>
          </Float>
        );
      })}
    </group>
  );
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          <pointLight position={[-5, -5, -5]} intensity={0.5} color="#f97316" />
          <FloatingFood />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
