import { Canvas, useFrame } from "@react-three/fiber";
import { Float, ContactShadows, Text, Sparkles as DreiSparkles } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

interface ThreeDAuthSceneProps {
  role: "player" | "owner" | "admin";
  isHoveringButton?: boolean;
}

// 3D Football Mesh
function Football({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.4;
      meshRef.current.rotation.y += delta * 0.6;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={1.8}>
      <group ref={meshRef} position={position}>
        {/* Ball Core */}
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.55, 32, 32]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.25}
            metalness={0.05}
          />
        </mesh>
        {/* Black Patches */}
        {[
          [0, 0.55, 0],
          [0, -0.55, 0],
          [0.52, 0.15, 0],
          [-0.52, 0.15, 0],
          [0, 0.2, 0.52],
          [0, 0.2, -0.52],
        ].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]}>
            <circleGeometry args={[0.18, 5]} />
            <meshStandardMaterial
              color="#111827"
              roughness={0.3}
              polygonOffset
              polygonOffsetFactor={-1}
            />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

// 3D Cricket Ball Mesh
function CricketBall({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += delta * 0.5;
      meshRef.current.rotation.x += delta * 0.3;
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={1.8} floatIntensity={1.5}>
      <group ref={meshRef} position={position}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.42, 32, 32]} />
          <meshStandardMaterial
            color="#991b1b"
            roughness={0.3}
            metalness={0.15}
          />
        </mesh>
        {/* White Seam */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.425, 0.016, 16, 48]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.5} />
        </mesh>
      </group>
    </Float>
  );
}

// 3D Stadium Turf Pitch with Markings
function TurfField() {
  return (
    <group position={[0, -1.8, 0]}>
      {/* Ground plane */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 10]} />
        <meshStandardMaterial
          color="#166534"
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>

      {/* Mown grass stripes */}
      {[-3, -1, 1, 3].map((x) => (
        <mesh
          key={x}
          receiveShadow
          position={[x, 0.005, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[1.5, 10]} />
          <meshStandardMaterial color="#15803d" roughness={0.8} />
        </mesh>
      ))}

      {/* Center circle */}
      <mesh
        position={[0, 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[1.4, 1.48, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.65} />
      </mesh>

      {/* Center line */}
      <mesh
        position={[0, 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[0.08, 10]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.65} />
      </mesh>
    </group>
  );
}

// Stadium Floodlight Towers
function FloodlightTower({
  position,
  color,
  intensity,
}: {
  position: [number, number, number];
  color: string;
  intensity: number;
}) {
  return (
    <group position={position}>
      {/* Pole */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 3, 12]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Light head */}
      <mesh position={[0, 3, 0]}>
        <boxGeometry args={[0.6, 0.35, 0.2]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={intensity * 2}
        />
      </mesh>
      <pointLight
        position={[0, 3, 0.2]}
        color={color}
        intensity={intensity}
        distance={12}
        decay={2}
      />
    </group>
  );
}

// Animated Camera Rig with Parallax & Reduced Motion Support
function CameraRig({ isReducedMotion }: { isReducedMotion: boolean }) {
  useFrame((state) => {
    if (isReducedMotion) {
      state.camera.position.set(0, 0.5, 6);
      state.camera.lookAt(0, 0, 0);
      return;
    }
    const targetX = (state.pointer.x * 0.8);
    const targetY = (state.pointer.y * 0.5) + 0.3;
    state.camera.position.x = THREE.MathUtils.damp(
      state.camera.position.x,
      targetX,
      2.5,
      0.02
    );
    state.camera.position.y = THREE.MathUtils.damp(
      state.camera.position.y,
      targetY,
      2.5,
      0.02
    );
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

export function ThreeDAuthScene({
  role,
  isHoveringButton = false,
}: ThreeDAuthSceneProps) {
  const isReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Theme lighting configuration by role
  const theme = useMemo(() => {
    if (role === "admin") {
      return {
        ambient: "#f59e0b",
        floodlight: "#fbbf24",
        ambientIntensity: 0.7,
        floodlightIntensity: isHoveringButton ? 2.5 : 1.6,
      };
    }
    if (role === "owner") {
      return {
        ambient: "#0284c7",
        floodlight: "#38bdf8",
        ambientIntensity: 0.7,
        floodlightIntensity: isHoveringButton ? 2.5 : 1.6,
      };
    }
    return {
      ambient: "#10b981",
      floodlight: "#34d399",
      ambientIntensity: 0.8,
      floodlightIntensity: isHoveringButton ? 2.8 : 1.8,
    };
  }, [role, isHoveringButton]);

  return (
    <div className="relative h-full w-full overflow-hidden select-none">
      <Canvas
        shadows
        camera={{ position: [0, 0.5, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <CameraRig isReducedMotion={isReducedMotion} />

        {/* Ambient & Directional Arena Lighting */}
        <ambientLight color={theme.ambient} intensity={theme.ambientIntensity} />
        <directionalLight
          position={[5, 8, 4]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        {/* Stadium Floodlight Towers */}
        <FloodlightTower
          position={[-3.8, -1.8, -2]}
          color={theme.floodlight}
          intensity={theme.floodlightIntensity}
        />
        <FloodlightTower
          position={[3.8, -1.8, -2]}
          color={theme.floodlight}
          intensity={theme.floodlightIntensity}
        />

        {/* Turf Pitch Ground */}
        <TurfField />

        {/* Floating Sports Assets */}
        <Football position={[-1.6, 0.3, 0.5]} />
        <CricketBall position={[1.7, 0.4, 0.2]} />

        {/* Floating Atmosphere Dust/Sparkles */}
        {!isReducedMotion && (
          <DreiSparkles
            count={45}
            scale={8}
            size={2.5}
            speed={0.4}
            opacity={0.45}
            color={theme.floodlight}
          />
        )}

        {/* Contact Shadows on Pitch */}
        <ContactShadows
          position={[0, -1.78, 0]}
          opacity={0.65}
          scale={10}
          blur={1.8}
          far={3}
        />
      </Canvas>

      {/* Floating 3D Badge Overlay */}
      <div className="pointer-events-none absolute bottom-5 left-5 z-10 rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 backdrop-blur-md">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-white/80">
          Playo Interactive Arena
        </p>
        <p className="text-[10px] text-white/50">
          React Three Fiber · Realtime 3D Engine
        </p>
      </div>
    </div>
  );
}
