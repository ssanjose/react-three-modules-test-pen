import React, { Suspense, useEffect, useRef, Component } from "react";
import ReactDOM from "react-dom";
import { Canvas, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";
import { VRCanvas, Interactive, DefaultXRControllers } from "@react-three/xr";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { BoxLineGeometry } from "three/examples/jsm/geometries/BoxLineGeometry";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import * as THREE from "three";
import "../classroom.css";
import * as CANNON from "cannon";

export const Movement = () => {
  useEffect(() => {
    var world,
      mass,
      body,
      shape,
      timeStep = 1 / 60,
      camera,
      scene,
      renderer,
      geometry,
      material,
      mesh,
      floor,
      groundBody;

    initThree();
    initCannon();
    animate();

    function initCannon() {
      world = new CANNON.World();
      world.gravity.set(0, -2, 0);
      world.broadphase = new CANNON.NaiveBroadphase();
      world.solver.iterations = 10;

      // Create a plane
      var groundShape = new CANNON.Plane();
      groundBody = new CANNON.Body({ mass: 0 });
      groundBody.addShape(groundShape);
      groundBody.quaternion.setFromAxisAngle(
        new CANNON.Vec3(1, 0, 0),
        -Math.PI / 2
      );
      groundBody.position.y = -3;
      world.addBody(groundBody);

      shape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
      mass = 1;
      body = new CANNON.Body({
        mass: 1,
      });
      body.angularVelocity.set(0, 0, 10);
      body.position.y = 2;
      body.addShape(shape);
      body.angularDamping = 0.5;
      world.addBody(body);
    }

    function initThree() {
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x808080);

      camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        1,
        100
      );
      camera.position.z = 5;
      scene.add(camera);

      scene.add(new THREE.HemisphereLight(0x808080, 0x606060));

      const light = new THREE.DirectionalLight(0xffffff);
      light.position.set(0, 6, 0);
      light.castShadow = true;
      light.shadow.camera.top = 2;
      light.shadow.camera.bottom = -2;
      light.shadow.camera.right = 2;
      light.shadow.camera.left = -2;
      light.shadow.mapSize.set(4096, 4096);
      scene.add(light);

      geometry = new THREE.BoxGeometry(2, 2, 2);
      material = new THREE.MeshBasicMaterial({
        color: 0xff0000,
      });

      mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);

      const floorGeometry = new THREE.PlaneGeometry(4, 4);
      const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0xeeeeee,
        roughness: 1.0,
        metalness: 0.0,
      });
      floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);

      document.body.appendChild(renderer.domElement);
    }

    function animate() {
      requestAnimationFrame(animate);
      updatePhysics();
      render();
    }

    function updatePhysics() {
      // Step the physics world
      world.step(timeStep);

      // Copy coordinates from Cannon.js to Three.js
      mesh.position.copy(body.position);
      mesh.quaternion.copy(body.quaternion);
      floor.position.copy(groundBody.position);
      floor.quaternion.copy(groundBody.quaternion);
    }

    function render() {
      renderer.render(scene, camera);
    }
  }, []);

  return null;
};
