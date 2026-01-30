import {
  OrbitControls,
  useAnimations,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

const Dog = () => {

  gsap.registerPlugin(useGSAP)
  gsap.registerPlugin(ScrollTrigger)
  
  // dog ka model
  const model = useGLTF("/models/dog.drc.glb");
  // camera and gl from threejs
  const { camera, gl } = useThree();

  // 100% srgb colors chahiye isliye
  useLayoutEffect(() => {
    camera.position.z = 0.45;
    gl.toneMapping = THREE.ReinhardToneMapping;
    gl.outputColorSpace = THREE.SRGBColorSpace;
  }, [camera, gl]);

  // dog ke little animation for make it feel real dog mein jaan put karne ke liye
  const { actions } = useAnimations(model.animations, model.scene);

  // jaise hi website open ki vaise hi ye animation start
  useEffect(() => {
    actions["Take 001"]?.play();
  }, [actions]);

  //   const textures = useTexture({
  //     normalMap: "/dog_normals.jpg",
  //     sampleMatCap: "/matcap/mat-2.png",
  //   });

  // dog ko 3d texture ke liye map and matcap for color
  const [normalMap, sampleMatCap] = useTexture([
    "/dog_normals.jpg",
    "/matcap/mat-2.png",
  ]).map((texture) => {
    texture.flipY = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  });

  // branch ko 3d texture ke liye map and matcap for color
  const [branchMap, branchNormalMap] = useTexture([
    "/branches_diffuse.jpeg",
    "/branches_normals.jpeg",
  ]).map((texture) => {
    texture.flipY = true;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  });

  // dog ka material create karne ke liye using normalMap and matcap
  const dogMaterial = useMemo(() => {
    return new THREE.MeshMatcapMaterial({
      normalMap: normalMap,
      matcap: sampleMatCap,
    });
  }, [normalMap, sampleMatCap]);

  // branch ka material create karne ke liye using normalMap and matcap
  const branchMaterial = useMemo(() => {
    return new THREE.MeshMatcapMaterial({
      normalMap: branchNormalMap,
      map: branchMap,
    });
  }, [branchNormalMap, branchMap]);

  // agar dog hai toh dog ka material and branch hai to branch ka material
  useLayoutEffect(() => {
    model.scene.traverse((child) => {
      if (child.name.includes("DOG")) {
        child.material = dogMaterial;
      } else {
        child.material = branchMaterial;
      }
    });
  }, [model.scene, dogMaterial]);

  const dogModel = useRef(model)

  useGSAP(()=>{
    const tl = gsap.timeline({
      scrollTrigger:{
        trigger:"#section-1",
        endTrigger:"#section-3",
        start:"top top",
        end:"bottom bottom",
        markers:true,
        scrub:true
      }
    })

    tl.to(dogModel.current.scene.position,{
      z:"-=0.75",
      y:"+=0.1"
    })
    .to(dogModel.current.scene.rotation,{
      x:`+=${Math.PI / 15}`
    })
    .to(dogModel.current.scene.rotation,{
      y:`-=${Math.PI}`
    },"third")
    .to(dogModel.current.scene.position,{
      x:"-=0.5",
      z:"+=0.4",
      y:"-=0.1"
    },"third")
  })
  return (
    <>
      <primitive
        object={model.scene}
        position={[0.2, -0.59, 0]}
        rotation={[0, Math.PI / 4.9, 0]}
      />
      <directionalLight position={[0, 5, 5]} color={0xffffff} intensity={10} />
    </>
  );
};

export default Dog;
