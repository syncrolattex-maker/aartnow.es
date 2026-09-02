import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

const vertexShader = `
  uniform float uTilt;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // 3D Horizontal Drag Tilt Curvature effect
    pos.z += sin(uv.x * 3.14159) * uTilt * 0.3;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uProgress;
  uniform float uTime;
  varying vec2 vUv;

  // Pulsating Gradual Pixelation Shader: Smooth resolution with digital pulse bursts
  void main() {
    vec2 uv = vUv;

    // Pulsating modulation wave (rhythmic digital heartbeat)
    float pulseWave = sin(uTime * 14.0) * 0.08 * uProgress;
    float smoothProgress = clamp(uProgress + pulseWave, 0.0, 1.0);

    float basePixels = 18.0;
    float sharpPixels = 800.0;
    float currentPixels = mix(basePixels, sharpPixels, smoothProgress);

    vec2 gridUv = floor(uv * currentPixels) / currentPixels;
    vec2 finalUv = mix(gridUv, uv, smoothProgress);

    vec4 texColor = texture2D(uTexture, finalUv);

    // Subtle red signal highlight on hover resolution
    vec3 redSignal = vec3(1.0, 0.075, 0.0); // #FF1300
    texColor.rgb = mix(texColor.rgb, texColor.rgb + redSignal * 0.08, smoothProgress * 0.12);

    gl_FragColor = texColor;
  }
`;

interface HorizontalThreeShowcaseProps {
  url: string;
  isHovered: boolean;
  tilt?: number;
}

export default function HorizontalThreeShowcase({ url, isHovered, tilt = 0 }: HorizontalThreeShowcaseProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(url);

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uTilt: { value: 0 },
    }),
    [texture]
  );

  useFrame((state) => {
    if (!meshRef.current) return;
    const material = meshRef.current.material as THREE.ShaderMaterial;

    material.uniforms.uTime.value = state.clock.getElapsedTime();
    
    // Smooth gradual lerp with pulsating GLSL wave
    material.uniforms.uProgress.value = THREE.MathUtils.lerp(
      material.uniforms.uProgress.value,
      isHovered ? 1.0 : 0.0,
      0.1
    );

    material.uniforms.uTilt.value = THREE.MathUtils.lerp(
      material.uniforms.uTilt.value,
      tilt,
      0.1
    );
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[4.2, 2.4, 16, 16]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
      />
    </mesh>
  );
}
