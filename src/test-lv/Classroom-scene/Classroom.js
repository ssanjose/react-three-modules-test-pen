import React, { Suspense, useEffect, useRef } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { VRCanvas, Interactive, DefaultXRControllers } from "@react-three/xr";
import * as THREE from "three";
import "../classroom.css";

/**
 * TEST 1
 */
const Model = () => {
  const gltf = useLoader(GLTFLoader, "./glb/classroom.glb");
  return (
    <>
      <primitive object={gltf.scene} scale={5} />
    </>
  );
};

export const Classroom = () => {
  return (
    <div className="ClassroomContainer">
      <VRCanvas>
        <Suspense fallback={null}>
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
          <Model />
        </Suspense>
      </VRCanvas>
    </div>
  );
};
