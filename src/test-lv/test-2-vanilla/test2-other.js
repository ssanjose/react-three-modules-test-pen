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
    let camera, scene, renderer;
    let controller1, controller2;
    let controllerGrip1, controllerGrip2;
    let raycaster;

    const intersected = [];
    const tempMatrix = new THREE.Matrix4();

    let controls, group;

    init();
    animate();

    function init() {
      container = document.createElement("div");
      document.body.appendChild(container);

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x808080);

      camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.1,
        10
      );
      camera.position.set(0, 1.6, 3);

      controls = new OrbitControls(camera, container);
      controls.target.set(0, 1.6, 0);
      controls.update();

      scene.add(new THREE.HemisphereLight(0x808080, 0x606060));

      const light = new THREE.DirectionalLight(0xffffff);
      light.position.set(0, 6, 0);
      scene.add(light);

      group = new THREE.Group();
      scene.add(group);

      const geometries = new THREE.BoxGeometry(0.2, 0.2, 0.2);

      for (let i = 0; i < 2; i++) {
        const geometry = geometries;
        const material = new THREE.MeshStandardMaterial({
          color: Math.random() * 0xffffff,
        });

        const object = new THREE.Mesh(geometry, material);

        object.position.x = Math.random();
        object.position.y = (2, 2);

        group.add(object);
      }

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.xr.enabled = true;
      container.appendChild(renderer.domElement);

      document.body.appendChild(VRButton.createButton(renderer));

      // controllers

      controller1 = renderer.xr.getController(0);
      controller1.addEventListener("selectstart", onSelectStart);
      controller1.addEventListener("selectend", onSelectEnd);
      scene.add(controller1);

      controller2 = renderer.xr.getController(1);
      controller2.addEventListener("selectstart", onSelectStart);
      controller2.addEventListener("selectend", onSelectEnd);
      scene.add(controller2);

      const controllerModelFactory = new XRControllerModelFactory();

      controllerGrip1 = renderer.xr.getControllerGrip(0);
      controllerGrip1.add(
        controllerModelFactory.createControllerModel(controllerGrip1)
      );
      scene.add(controllerGrip1);

      controllerGrip2 = renderer.xr.getControllerGrip(1);
      controllerGrip2.add(
        controllerModelFactory.createControllerModel(controllerGrip2)
      );
      scene.add(controllerGrip2);

      //

      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -1),
      ]);

      const line = new THREE.Line(geometry);
      line.name = "line";
      line.scale.z = 0;

      controller1.add(line.clone());
      controller2.add(line.clone());

      raycaster = new THREE.Raycaster();

      //

      window.addEventListener("resize", onWindowResize);
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function onSelectStart(event) {
      const controller = event.target;

      const intersections = getIntersections(controller);
      const line = controller.getObjectByName("line");
      line.scale.z = 5;

      if (intersections.length > 0) {
        const intersection = intersections[0];

        const object = intersection.object;
        object.material.emissive.b = 1;
        controller.attach(object);

        controller.userData.selected = object;
      }
    }

    function onSelectEnd(event) {
      const controller = event.target;
      const line = controller.getObjectByName("line");
      line.scale.z = 0;

      if (controller.userData.selected !== undefined) {
        const object = controller.userData.selected;
        object.material.emissive.b = 0;
        group.attach(object);

        controller.userData.selected = undefined;
      }
    }

    function getIntersections(controller) {
      tempMatrix.identity().extractRotation(controller.matrixWorld);

      raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
      raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

      return raycaster.intersectObjects(group.children);
    }

    function intersectObjects(controller) {
      // Do not highlight when already selected

      if (controller.userData.selected !== undefined) return;

      const line = controller.getObjectByName("line");
      const intersections = getIntersections(controller);

      if (intersections.length > 0) {
        const intersection = intersections[0];

        const object = intersection.object;
        object.material.emissive.r = 1;
        intersected.push(object);

        line.scale.z = intersection.distance;
      }
    }

    function cleanIntersected() {
      while (intersected.length) {
        const object = intersected.pop();
        object.material.emissive.r = 0;
      }
    }

    //

    function animate() {
      renderer.setAnimationLoop(render);
    }

    function render() {
      cleanIntersected();

      intersectObjects(controller1);
      intersectObjects(controller2);

      renderer.render(scene, camera);
    }
  }, []);

  return null;
};