import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
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
  varying vec2 vUv;
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uHover;

  void main() {
    vec2 uv = vUv;
    
    // Distort UVs based on mouse and time
    float distortion = sin(uv.y * 10.0 + uTime) * 0.02 * uHover;
    uv.x += distortion;
    
    vec4 color = texture2D(uTexture, uv);
    
    // Add subtle noise
    float noise = (fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.05;
    color.rgb += noise;
    
    gl_FragColor = color;
  }
`;

interface ImageDistortionProps {
  url: string;
  position: [number, number, number];
  scale: [number, number, number];
}

export default function ImageDistortion({ url, position, scale }: ImageDistortionProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(url);
  const hovered = useRef(0);

  const uniforms = useMemo(() => ({
    uTexture: { value: texture },
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uHover: { value: 0 },
  }), [texture]);

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.elapsedTime;
      
      // Smoothly animate hover value
      material.uniforms.uHover.value = THREE.MathUtils.lerp(
        material.uniforms.uHover.value,
        hovered.current,
        0.1
      );
    }
  });

  return (
    <mesh 
      ref={meshRef} 
      position={position} 
      scale={scale}
      onPointerOver={() => (hovered.current = 1)}
      onPointerOut={() => (hovered.current = 0)}
    >
      <planeGeometry args={[1, 1, 32, 32]} />
      <shaderMaterial 
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}
