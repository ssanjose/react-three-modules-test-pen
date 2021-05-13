import React, { useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import classObject from "../classroom/models/gltf/class.glb";
import longDeskObject from "../classroom/models/gltf/longdesk.glb";
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { NavBar } from "../home/MainNavBar";
import * as dat from "dat.gui";
import { AmbientLight, CameraHelper } from "three";

export const ClassroomA = () => {
  useEffect(() => {
    const canvas = document.querySelector("canvas.webgl");
    const scene = new THREE.Scene();
    const loader = new GLTFLoader();

    // Model variables
    let classroom;
    let desk;

    // Load models
    loader.load(
      classObject,
      function (gltf) {
        scene.add(gltf.scene);
      });

    for (let i = 0; i < 4; i++) {
      for (let j = 0 ; j < 4; j++) {
        loader.load(
            longDeskObject,
            function (gltf) {
                desk = gltf.scene;
                desk.rotation.y = 90 * Math.PI / 180;
                desk.position.x = 5.25 * j + 8;
                desk.position.z = 6 * i - 5;
  
                scene.add(desk);
            }
        )
      }
    }

    // Lights
    const pointLightSun = new THREE.PointLight(0xfff0cc, 1);
    const pointLightCeiling = new THREE.PointLight(0xffffff, .25);
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xe3e3e3, 1);

    pointLightSun.position.x = 20;
    pointLightSun.position.y = 23;
    pointLightSun.position.z = 50;

    pointLightCeiling.position.x = 15;
    pointLightCeiling.position.y = 20;
    pointLightCeiling.position.z = 0;

    scene.add(pointLightSun);
    scene.add(hemiLight);
    scene.add(pointLightCeiling);

    /**
     * Sizes
     */
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    /**
     * Renderer
     */
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true
    });

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

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

    /**
     * Camera
     */
    // Base camera
    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.1,
      100
    );

    camera.position.set(20, 5, 10)
    camera.lookAt(0, 5, 0);
    scene.add(camera);

    // Controls
    const controls = new OrbitControls(camera, canvas);

    controls.target.set(15, 0, 0);

    /**
     * Animate
     */

    let mouseX = 0,
      mouseY = 0;

    let targetX = 0,
      targetY = 0;

    const windowX = window.innerWidth / 2;
    const windowY = window.innerHeight / 2;

    const onDocumentMouseMove = (event) => {
      mouseX = event.clientX - windowX;
      mouseY = event.clientY - windowY;
    };

    document.addEventListener("mousemove", onDocumentMouseMove);

    // VR Button
    document.body.appendChild( VRButton.createButton(renderer));
    renderer.xr.enabled = true;
    
    const clock = new THREE.Clock();

    const tick = () => {
      targetX = mouseX * 0.001;
      targetY = mouseY * 0.001;

      // // Render
      // renderer.render(scene, camera);

      // Call tick again on the next frame
      window.requestAnimationFrame(tick);

      renderer.setAnimationLoop( function () {
        renderer.render(scene, camera);
      })
    };

    tick();
    
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
