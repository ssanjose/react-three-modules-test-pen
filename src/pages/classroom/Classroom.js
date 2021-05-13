import React, { useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import classObject from "../classroom/models/gltf/class.glb";
import longDeskObject from "../classroom/models/gltf/longdesk.glb";
import swivelChair from "../classroom/models/gltf/swivelchair.glb";
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { NavBar } from "../home/MainNavBar";
import * as dat from "dat.gui";
import { AmbientLight, CameraHelper } from "three";

export const ClassroomA = () => {
  useEffect(() => {
    const canvas = document.querySelector("canvas.webgl");
    const scene = new THREE.Scene();
    const loader = new GLTFLoader();
    const gui = new dat.GUI();

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas
    });

    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.1,
      100
    );

    scene.add(camera);

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(1, 2, 0);
    
    scene.background = new THREE.Color(0xa3e8ff);
    // Lights
    const pointLightSun = new THREE.PointLight(0xfff0cc, 1, 100);
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xe3e3e3, 1.25);

    pointLightSun.position.set(20, 20, 7.5);
    pointLightSun.castShadow = true;
    
    scene.add(pointLightSun);
    scene.add(hemiLight);

    pointLightSun.shadow.mapSize.width = 512; // default
    pointLightSun.shadow.mapSize.height = 512; // default
    pointLightSun.shadow.camera.near = 0.5; // default
    pointLightSun.shadow.camera.far = 500; // default

    let classroom;
    let desk;
    let chair;

    // Load models
    loader.load(
      classObject,
      function (gltf) {
        classroom = gltf.scene;

        scene.add(classroom);

        classroom.traverse(
          function (node) {
            node.receiveShadow = true;
          }  
        );
      });

    for (let i = 0; i < 4; i++) {
      for (let j = 0 ; j < 4; j++) {
        loader.load(
          longDeskObject,
          function (gltf) {
            desk = gltf.scene;

            desk.rotation.y = 90 * Math.PI / 180;
            desk.position.x = 5.25 * j - 8;
            desk.position.z = 6 * i - 5;

            scene.add(desk);

            desk.traverse(
              function (node) {
                node.castShadow = true;
            });
        });
      }
    }

    for (let i = 0; i < 4; i++) {
      for (let j = 0 ; j < 8; j++) {
        loader.load(
          swivelChair,
          function (gltf) {
            chair = gltf.scene;

            chair.rotation.y = 90 * Math.PI / 180;
            chair.position.x = 2.75 * j - 10;
            chair.position.z = 6 * i - 3;

            scene.add(chair);

            chair.traverse(
              function (node) {
                node.castShadow = true;
            });
        });
      }
    }

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    window.addEventListener("resize", () => {
      // Update sizes
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;

      // Update camera
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();

      // Update renderer
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.LinearToneMapping;

      renderer.physicallyCorrectLights = true;

    });

    // VR Button
    document.body.appendChild( VRButton.createButton(renderer));
    renderer.xr.enabled = true;

    renderer.setAnimationLoop( function () {
      renderer.render(scene, camera);
    })
    
  }, []);

  return (
    <div className="hero">
      <NavBar />
      <div className="hero-container">
        <canvas className="webgl"></canvas>
      </div>
    </div>
  );
};
