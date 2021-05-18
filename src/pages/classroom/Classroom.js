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
import * as CANNON from "cannon";

export const ClassroomA = () => {
  const scene = new THREE.Scene();
  const loader = new GLTFLoader();
  const gui = new dat.GUI();
  const renderer = new THREE.WebGLRenderer();
  const world = new CANNON.World();
  const timeStep = 1 / 60;
  
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

  let classroom;
  let desk;
  let chair;
  let chairBox;
  let chairBody;

  useEffect(() => {
    initScene();
    initCannon();
    initModels();
    initRenderer();
  }, []);

  function initScene() {
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

    initCannon();
  }

  function initModels() {
    // Floor 
    const floorGeometry = new THREE.PlaneGeometry(30, 40);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0xff1100,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.receiveShadow = true;
    floor.rotation.x = Math.PI * 90 / 180;
    scene.add(floor);

    // // Floor physics
    // const floorShape = new CANNON.Plane(15, 20);
    // const floorBody = new CANNON.Body({ mass: 0 });

    // floorBody.addShape(floorShape);
    // floorBody.quaternion.setFromAxisAngle(
    //   new CANNON.Vec3(1, 0, 0),
    //   Math.PI * 90 / 180
    // );
    // world.addBody(floorBody);

    // floor.position.copy(floorBody.position);
    // floor.quaternion.copy(floorBody.quaternion);  

    // Import classroom model (GLB)
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

    // // Windows // CHANGE TO LESS EXPENSIVE MATERIAL ???
    // const geometry = new THREE.PlaneGeometry(30, 21);
    // const material = new THREE.MeshPhysicalMaterial({transmission: 0.9, opacity: 1, color: 0xffffff, transparent: true, side: THREE.BackSide});
    // const backWindow = new THREE.Mesh(geometry, material);

    // backWindow.position.x = -.25;
    // backWindow.position.y = 10.5;
    // backWindow.position.z = 20.25;

    // scene.add(backWindow);
    // backWindow.receiveShadow = true;

    // Desks
    for (let i = 0; i < 4; i++) {
      for (let j = 0 ; j < 4; j++) {
        // Import desk models (GLB)
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
        // Import chair models (GLB)
        loader.load(
          swivelChair,
          function (gltf) {
            chair = gltf.scene;
          
            // Create physical chair
            chairBox = new CANNON.Box(new CANNON.Vec3(1 / 2, 2.5 / 2, 1 / 2));
            chairBody = new CANNON.Body({ mass: 1 });

            chairBody.position.y = 2;
            chairBody.position.x = 2.75 * j - 10;
            chairBody.position.z = 6 * i - 3;
            chairBody.quaternion.setFromAxisAngle(
              new CANNON.Vec3(0, 1, 0),
              Math.PI * 90 / 180
            );

            chairBody.addShape(chairBox);
            world.addBody(chairBody);
            
            // Position Chair model to physical chair
            chair.position.copy(chairBody.position);
            chair.quaternion.copy(chairBody.quaternion);

            scene.add(chair);
            
            chair.traverse(
              function (node) {
                node.castShadow = true;
             });
           });
      }
    }
  }

  // Render the scene
  function initRenderer() {
    // Set renderer properties
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.LinearToneMapping;

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
    });

    // VR Button
    document.body.appendChild( VRButton.createButton(renderer));
    renderer.xr.enabled = true;

    // Append canvas
    const container = document.getElementById("class-container");
    container.appendChild(renderer.domElement);

    // Step the physics world
    world.step(timeStep);

    // Render Scene
    renderer.setAnimationLoop( function () {
      renderer.render(scene, camera);
    });
  }

  // Initiate the Cannon world properties
  function initCannon() {
    world.gravity.set(0, 2, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;
  }

  return (
    <div className="hero">
      <NavBar />
      <div id="class-container"></div>
    </div>
  );
};
