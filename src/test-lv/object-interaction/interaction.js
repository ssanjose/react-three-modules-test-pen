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

class Interaction extends Component {
  constructor(props) {
    super(props);
    /**
     * Appends a div component for the canvas
     */
    const container = document.createElement("div");
    document.body.appendChild(container);

    /**
     * Creates camera and sets position.
     */
    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.set(0, 1.6, 3);

    /**
     * Creates and sets scene background.
     */
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x505050);

    /**
     * Adds Hemispherelight to the scene
     */
    this.scene.add(new THREE.HemisphereLight(0x606060, 0x404040));

    /**
     * Adds directional light to the scene
     */
    const light = new THREE.DirectionalLight(0xffffff);
    light.position.set(1, 1, 1).normalize();
    this.scene.add(light);

    /**
     * Renderer that displays the scene using WebGL
     */
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    /**
     * Appends the renderer canvas to the div
     */
    container.appendChild(this.renderer.domElement);

    /**
     * Enables Orbitcontrols for the scene
     * !Only works when you're not in VR.
     */
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 1.6, 0);
    this.controls.update();

    this.raycaster = new THREE.Raycaster();
    this.workingMatrix = new THREE.Matrix4();
    this.workingVector = new THREE.Vector3();

    this.initScene();
    this.setupXR();

    /**
     * Calls resize function whenever user resizes the window.
     */
    window.addEventListener("resize", this.resize.bind(this));

    /**
     * Constantly updates scene and renders it.
     * *calls the render function everytime.
     */
    this.renderer.setAnimationLoop(this.render.bind(this));
  }

  /**
   * Function that sets the initial scene.
   */
  initScene() {
    //Room that allows the user to see lines.
    this.room = new THREE.LineSegments();
    this.room.geometry.translate(0, 3, 0);
    this.scene.add(this.room);

    //Adds a green cube on the scene.
    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.y = (2, 2);
    this.room.add(cube);

    //Creates another cube with a randomized color
    const newCube = new THREE.Mesh(
      geometry,
      new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff })
    );
    newCube.position.x = (-1, 1);
    newCube.position.y = (2, 2);
    this.room.add(newCube);

    //Adds a white outline on the geometry
    this.highlight = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.BackSide })
    );
    this.highlight.visible = false;
    this.highlight.scale.set(1.2, 1.2, 1.2);
    this.scene.add(this.highlight);
  }

  /**
   * Function that handles the xr part of the website.
   */
  setupXR() {
    //Enables webXR.
    this.renderer.xr.enabled = true;

    //Appends the "enter VR" button to the div
    document.body.appendChild(VRButton.createButton(this.renderer));

    const self = this;

    this.controllers = this.buildControllers();

    //Function that handles the line that's parallel to the controller.
    function onSelectStart() {
      this.children[0].scale.z = 10;
      this.userData.selectPressed = true;
    }

    //Function that removes the highlight
    function onSelectEnd() {
      this.children[0].scale.z = 0;
      self.highlight.visible = false;
      this.userData.selectPressed = false;
    }

    //Adds event listeners to both controllers when user presses the button when he doesn't.
    this.controllers.forEach((controller) => {
      controller.addEventListener("selectstart", onSelectStart);
      controller.addEventListener("selectend", onSelectEnd);
    });
  }

  /**
   * Function to handle the custom vr controllers.
   * Returns the controllers.
   */
  buildControllers() {
    //Adds controller library
    const controllerModelFactory = new XRControllerModelFactory();

    //sets the point of origin of the controller and extends to the z-axis
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -1),
    ]);

    //Creates the line for the controller
    const line = new THREE.Line(geometry);
    line.name = "line";
    line.scale.z = 0;

    //Array to store the controllers
    const controllers = [];

    //for loop to render and set the default values of the controllers
    for (let i = 0; i <= 1; i++) {
      const controller = this.renderer.xr.getController(i);
      controller.add(line.clone());
      controller.userData.selectPressed = false;
      this.scene.add(controller);

      controllers.push(controller);

      const grip = this.renderer.xr.getControllerGrip(i);
      grip.add(controllerModelFactory.createControllerModel(grip));
      this.scene.add(grip);
    }

    return controllers;
  }

  /**
   * Function that highlights objects when the line intersects with objects.
   */
  handleController(controller) {
    //checks if user presses the button.
    if (controller.userData.selectPressed) {
      //Expands the line of the controller to 10 meters in the z axis.
      controller.children[0].scale.z = 10;

      this.workingMatrix.identity().extractRotation(controller.matrixWorld);

      this.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
      this.raycaster.ray.direction
        .set(0, 0, -1)
        .applyMatrix4(this.workingMatrix);

      //Only intersects objects inside the room
      const intersects = this.raycaster.intersectObjects(this.room.children);

      //If line intersects with object the object is then highlighted
      if (intersects.length > 0) {
        intersects[0].object.add(this.highlight);
        this.highlight.visible = true;
        controller.children[0].scale.z = intersects[0].distance;
      } else {
        this.highlight.visible = false;
      }
    }
  }

  /**
   * Function that handles the resizing of the scene depending on the window size.
   */
  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * Renders the scene
   */
  render() {
    this.controllers.forEach((controller) => {
      this.handleController(controller);
    });

    this.renderer.render(this.scene, this.camera);

    return null;
  }
}

export default Interaction;
