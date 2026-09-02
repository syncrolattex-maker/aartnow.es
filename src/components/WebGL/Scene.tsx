import { Canvas } from '@react-three/fiber';
import LiquidBackground from './LiquidBackground';

export default function Scene() {
  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1] overflow-hidden">
      <Canvas 
        camera={{ position: [0, 0, 1] }} 
        dpr={[1, 1.5]}
        gl={{ powerPreference: "high-performance", antialias: false }}
        className="w-full h-full"
      >
        <LiquidBackground />
      </Canvas>
    </div>
  );
}
