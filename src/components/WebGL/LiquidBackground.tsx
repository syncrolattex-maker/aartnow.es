import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uScrollVelocity;
  uniform float uGlitchBurst;
  uniform vec2 uResolution;
  varying vec2 vUv;

  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = vUv;

    // Pixel Grid Discretization
    float gridResolution = 60.0;
    vec2 gridUv = floor(uv * gridResolution) / gridResolution;

    // Apply Matrix Glitch Tearing ONLY on Scroll Section Transitions
    if (uGlitchBurst > 0.001) {
      float glitchLine = sin(gridUv.y * 140.0 + uTime * 50.0);
      float tear = step(0.55, glitchLine) * 0.14 * uGlitchBurst;
      gridUv.x += tear;
    }

    vec2 distortedUv = gridUv;

    // Multi-layered GLSL pixel distortion noise EXCLUSIVELY driven by Scroll Velocity & Glitch Burst (No Mouse Motion)
    float noiseVal = snoise(distortedUv * (12.0 + uScrollVelocity * 10.0) + vec2(uTime * 0.4, uTime * 0.4));
    float pixelBlock = snoise(floor(distortedUv * 40.0) / 40.0 + uTime * 0.2);

    // Calculate pixel distortion intensity solely from scroll movement and section transitions
    float distortionIntensity = uScrollVelocity * 0.8 + uGlitchBurst * 2.2;
    float pixelEffect = clamp(pixelBlock * distortionIntensity + uGlitchBurst * 0.7, 0.0, 1.0);

    // Monochromatic & Jack & AI Red Signal Pixel Highlight Colors
    vec3 baseBg = vec3(0.0, 0.0, 0.0);
    vec3 redSignal = vec3(1.0, 0.075, 0.0); // #FF1300
    vec3 pixelColor = mix(vec3(0.08, 0.08, 0.08), redSignal, clamp(uScrollVelocity * 0.5 + uGlitchBurst * 0.9, 0.0, 1.0));

    vec3 finalColor = mix(baseBg, pixelColor, pixelEffect * 0.85);

    // Accentuate pixel borders (Pixel Grid Lines)
    vec2 gridPattern = fract(uv * gridResolution);
    float border = step(0.05, gridPattern.x) * step(0.05, gridPattern.y);
    finalColor *= (0.85 + border * 0.15);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export default function LiquidBackground() {
  const meshRef = useRef<THREE.Mesh>(null);
  const scrollVelocity = useRef(0);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScrollVelocity: { value: 0 },
      uGlitchBurst: { value: 0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    }),
    []
  );

  useEffect(() => {
    const handleResize = () => {
      if (meshRef.current) {
        const material = meshRef.current.material as THREE.ShaderMaterial;
        material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
      }
    };

    // GSAP ScrollTrigger Integration for Precision Scroll Velocity Tracking
    const trigger = ScrollTrigger.create({
      onUpdate: (self) => {
        const vel = Math.abs(self.getVelocity()) / 1200;
        scrollVelocity.current = Math.min(vel, 3.5);
      },
    });

    // Intense Section Transition Glitch Burst Triggers
    const glitchObj = { value: 0 };
    const fireGlitchBurst = () => {
      if (!meshRef.current) return;
      const material = meshRef.current.material as THREE.ShaderMaterial;

      gsap.fromTo(
        glitchObj,
        { value: 2.0 },
        {
          value: 0.0,
          duration: 0.5,
          ease: 'power2.out',
          onUpdate: () => {
            material.uniforms.uGlitchBurst.value = glitchObj.value;
          },
        }
      );
    };

    const sectionTriggers: ScrollTrigger[] = [];
    ['#hero', '#work', '#about', '#contact'].forEach((selector) => {
      const st = ScrollTrigger.create({
        trigger: selector,
        start: 'top 50%',
        onEnter: fireGlitchBurst,
        onEnterBack: fireGlitchBurst,
      });
      sectionTriggers.push(st);
    });

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      trigger.kill();
      sectionTriggers.forEach((st) => st.kill());
    };
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const material = meshRef.current.material as THREE.ShaderMaterial;

    // Time uniform
    material.uniforms.uTime.value = state.clock.getElapsedTime();

    // Decay GSAP ScrollTrigger Velocity smoothly
    scrollVelocity.current = THREE.MathUtils.lerp(scrollVelocity.current, 0, 0.05);

    // Update Scroll Uniforms EXCLUSIVELY
    material.uniforms.uScrollVelocity.value = THREE.MathUtils.lerp(
      material.uniforms.uScrollVelocity.value,
      scrollVelocity.current,
      0.1
    );
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}
