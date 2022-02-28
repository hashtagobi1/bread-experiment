import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useRef, useState } from "react";
import * as THREE from "three";
// a loader that takes care of compression
import { useGLTF, Environment } from "@react-three/drei";
import { EffectComposer, DepthOfField } from "@react-three/postprocessing";
interface IBoxProps {
  z: number;
}

// ! Viewport relates to centered position

const Bread = ({ z }: IBoxProps) => {
  // Attach ref to object to gain access to it's paramenters
  const ref = useRef<any>(null);
  // bounds of the viewport in 3D u
  const { viewport, camera } = useThree();
  const viewportPosition = new THREE.Vector3(0, 0, z);
  const { width, height } = viewport.getCurrentViewport(
    camera,
    viewportPosition
  );

  const { nodes, materials } = useGLTF("/bread-comp-transformed.glb");

  const [data, setData] = useState({
    // we set x access to e.g. 2/2 = 1, rnage = -1 -> 1
    x: THREE.MathUtils.randFloatSpread(2),
    // the y axis = the height of the screen
    y: THREE.MathUtils.randFloatSpread(height),
    rX: Math.random() * Math.PI,
    rY: Math.random() * Math.PI,
    rZ: Math.random() * Math.PI,
  });

  useFrame((state) => {
    // set all 3 positions
    // X is from state + width of screen
    // Y from state and we increment it continuously
    ref.current.rotation.set(
      (data.rX += 0.004),
      (data.rY += 0.005),
      (data.rZ += 0.006)
    );
    ref.current.position.set(data.x * width, (data.y += 0.075), z);
    // if y is MORE than the viewport height +  buffer, then we set it to the bottom of the screen
    if (data.y > height) data.y = -height;
  });

  return (
    // we return a mesh
    // mesh must have shape + material
    <mesh
      ref={ref}
      geometry={nodes.Sliced_Bread001_Material001_0.geometry}
      material={materials.skin}
      rotation={[0, 0, 0.02]}
      scale={40}
      // material-emissive='orange'
    />
  );
};

export default function App({ count = 250, depth = 80 }) {
  return (
    <Canvas gl={{ alpha: false }} camera={{ near: 0.01, far: 110, fov: 80 }}>
      <color attach="background" args={["#C2B280"]} />
      |<ambientLight intensity={0.05} />
      <spotLight position={[10, 10, 10]} intensity={1} />
      <Suspense fallback={<h1>waiting...</h1>}>
        <Environment preset="apartment" />
        {Array.from({ length: count }, (_, i) => (
          <Bread z={-(i / count) * depth - 5} key={i} />
        ))}

        <EffectComposer>
          <DepthOfField
            target={[0, 0, depth / 4]}
            focalLength={0.5}
            bokehScale={5}
            height={700}
          />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
