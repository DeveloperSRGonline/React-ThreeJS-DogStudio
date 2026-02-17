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
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useFrame } from "@react-three/fiber"; // useFrame add kiya

const Dog = () => {
  gsap.registerPlugin(useGSAP);
  gsap.registerPlugin(ScrollTrigger);

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
  const [normalMap] = useTexture(["/dog_normals.jpg"]).map((texture) => {
    texture.flipY = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  });

  const [eyeMatcap] = useTexture([
    "/matcap/mat-1.png", // Apne image ka sahi path yahan dalein
  ]).map((texture) => {
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

  // all matcap materials array
  const [
    mat1,
    mat2,
    mat3,
    mat4,
    mat5,
    mat6,
    mat7,
    mat8,
    mat9,
    mat10,
    mat11,
    mat12,
    mat13,
    mat14,
    mat15,
    mat16,
    mat17,
    mat18,
    mat19,
    mat20,
  ] = useTexture([
    "/matcap/mat-1.png",
    "/matcap/mat-2.png",
    "/matcap/mat-3.png",
    "/matcap/mat-4.png",
    "/matcap/mat-5.png",
    "/matcap/mat-6.png",
    "/matcap/mat-7.png",
    "/matcap/mat-8.png",
    "/matcap/mat-9.png",
    "/matcap/mat-10.png",
    "/matcap/mat-11.png",
    "/matcap/mat-12.png",
    "/matcap/mat-13.png",
    "/matcap/mat-14.png",
    "/matcap/mat-15.png",
    "/matcap/mat-16.png",
    "/matcap/mat-17.png",
    "/matcap/mat-18.png",
    "/matcap/mat-19.png",
    "/matcap/mat-20.png",
  ]).map((texture) => {
    texture.flipY = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  });

  // referance matcap
  const material = useRef({
    uMatcap1: { value: mat19 },
    uMatcap2: { value: mat2 },
    uProgress: { value: 1.2 },
  });

  const meshGroup = useRef(); // Group ka ref
  const mouse = useRef({ x: 0, y: 0 }); // Mouse position ka ref

  // dog ka material create karne ke liye using normalMap and matcap
  const dogMaterial = useMemo(() => {
    return new THREE.MeshMatcapMaterial({
      normalMap: normalMap,
      matcap: mat2,
    });
  }, [normalMap, mat2]);

  // 2. Eye ke liye naya Material create karein
  const eyeMaterial = useMemo(() => {
    return new THREE.MeshMatcapMaterial({
      matcap: eyeMatcap,
      // Agar aankhein thodi dark dikhein toh color add kar sakte hain:
      // color: "white"
    });
  }, [eyeMatcap]);

  // branch ka material create karne ke liye using normalMap and matcap
  const branchMaterial = useMemo(() => {
    return new THREE.MeshMatcapMaterial({
      normalMap: branchNormalMap,
      map: branchMap,
    });
  }, [branchNormalMap, branchMap]);

  function onBeforeCompile(shader) {
    shader.uniforms.uMatcapTexture1 = material.current.uMatcap1;
    shader.uniforms.uMatcapTexture2 = material.current.uMatcap2;
    shader.uniforms.uProgress = material.current.uProgress;

    // Store reference to shader uniforms for GSAP animation

    shader.fragmentShader = shader.fragmentShader.replace(
      "void main() {",
      `
        uniform sampler2D uMatcapTexture1;
        uniform sampler2D uMatcapTexture2;
        uniform float uProgress;

        void main() {
        `,
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      "vec4 matcapColor = texture2D( matcap, uv );",
      `
          vec4 matcapColor1 = texture2D( uMatcapTexture1, uv );
          vec4 matcapColor2 = texture2D( uMatcapTexture2, uv );
          float transitionFactor  = 0.2;
          
          float progress = smoothstep(uProgress - transitionFactor,uProgress, (vViewPosition.x+vViewPosition.y)*0.5 + 0.5);

          vec4 matcapColor = mix(matcapColor2, matcapColor1, progress );
        `,
    );
  }

  dogMaterial.onBeforeCompile = onBeforeCompile;

  // agar dog hai toh dog ka material and branch hai to branch ka material
  useLayoutEffect(() => {
    model.scene.traverse((child) => {
      console.log(child.name);
      if (child.name.includes("DOG")) {
        child.material = dogMaterial;
      } else if (child.name.toLowerCase().includes("eye")) {
        child.material = eyeMaterial;
      } else {
        child.material = branchMaterial;
      }
    });
  }, [model.scene, dogMaterial]);

  const dogModel = useRef(model);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#section-1",
        endTrigger: "#section-4",
        start: "top top",
        end: "bottom bottom",
        scrub: true,
      },
    });

    tl.to(dogModel.current.scene.position, {
      z: "-=0.75",
      y: "+=0.1",
    })
      .to(dogModel.current.scene.rotation, {
        x: `+=${Math.PI / 15}`,
      })
      .to(
        dogModel.current.scene.rotation,
        {
          y: `-=${Math.PI}`,
        },
        "third",
      )
      .to(
        dogModel.current.scene.position,
        {
          x: "-=0.5",
          z: "+=0.4",
          y: "-=0.1",
        },
        "third",
      );
  });

  useEffect(() => {
    document
      .querySelector(`.title[img-title='tomorrowland']`)
      .addEventListener("mouseenter", () => {
        material.current.uMatcap1.value = mat19;
        gsap.to(material.current.uProgress, {
          value: 0.0,
          duration: 0.3,
          onComplete: () => {
            material.current.uMatcap2.value = material.current.uMatcap1.value;
            material.current.uProgress.value = 1.0;
          },
        });
      });
    document
      .querySelector(`.title[img-title='navy']`)
      .addEventListener("mouseenter", () => {
        material.current.uMatcap1.value = mat8;

        gsap.to(material.current.uProgress, {
          value: 0.0,
          duration: 0.3,
          onComplete: () => {
            material.current.uMatcap2.value = material.current.uMatcap1.value;
            material.current.uProgress.value = 1.0;
          },
        });
      });
    document
      .querySelector(`.title[img-title='msi']`)
      .addEventListener("mouseenter", () => {
        material.current.uMatcap1.value = mat9;

        gsap.to(material.current.uProgress, {
          value: 0.0,
          duration: 0.3,
          onComplete: () => {
            material.current.uMatcap2.value = material.current.uMatcap1.value;
            material.current.uProgress.value = 1.0;
          },
        });
      });
    document
      .querySelector(`.title[img-title='phone']`)
      .addEventListener("mouseenter", () => {
        material.current.uMatcap1.value = mat12;

        gsap.to(material.current.uProgress, {
          value: 0.0,
          duration: 0.3,
          onComplete: () => {
            material.current.uMatcap2.value = material.current.uMatcap1.value;
            material.current.uProgress.value = 1.0;
          },
        });
      });
    document
      .querySelector(`.title[img-title='kikk']`)
      .addEventListener("mouseenter", () => {
        material.current.uMatcap1.value = mat10;

        gsap.to(material.current.uProgress, {
          value: 0.0,
          duration: 0.3,
          onComplete: () => {
            material.current.uMatcap2.value = material.current.uMatcap1.value;
            material.current.uProgress.value = 1.0;
          },
        });
      });
    document
      .querySelector(`.title[img-title='kennedy']`)
      .addEventListener("mouseenter", () => {
        material.current.uMatcap1.value = mat8;

        gsap.to(material.current.uProgress, {
          value: 0.0,
          duration: 0.3,
          onComplete: () => {
            material.current.uMatcap2.value = material.current.uMatcap1.value;
            material.current.uProgress.value = 1.0;
          },
        });
      });
    document
      .querySelector(`.title[img-title='opera']`)
      .addEventListener("mouseenter", () => {
        material.current.uMatcap1.value = mat13;

        gsap.to(material.current.uProgress, {
          value: 0.0,
          duration: 0.3,
          onComplete: () => {
            material.current.uMatcap2.value = material.current.uMatcap1.value;
            material.current.uProgress.value = 1.0;
          },
        });
      });
    document.querySelector(`.titles`).addEventListener("mouseleave", () => {
      material.current.uMatcap1.value = mat2;

      gsap.to(material.current.uProgress, {
        value: 0.0,
        duration: 0.3,
        onComplete: () => {
          material.current.uMatcap2.value = material.current.uMatcap1.value;
          material.current.uProgress.value = 1.0;
        },
      });
    });
  });

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Screen center se values calculate karna (-1 se +1)
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  useFrame(() => {
    if (meshGroup.current) {
      // Lerp syntax: lerp(currentValue, targetValue, speed)
      // 0.1 = Speed. Ise kam karoge (e.g. 0.05) toh aur slow/heavy feel aayega.

      meshGroup.current.rotation.x = THREE.MathUtils.lerp(
        meshGroup.current.rotation.x,
        mouse.current.y * 0.2, // Target rotation amount
        0.1, // Smoothness factor (Lower is smoother)
      );

      meshGroup.current.rotation.y = THREE.MathUtils.lerp(
        meshGroup.current.rotation.y,
        mouse.current.x * 0.2, // Target rotation amount
        0.1, // Smoothness factor
      );
    }
  });
  return (
    <>
      <group ref={meshGroup}>
        <primitive
          object={model.scene}
          position={[0.2, -0.59, 0]}
          rotation={[0, Math.PI / 4.9, 0]}
        />
      </group>
      <EffectComposer>
        <Bloom
          intensity={1.5} // Glow ki taakat
          luminanceThreshold={0.5} // Sirf bright cheezein glow karengi
          luminanceSmoothing={0.9}
        />
      </EffectComposer>
    </>
  );
};

export default Dog;
