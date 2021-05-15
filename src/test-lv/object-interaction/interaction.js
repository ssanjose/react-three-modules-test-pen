import React, { Suspense, useEffect, useRef, Component } from "react";
import ReactDOM from "react-dom";
import { Canvas, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";
import { VRCanvas, Interactive, DefaultXRControllers } from "@react-three/xr";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { BoxLineGeometry } from "three/examples/jsm/geometries/BoxLineGeometry";
import * as THREE from "three";
import "../classroom.css";

export const Interaction = () => {
  useEffect(() => {
    let container;
    let camera, scene, renderer;
    let controller1, controller2;
    let controllerGrip1, controllerGrip2;
    let highlight;
    let controls, group;

    let raycaster = new THREE.Raycaster();
    let workingMatrix = new THREE.Matrix4();

    const intersected = [];

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
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    document.body.appendChild(VRButton.createButton(renderer));

    initial();
    window.addEventListener("resize", handleResize);
    animate();

    function initial() {
      /**
       * Creates and sets scene background.
       */
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x808080);

      /**
       * Creates camera and sets position.
       */
      camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.1,
        10
      );
      camera.position.set(0, 1.6, 3);

      /**
       * Adds orbit controls
       */
      controls = new OrbitControls(camera, container);
      controls.target.set(0, 1.6, 0);
      controls.update();

      controls = new OrbitControls(camera, container);
      controls.target.set(0, 1.6, 0);
      controls.update();

      /**
       * Adds a floor to the scene
       */
      const floor = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(200, 200),
        new THREE.MeshPhongMaterial({ color: 0x00008b, depthWrite: false })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);

      var grid = new THREE.GridHelper(20, 40, 0x000000, 0x000000);
      grid.material.opacity = 0.2;
      grid.material.transparent = true;
      scene.add(grid);

      /**
       * Adds Hemispherelight to the scene
       */
      scene.add(new THREE.HemisphereLight(0x808080, 0x606060));

      /**
       * Adds directional light to the scene
       */
      const light = new THREE.DirectionalLight(0xffffff);
      light.position.set(0, 6, 0);
      light.castShadow = true;
      light.shadow.camera.top = 2;
      light.shadow.camera.bottom = -2;
      light.shadow.camera.right = 2;
      light.shadow.camera.left = -2;
      light.shadow.mapSize.set(4096, 4096);
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
        object.position.y = 1;
        object.position.z = -1.2;

        object.castShadow = true;
        object.receiveShadow = true;

        group.add(object);
      }

      //Adds a controller to the scene with event listeners
      controller1 = renderer.xr.getController(0);
      controller1.addEventListener("selectstart", onSelectStart);
      controller1.addEventListener("selectend", onSelectEnd);
      scene.add(controller1);

      //Adds a controller to the scene with event listeners
      controller2 = renderer.xr.getController(1);
      controller2.addEventListener("selectstart", onSelectStart);
      controller2.addEventListener("selectend", onSelectEnd);
      scene.add(controller2);

      const controllerModelFactory = new XRControllerModelFactory();

      //Renders the controller GLB to the scene using the library
      controllerGrip1 = renderer.xr.getControllerGrip(0);
      controllerGrip1.add(
        controllerModelFactory.createControllerModel(controllerGrip1)
      );
      scene.add(controllerGrip1);

      //Renders the controller GLB to the scene using the library
      controllerGrip2 = renderer.xr.getControllerGrip(1);
      controllerGrip2.add(
        controllerModelFactory.createControllerModel(controllerGrip2)
      );
      scene.add(controllerGrip2);

      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -1),
      ]);

      const line = new THREE.Line(geometry);
      line.name = "line";
      line.scale.z = 5;

      controller1.add(line.clone());
      controller2.add(line.clone());

      window.addEventListener("resize", handleResize);

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
     * Function that handles the resizing of the scene depending ont he window size.
     */
    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Function that handles the select button press of the controller.
     * Attaches object to controller.
     */
    function onSelectStart(event) {
      const controller = event.target;

      const intersections = getIntersections(controller);

      //Checks if there's any objects intersecting with the raycaster
      if (intersections.length > 0) {
        const intersection = intersections[0];
        const object = intersection.object;

        //Makes the highlight object visible to the scene.
        object.children[0].visible = true;

        //moves the object from the group to the controller.
        controller.attach(object);

        //User set variable that stores the current object being held.
        controller.userData.selected = object;
      }
    }

    /**
     * Function that handles the leave select button of the controller.
     * Removes the object from the controller.
     */
    function onSelectEnd(event) {
      const controller = event.target;

      //Checks if the controller has on object
      if (controller.userData.selected !== undefined) {
        //Gets the object from the user set variable.
        const object = controller.userData.selected;

        //Moves the object from the controller back to the group.
        group.attach(object);

        //Removes the object from the user set variable.
        controller.userData.selected = undefined;
      }
    }

    /**
     * Function that obtains the position of the controller and the direction of the raycaster.
     * returns the objects intersecting with the ray caster.
     */
    function getIntersections(controller) {
      workingMatrix.identity().extractRotation(controller.matrixWorld);

      //obtains the position of the controller's matrix world
      raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);

      //sets the raycaster direction to the -1 z axis based on the controller
      raycaster.ray.direction.set(0, 0, -1).applyMatrix4(workingMatrix);

      return raycaster.intersectObjects(group.children);
    }

    /**
     * Function that highlights objects when the line intersects with objects.
     */
    function intersectObjects(controller) {
      //Returns if user has object in hand.
      if (controller.userData.selected !== undefined) return;

      const line = controller.getObjectByName("line");
      const intersections = getIntersections(controller);

      //If line intersects with object then the object is highlighted.
      if (intersections.length > 0) {
        //obtains the very first object intersecting with the raycaster
        const intersection = intersections[0];

        //Adds the highlight mesh to the object.
        intersection.object.add(highlight);

        //gets the object from the intersection
        const object = intersection.object;

        //Enables the highlight.
        highlight.visible = true;

        //adds the object to the array.
        intersected.push(object);

        //sets the line scale z axis to the intersection distance
        line.scale.z = intersection.distance;
      } else {
        //sets the line scale z axis to 5
        line.scale.z = 5;
      }

      if ((intersections.length = 0)) {
        highlight.visible = false;
      }
    }

    /**
     * Clears the intersected object array and enables
     */
    function cleanIntersected() {
      while (intersected.length) {
        const object = intersected.pop();

        highlight.visible = false;
      }
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
      cleanIntersected();

      intersectObjects(controller1);
      intersectObjects(controller2);

      renderer.render(scene, camera);
    }
  }, []);

  return null;
};
