"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

const BUN = "#e8b565";
const BUN_DARK = "#c99545";
const PATTY = "#4a3228";
const CHEESE = "#fbbf24";
const LETTUCE = "#4ade80";
const TOMATO = "#ef4444";
const FRY = "#fcd34d";
const FRY_DARK = "#f59e0b";

function rng(i: number, seed: number) {
  const x = Math.sin(i * 12.9898 + seed) * 43758.5453;
  return x - Math.floor(x);
}

function SesameSeeds({
  count,
  radius,
  y,
  seed,
}: {
  count: number;
  radius: number;
  y: number;
  seed: number;
}) {
  const seeds = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const a = rng(i, seed) * Math.PI * 2;
      const rr = radius * (0.55 + rng(i + 1, seed) * 0.45);
      return {
        pos: new THREE.Vector3(Math.cos(a) * rr, y + (rng(i + 2, seed) - 0.5) * 0.05, Math.sin(a) * rr),
        s: 0.026 + rng(i + 3, seed) * 0.022,
      };
    });
  }, [count, radius, y, seed]);

  return (
    <group>
      {seeds.map((s, i) => (
        <mesh key={i} position={s.pos} scale={s.s} castShadow>
          <sphereGeometry args={[1, 6, 6]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.65} metalness={0.02} />
        </mesh>
      ))}
    </group>
  );
}

function BurgerStack() {
  return (
    <group position={[0, -0.35, 0]}>
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.78, 0.86, 0.26, 48]} />
        <meshStandardMaterial color={BUN} roughness={0.78} metalness={0.05} />
      </mesh>
      <SesameSeeds count={26} radius={0.7} y={0.11} seed={1.1} />

      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.88, 0.88, 0.11, 40]} />
        <meshStandardMaterial color={PATTY} roughness={0.92} metalness={0} />
      </mesh>

      <mesh position={[0.35, 0.28, 0.1]} rotation={[0.4, 0.5, 0.35]} castShadow>
        <boxGeometry args={[0.42, 0.045, 0.38]} />
        <meshStandardMaterial
          color={CHEESE}
          roughness={0.35}
          metalness={0.25}
          emissive="#ca8a04"
          emissiveIntensity={0.08}
        />
      </mesh>
      <mesh position={[0, 0.27, 0]} rotation={[0, 0, 0.08]} castShadow receiveShadow>
        <boxGeometry args={[1.02, 0.035, 1.02]} />
        <meshStandardMaterial color={CHEESE} roughness={0.4} metalness={0.15} />
      </mesh>

      <mesh position={[0, 0.33, 0]} rotation={[Math.PI / 2, 0, 0.4]} castShadow>
        <torusGeometry args={[0.52, 0.07, 10, 40]} />
        <meshStandardMaterial color={LETTUCE} roughness={0.65} metalness={0} />
      </mesh>
      <mesh position={[0, 0.36, 0]} rotation={[Math.PI / 2, 0, -0.25]} castShadow>
        <torusGeometry args={[0.48, 0.055, 8, 36]} />
        <meshStandardMaterial color="#22c55e" roughness={0.7} />
      </mesh>

      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.82, 0.82, 0.055, 36]} />
        <meshStandardMaterial color={TOMATO} roughness={0.35} metalness={0.1} />
      </mesh>

      <mesh position={[0, 0.72, 0]} scale={[1, 0.68, 1]} castShadow receiveShadow>
        <sphereGeometry args={[0.7, 40, 40]} />
        <meshStandardMaterial color={BUN} roughness={0.72} metalness={0.06} />
      </mesh>
      <mesh position={[0, 0.72, 0]} scale={[1, 0.68, 1]}>
        <sphereGeometry args={[0.71, 40, 40, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color={BUN_DARK} roughness={0.55} metalness={0.08} />
      </mesh>
      <SesameSeeds count={20} radius={0.54} y={0.92} seed={2.7} />

      <mesh position={[-0.55, 0.3, 0.35]} rotation={[0.9, 0.4, 0.5]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.02, 20]} />
        <meshStandardMaterial color="#86efac" roughness={0.5} metalness={0.05} />
      </mesh>
    </group>
  );
}

