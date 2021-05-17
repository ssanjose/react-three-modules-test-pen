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

export const ClassroomA = () => {
  useEffect(() => {
    const scene = new THREE.Scene();
    const loader = new GLTFLoader();
    const gui = new dat.GUI();
    const renderer = new THREE.WebGLRenderer();

    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.1,
      100
    );

    scene.add(camera);
    scene.background = new THREE.Color(0xa3e8ff);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(1, 2, 0);
    
    // Lights
    const directionalLightSun = new THREE.DirectionalLight(0xfff0cc, 1, 100);
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xe3e3e3, 1.25);

    directionalLightSun.position.set(20, 20, 7.5);
    directionalLightSun.castShadow = true;
    
    scene.add(directionalLightSun);
    scene.add(hemiLight);
    
    directionalLightSun.shadow.mapSize.width = 512; // default
    directionalLightSun.shadow.mapSize.height = 512; // default
    directionalLightSun.shadow.camera.near = 0.5; // default
    directionalLightSun.shadow.camera.far = 500; // default
    
    // Load models (GLTF/GLB)
    let classroom;
    let desk;
    let chair;

    // Classroom
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

    // Windows // CHANGE TO LESS EXPENSIVE MATERIAL ???
    const geometry = new THREE.PlaneGeometry(30, 21);
    const material = new THREE.MeshPhysicalMaterial({transmission: 0.9, opacity: 1, color: 0xffffff, transparent: true, side: THREE.BackSide});
    const backWindow = new THREE.Mesh(geometry, material);

    backWindow.position.x = -.25;
    backWindow.position.y = 10.5;
    backWindow.position.z = 20.25;
    
    scene.add(backWindow);
    backWindow.receiveShadow = true;
    
    // Desks
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

    // Chairs
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

    // Set renderer properties
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

    // Append canvas
    const container = document.getElementById("class-container");
    container.appendChild(renderer.domElement);

    // Render Scene
    renderer.setAnimationLoop( function () {
      renderer.render(scene, camera);
    })
    
  }, []);

  return (
    <div className="hero">
      <NavBar />
      <div id="class-container"></div>
    </div>
  );
};
