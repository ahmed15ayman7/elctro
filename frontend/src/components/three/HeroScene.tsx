"use client";

import { useMemo, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

const BUN = "#d4a574";
const BUN_DARK = "#b8895c";
const PATTY = "#3d2a22";
const CHEESE = "#e8a838";
const LETTUCE = "#5a9e5a";
const TOMATO = "#c83c3c";
const FRY = "#e8c06a";
const FRY_DARK = "#c9953a";

const FOOD_SCALE = 2.05;

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
        pos: new THREE.Vector3(Math.cos(a) * rr, y + (rng(i + 2, seed) - 0.5) * 0.04, Math.sin(a) * rr),
        s: 0.028 + rng(i + 3, seed) * 0.02,
      };
    });
  }, [count, radius, y, seed]);

  return (
    <group>
      {seeds.map((s, i) => (
        <mesh key={i} position={s.pos} scale={s.s} castShadow>
          <sphereGeometry args={[1, 10, 10]} />
          <meshStandardMaterial color="#f5e6d3" roughness={0.88} metalness={0} envMapIntensity={0.85} />
        </mesh>
      ))}
    </group>
  );
}

function BurgerStack() {
  return (
    <group position={[0, -0.35, 0]}>
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.78, 0.86, 0.26, 64]} />
        <meshStandardMaterial color={BUN} roughness={0.82} metalness={0} envMapIntensity={1.1} />
      </mesh>
      <SesameSeeds count={28} radius={0.7} y={0.11} seed={1.1} />

      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.88, 0.88, 0.11, 48]} />
        <meshStandardMaterial color={PATTY} roughness={0.95} metalness={0} envMapIntensity={0.45} />
      </mesh>

      <mesh position={[0.32, 0.27, 0.08]} rotation={[0.35, 0.45, 0.28]} castShadow>
        <boxGeometry args={[0.44, 0.038, 0.4]} />
        <meshStandardMaterial color={CHEESE} roughness={0.55} metalness={0.05} envMapIntensity={0.9} />
      </mesh>
      <mesh position={[0, 0.27, 0]} rotation={[0, 0, 0.06]} castShadow receiveShadow>
        <boxGeometry args={[1.02, 0.032, 1.02]} />
        <meshStandardMaterial color={CHEESE} roughness={0.58} metalness={0.04} envMapIntensity={0.85} />
      </mesh>

      <mesh position={[0, 0.33, 0]} rotation={[Math.PI / 2, 0, 0.35]} castShadow>
        <torusGeometry args={[0.52, 0.065, 16, 48]} />
        <meshStandardMaterial color={LETTUCE} roughness={0.78} metalness={0} envMapIntensity={0.55} />
      </mesh>
      <mesh position={[0, 0.36, 0]} rotation={[Math.PI / 2, 0, -0.22]} castShadow>
        <torusGeometry args={[0.48, 0.05, 12, 40]} />
        <meshStandardMaterial color="#4a8f4a" roughness={0.8} metalness={0} envMapIntensity={0.5} />
      </mesh>

      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.82, 0.82, 0.052, 48]} />
        <meshStandardMaterial color={TOMATO} roughness={0.42} metalness={0.02} envMapIntensity={0.75} />
      </mesh>

      <mesh position={[0, 0.72, 0]} scale={[1, 0.68, 1]} castShadow receiveShadow>
        <sphereGeometry args={[0.7, 48, 48]} />
        <meshStandardMaterial color={BUN} roughness={0.78} metalness={0} envMapIntensity={1.05} />
      </mesh>
      <mesh position={[0, 0.72, 0]} scale={[1, 0.68, 1]}>
        <sphereGeometry args={[0.71, 48, 48, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color={BUN_DARK} roughness={0.72} metalness={0} envMapIntensity={0.95} />
      </mesh>
      <SesameSeeds count={22} radius={0.54} y={0.92} seed={2.7} />

      <mesh position={[-0.52, 0.3, 0.32]} rotation={[0.85, 0.38, 0.48]} castShadow>
        <cylinderGeometry args={[0.11, 0.11, 0.018, 24]} />
        <meshStandardMaterial color="#7cb87c" roughness={0.62} metalness={0} envMapIntensity={0.5} />
      </mesh>
    </group>
  );
}

