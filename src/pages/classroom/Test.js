import React, { useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import classObject from "../classroom/models/gltf/class.glb";
import longDeskObject from "../classroom/models/gltf/longdesk.glb";
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { NavBar } from "../home/MainNavBar";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export const Test = () => {
  useEffect(() => {
    const canvas = document.querySelector("canvas.webgl");
    const scene = new THREE.Scene();
    const loader = new GLTFLoader();
    
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
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 2;
    scene.add(camera);
    
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas
      });
        
    // Controls
    const controls = new OrbitControls(camera, canvas);
    
    //Create a PointLight and turn on shadows for the light
    const light = new THREE.PointLight( 0xffffff, 1, 100 );
    light.position.set( 0, 10, 0 );
    light.castShadow = true; // default false
    scene.add( light );

    //Set up shadow properties for the light
    light.shadow.mapSize.width = 512; // default
    light.shadow.mapSize.height = 512; // default
    light.shadow.camera.near = 0.5; // default
    light.shadow.camera.far = 500; // default
    
    //Create a sphere that cast shadows (but does not receive them)
    const sphereGeometry = new THREE.SphereGeometry( 5, 32, 32 );
    const sphereMaterial = new THREE.MeshStandardMaterial( { color: 0xff0000 } );
    const sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
    sphere.castShadow = true; //default is false
    sphere.receiveShadow = false; //default

    let model = new THREE.Group();

    loader.load(longDeskObject, result => {
        model = result.scene;
        
        scene.add(model);
        model.traverse(
            function (node) {
                node.castShadow = true;
            }
        )
    });

    //Create a plane that receives shadows (but does not cast them)
    const planeGeometry = new THREE.PlaneGeometry( 20, 20, 32, 32 );
    const planeMaterial = new THREE.MeshStandardMaterial( { color: 0x00ff00 } )
    const plane = new THREE.Mesh( planeGeometry, planeMaterial );
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -5;
    scene.add( plane );
    
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
    
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
