import React, { Suspense, useEffect, useRef } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";
import { VRCanvas, Interactive, DefaultXRControllers } from "@react-three/xr";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";
import { BoxLineGeometry } from "three/examples/jsm/geometries/BoxLineGeometry";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as THREE from "three";
import "../classroom.css";

export const Classroom2 = () => {
  useEffect(() => {
    let container;
    let camera, scene, renderer, ambient, light, controls, group;
    let line;
    let controllers = [];
    let highlight;

    let raycaster = new THREE.Raycaster();
    let workingMatrix = new THREE.Matrix4();
    let workingVector = new THREE.Vector3();

    /**
     * Appends a div component
     */
    container = document.createElement("div");
    document.body.appendChild(container);

    /**
     * Renderer that displays the scene using WebGL
     */
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    document.body.appendChild(VRButton.createButton(renderer));

    init();
    window.addEventListener("resize", handleResize);
    buildControllers();
    setupXR();
    animate();

    /**
     * Function that sets the initial scene.
     */
    function init() {
      /**
       * Creates camera and sets position.
       */
      camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        100
      );
      camera.position.set(0, 0, 4);

      /**
       * Creates and sets scene background.
       */
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xaaaaaa);

      /**
       * Adds Hemispherelight to the scene
       */
      ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 0.3);
      scene.add(ambient);

      /**
       * Adds directional light to the scene
       */
      light = new THREE.DirectionalLight();
      light.position.set(0.2, 1, 1);
      scene.add(light);

      /**
       * Creates group
       */
      group = new THREE.Group();
      scene.add(group);

      /**
       * Creates Box
       */
      const geometries = new THREE.BoxGeometry(0.2, 0.2, 0.2);

      /**
       * For loop to create 2 cubes based on the geometries variable
       */
      for (let i = 0; i < 2; i++) {
        const geometry = geometries;
        const material = new THREE.MeshStandardMaterial({
          color: Math.random() * 0xffffff,
        });

        const object = new THREE.Mesh(geometry, material);

        object.position.x = Math.random();
        object.position.y = (1, 1);
        object.position.z = (-2, -2);

        group.add(object);
      }

      /**
       * Adds a white highlight around the objects.
       */
      highlight = new THREE.Mesh(
        geometries,
        new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.BackSide })
      );
      highlight.visible = false;
      highlight.scale.set(1.1, 1.1, 1.1);
      scene.add(highlight);
    }

    /**
     * Function that handles the xr part of the website.
     */
    function setupXR() {
      //Function that handles the line that's parallel to the controller.
      function onSelectStart(e) {
        const controller = e.target;
        controller.userData.selectPressed = true;
        if (controller.userData.selected !== undefined) {
          controller.attach(controller.userData.selected);
          controller.userData.attachedObject = controller.userData.selected;
        }
      }

      //Function that removes the highlight
      function onSelectEnd(e) {
        const controller = e.target;
        controller.children[0].scale.z = 0;
        highlight.visible = false;
        controller.userData.selectPressed = false;
        if (controller.userData.attachedObject !== undefined) {
          group.attach(controller.userData.attachedObject);
          controller.userData.attachedObject = undefined;
        }
      }

      //Adds event listeners to both controllers when user presses the button when he doesn't.
      controllers.forEach((controller) => {
        controller.addEventListener("selectstart", onSelectStart);
        controller.addEventListener("selectend", onSelectEnd);
      });
    }

    /**
     * Function to handle the custom vr controllers.
     * Returns the controllers.
     */
    function buildControllers() {
      //Adds controller library
      const controllerModelFactory = new XRControllerModelFactory();

      //sets the point of origin of the controller and extends to the z-axis
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -1),
      ]);

      //Creates the line for the controller
      line = new THREE.Line(geometry);
      line.name = "line";
      line.scale.z = 0;

      //for loop to render and set the default values of the controllers
      for (let i = 0; i <= 1; i++) {
        const controller = renderer.xr.getController(i);
        controller.add(line.clone());
        controller.userData.selectPressed = false;
        scene.add(controller);

        controllers.push(controller);

        const grip = renderer.xr.getControllerGrip(i);
        grip.add(controllerModelFactory.createControllerModel(grip));
        scene.add(grip);
      }

      return controllers;
    }

    /**
     * Function that highlights objects when the line intersects with objects.
     */
    function handleController(controller) {
      workingMatrix.identity().extractRotation(controller.matrixWorld);

      //obtains the position of the controller's matrix world
      raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
      //sets the raycaster direction to the -1 z axis based on the controller's working matrix
      raycaster.ray.direction.set(0, 0, -1).applyMatrix4(workingMatrix);

      //Only intersects objects in group
      const intersects = raycaster.intersectObjects(group.children);

      //If line intersects with object then the object is highlighted.
      if (intersects.length > 0) {
        intersects[0].object.add(highlight);

        highlight.visible = true;
        controller.children[0].scale.z = intersects[0].distance;
        controller.userData.selected = intersects[0].object;
      } else {
        controller.children[0].scale.z = 10;
        highlight.visible = false;
      }
    }

    /**
     * Function that handles the resizing of the scene depending ont he window size.
     */
    function handleResize() {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    }

    /**
     * Constantly updates the scene and renders it.
     */
    function animate() {
      renderer.setAnimationLoop(render);
    }

    /**
     * Renders the scene
     */
    function render() {
      controllers.forEach((controller) => {
        handleController(controller);
      });

      renderer.render(scene, camera);
    }
  }, []);

  return null;
};