/** Fixed fries around the burger — no animation, natural fast-food scatter */
function StaticFryRing({ count = 22 }: { count?: number }) {
  const fries = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + 0.12;
      const radius = 1.72 + (i % 5) * 0.09;
      const y = -0.42 + rng(i, 4.2) * 0.55;
      const len = 0.34 + rng(i + 17, 4.2) * 0.2;
      const thick = 0.052 + rng(i + 3, 4.2) * 0.022;
      return {
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        y,
        len,
        thick,
        rotX: rng(i + 1, 4.2) * 0.45 - 0.22,
        rotY: angle + Math.PI / 2 + (rng(i + 6, 4.2) - 0.5) * 0.35,
        rotZ: rng(i + 2, 4.2) * 0.55 - 0.28,
        hue: rng(i + 5, 4.2) > 0.45 ? FRY : FRY_DARK,
      };
    });
  }, [count]);

  return (
    <group>
      {fries.map((f, i) => (
        <mesh
          key={i}
          position={[f.x, f.y, f.z]}
          rotation={[f.rotX, f.rotY, f.rotZ]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[f.thick, f.len, f.thick]} />
          <meshStandardMaterial color={f.hue} roughness={0.62} metalness={0.02} envMapIntensity={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function StaticOuterFries() {
  const items = useMemo(() => {
    const n = 12;
    return Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 + 0.55;
      const r = 2.45 + (i % 2) * 0.08;
      return {
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        y: -0.28 + (i % 3) * 0.12,
        ry: a + 0.2,
        len: 0.26 + rng(i, 9.1) * 0.12,
        hue: i % 2 === 0 ? FRY : "#e6cf8a",
      };
    });
  }, []);

  return (
    <group>
      {items.map((it, i) => (
        <mesh
          key={i}
          position={[it.x, it.y, it.z]}
          rotation={[0.25, it.ry, 0.15]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.1, 0.07, it.len]} />
          <meshStandardMaterial color={it.hue} roughness={0.65} metalness={0.02} envMapIntensity={0.85} />
        </mesh>
      ))}
    </group>
  );
}

function HeroFoodScene() {
  return (
    <group scale={FOOD_SCALE}>
      <BurgerStack />
      <StaticFryRing count={22} />
      <StaticOuterFries />
      <ContactShadows
        position={[0, -1.05, 0]}
        opacity={0.52}
        scale={11}
        blur={2.2}
        far={5}
        color="#2a1810"
      />
    </group>
  );
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0.12, 4.35], fov: 38 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
        dpr={[1, 2]}
        shadows
      >
        <Suspense fallback={null}>
          <color attach="background" args={["transparent"]} />
          <ambientLight intensity={0.38} />
          <directionalLight
            position={[5.5, 9, 4]}
            intensity={1.55}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-far={22}
            shadow-camera-left={-6}
            shadow-camera-right={6}
            shadow-camera-top={6}
            shadow-camera-bottom={-6}
            shadow-bias={-0.00015}
          />
          <directionalLight position={[-3.5, 4, -2]} intensity={0.35} color="#fef3e2" />
          <spotLight
            position={[-3.5, 6.5, 3]}
            angle={0.42}
            penumbra={0.75}
            intensity={0.55}
            color="#fff5eb"
            castShadow
          />
          <pointLight position={[2, 1.5, 4]} intensity={0.22} color="#ffe4c4" />
          <HeroFoodScene />
          <Environment preset="studio" environmentIntensity={1.05} />
        </Suspense>
      </Canvas>
    </div>
  );
}
