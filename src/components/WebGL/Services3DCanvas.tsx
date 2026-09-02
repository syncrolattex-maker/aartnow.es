import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

interface Services3DCanvasProps {
  activeService: number;
}

export default function Services3DCanvas({ activeService }: Services3DCanvasProps) {
  const meshRef = useRef<THREE.Group>(null);
  const targetRotation = useRef(new THREE.Vector2(0, 0));

  useFrame((state) => {
    if (!meshRef.current) return;

    // Smooth continuous 3D rotation
    meshRef.current.rotation.x += 0.005;
    meshRef.current.rotation.y += 0.008;

    // React to cursor mouse coordinates
    targetRotation.current.x = state.pointer.y * 0.5;
    targetRotation.current.y = state.pointer.x * 0.5;

    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotation.current.x, 0.05);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotation.current.y, 0.05);
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
      <group ref={meshRef}>
        
        {/* Service 01: Branding -> 3D Wireframe Icosahedron */}
        {activeService === 0 && (
          <mesh>
            <icosahedronGeometry args={[1.3, 1]} />
            <meshStandardMaterial 
              color="#A3FF12" 
              wireframe={true} 
              wireframeLinewidth={2}
              emissive="#A3FF12"
              emissiveIntensity={0.6}
            />
          </mesh>
        )}

        {/* Service 02: Websites & WebGL -> 3D Particle Wave Sphere */}
        {activeService === 1 && (
          <points>
            <sphereGeometry args={[1.4, 32, 32]} />
            <pointsMaterial 
              color="#A3FF12" 
              size={0.035} 
              sizeAttenuation={true}
              transparent={true}
              opacity={0.9}
            />
          </points>
        )}

        {/* Service 03: E-Commerce -> 3D Cubic Matrix Grid */}
        {activeService === 2 && (
          <group>
            <mesh>
              <boxGeometry args={[1.4, 1.4, 1.4]} />
              <meshStandardMaterial 
                color="#A3FF12" 
                wireframe={true}
                emissive="#A3FF12"
                emissiveIntensity={0.5}
              />
            </mesh>
            <mesh>
              <octahedronGeometry args={[0.7]} />
              <meshStandardMaterial color="#FFFFFF" wireframe={true} />
            </mesh>
          </group>
        )}

        {/* Service 04: Marketing & Growth -> 3D Kinetic Torus Knot */}
        {activeService === 3 && (
          <mesh>
            <torusKnotGeometry args={[0.9, 0.28, 128, 32]} />
            <meshStandardMaterial 
              color="#A3FF12" 
              wireframe={true} 
              wireframeLinewidth={1.5}
              emissive="#A3FF12"
              emissiveIntensity={0.4}
            />
          </mesh>
        )}

      </group>
    </Float>
  );
}