function FryOrbit({ count = 18 }: { count?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  const fries = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const radius = 1.85 + (i % 4) * 0.12;
      const y = -0.35 + rng(i, 4.2) * 1.1;
      const len = 0.32 + rng(i + 17, 4.2) * 0.22;
      const thick = 0.055 + rng(i + 3, 4.2) * 0.025;
      return {
        angle,
        radius,
        y,
        len,
        thick,
        rotX: rng(i + 1, 4.2) * Math.PI * 0.35,
        rotZ: rng(i + 2, 4.2) * Math.PI * 0.5,
        speed: 0.6 + rng(i + 4, 4.2) * 0.9,
        hue: rng(i + 5, 4.2) > 0.5 ? FRY : FRY_DARK,
      };
    });
  }, [count]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = t * 0.35;
    groupRef.current.children.forEach((child, i) => {
      const f = fries[i];
      if (!f || !child) return;
      child.position.y = f.y + Math.sin(t * f.speed + i) * 0.06;
    });
  });

  return (
    <group ref={groupRef}>
      {fries.map((f, i) => {
        const x = Math.cos(f.angle) * f.radius;
        const z = Math.sin(f.angle) * f.radius;
        return (
          <mesh
            key={i}
            position={[x, f.y, z]}
            rotation={[f.rotX, f.angle + Math.PI / 2, f.rotZ]}
            castShadow
          >
            <boxGeometry args={[f.thick, f.len, f.thick]} />
            <meshStandardMaterial color={f.hue} roughness={0.45} metalness={0.15} />
          </mesh>
        );
      })}
    </group>
  );
}

function OuterFryHalo() {
  const ref = useRef<THREE.Group>(null);
  const n = 10;

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = -state.clock.elapsedTime * 0.22;
  });

  return (
    <group ref={ref}>
      {Array.from({ length: n }).map((_, i) => {
        const a = (i / n) * Math.PI * 2 + 0.4;
        const r = 2.65;
        return (
          <Float key={i} speed={1.2 + i * 0.07} rotationIntensity={0.35} floatIntensity={0.4}>
            <mesh
              position={[Math.cos(a) * r, 0.15 + (i % 3) * 0.2, Math.sin(a) * r]}
              rotation={[0.3, a, 0.2]}
              castShadow
            >
              <boxGeometry args={[0.12, 0.08, 0.28]} />
              <meshStandardMaterial color={i % 2 === 0 ? FRY : "#fde68a"} roughness={0.5} />
            </mesh>
          </Float>
        );
      })}
    </group>
  );
}

function HeroFoodScene() {
  const rootRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!rootRef.current) return;
    rootRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.12;
  });

  return (
    <group ref={rootRef}>
      <Float speed={1.8} rotationIntensity={0.25} floatIntensity={0.55}>
        <BurgerStack />
      </Float>
      <FryOrbit count={18} />
      <OuterFryHalo />
      <ContactShadows position={[0, -1.15, 0]} opacity={0.45} scale={9} blur={2.8} far={4.5} color="#431407" />
    </group>
  );
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0.35, 6.2], fov: 48 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        shadows
      >
        <Suspense fallback={null}>
          <color attach="background" args={["transparent"]} />
          <ambientLight intensity={0.45} />
          <directionalLight
            position={[6, 8, 5]}
            intensity={1.35}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-camera-far={20}
            shadow-camera-left={-5}
            shadow-camera-right={5}
            shadow-camera-top={5}
            shadow-camera-bottom={-5}
          />
          <spotLight position={[-4, 6, 2]} angle={0.45} penumbra={0.85} intensity={0.9} color="#fdba74" castShadow />
          <pointLight position={[0, -2, 3]} intensity={0.35} color="#fb923c" />
          <HeroFoodScene />
          <Environment preset="sunset" />
        </Suspense>
      </Canvas>
    </div>
  );
}
