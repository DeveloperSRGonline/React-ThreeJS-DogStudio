import {
  OrbitControls,
  useAnimations,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo } from "react";
import * as THREE from "three";

const Dog = () => {
  const model = useGLTF("/models/dog.drc.glb");
  const { camera, gl } = useThree();

  useLayoutEffect(() => {
    camera.position.z = 0.45;
    gl.toneMapping = THREE.ReinhardToneMapping;
    gl.outputColorSpace = THREE.SRGBColorSpace;
  }, [camera, gl]);

  const { actions } = useAnimations(model.animations, model.scene);

  useEffect(()=>{
    actions['Take 001']?.play();
  },[actions])

  //   const textures = useTexture({
  //     normalMap: "/dog_normals.jpg",
  //     sampleMatCap: "/matcap/mat-2.png",
  //   });

  const [normalMap, sampleMatCap,branchMap,branchNormalMap] = useTexture([
    "/dog_normals.jpg",
    "/matcap/mat-2.png",
    "/branches_diffuse.jpeg",
    "/branches_normals.jpeg"
  ]).map((texture) => {
    texture.flipY = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  });

  const dogMaterial = useMemo(() => {
    return new THREE.MeshMatcapMaterial({
      normalMap: normalMap,
      matcap: sampleMatCap,
    });
  }, [normalMap, sampleMatCap]);

  useLayoutEffect(() => {
    model.scene.traverse((child) => {
      if (child.name.includes("DOG")) {
        child.material = dogMaterial;
      }
    });
  }, [model.scene, dogMaterial]);

  return (
    <>
      <primitive
        object={model.scene}
        position={[0.2, -0.59, 0]}
        rotation={[0, Math.PI / 4.9, 0]}
      />
      <directionalLight position={[0, 5, 5]} color={0xffffff} intensity={10} />
      <OrbitControls />
    </>
  );
};

export default Dog;
