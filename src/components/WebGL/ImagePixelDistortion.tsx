import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uProgress;
  uniform float uTime;
  uniform vec2 uMouse;
  varying vec2 vUv;

  // Jack & AI Pixel Distortion + RGB Chromatic Shift GLSL Shader
  void main() {
    vec2 uv = vUv;

    // Discretize UV into Pixel Grid blocks
    float pixels = 40.0;
    vec2 gridUv = floor(uv * pixels) / pixels;

    // Distance & Mouse Proximity
    float distToMouse = distance(uv, uMouse);
    float mouseWave = smoothstep(0.4, 0.0, distToMouse) * uProgress;

    // Distort UV by Pixel Noise & Wave
    vec2 distortedUv = mix(uv, gridUv + vec2(sin(uTime * 4.0 + uv.y * 10.0) * 0.02 * mouseWave), uProgress * 0.7);

    // RGB Chromatic Aberration Shift
    float rgbOffset = 0.008 * uProgress * (1.0 + mouseWave);
    float r = texture2D(uTexture, distortedUv + vec2(rgbOffset, 0.0)).r;
    float g = texture2D(uTexture, distortedUv).g;
    float b = texture2D(uTexture, distortedUv - vec2(rgbOffset, 0.0)).b;

    vec3 finalColor = vec3(r, g, b);

    // Neon highlight glow on intense distortion
    vec3 neonHighlight = vec3(0.64, 1.0, 0.07); // #A3FF12
    finalColor = mix(finalColor, neonHighlight, mouseWave * 0.25);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

interface ImagePixelDistortionProps {
  url: string;
  isHovered: boolean;
  mousePos?: { x: number; y: number };
}

export default function ImagePixelDistortion({ url, isHovered }: ImagePixelDistortionProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(url);

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    }),
    [texture]
  );

  useFrame((state) => {
    if (!meshRef.current) return;
    const material = meshRef.current.material as THREE.ShaderMaterial;

    // Time uniform
    material.uniforms.uTime.value = state.clock.getElapsedTime();

    // Lerp Hover Progress for smooth WebGL transition
    material.uniforms.uProgress.value = THREE.MathUtils.lerp(
      material.uniforms.uProgress.value,
      isHovered ? 1.0 : 0.0,
      0.1
    );
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[3.2, 1.8]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
      />
    </mesh>
  );
}
