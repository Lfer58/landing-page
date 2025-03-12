import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {GUI} from 'three/addons/libs/lil-gui.module.min.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';
import {RectAreaLightUniformsLib} from 'three/addons/lights/RectAreaLightUniformsLib.js';
import {RectAreaLightHelper} from 'three/addons/helpers/RectAreaLightHelper.js';


let canvas;
let renderer;
let scene;
let cubes = [];
let camera;
let loader;
let texture;
let controls;
var animation = {
  switch: true
};
var fogEnabled = {
  switch: true
};
let pickHelper, pickPosition;


function main() {
    canvas = document.querySelector('#c');
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas,
      alpha: true,
    });
    renderer.shadowMap.enabled = true;

    pickHelper = new PickHelper();
    
    const fov = 45;
    const aspect = 2;  // the canvas default
    let near = 0.01;
    let far = 100;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far)

    function updateCamera() {
      camera.updateProjectionMatrix();
    }

    scene = new THREE.Scene();

    loader = new THREE.TextureLoader();
    texture = loader.load(
      '../resources/images/82991.png',
      () => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.colorSpace = THREE.SRGBColorSpace;
        scene.background = texture;
      });

    makeSettingCube();

    makeSettingSphere();

    makeSettingTetrahedron();

    let boxSize = 10
    const geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);

    const material = new THREE.MeshPhongMaterial({map: loadColorTexture('../resources/images/emergency.jpg')})

    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0,2,-40);
    cube.rotation.set(60,60,60);
    scene.add(cube);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 5, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    loadObj('../resources/models/mountain/', 'mountain', [-25,-37.5,100], [0.25,0.25,0.25], [0,0,0], false)

    loadObj('../resources/models/rock/', 'Free_rock', [0,5,0], [1,1,1], [0,0,0], true, false)


    loadObj('../resources/models/rock/', 'Free_rock', [-50,10,-100], [1,2,1], [90,0,0], false)

    loadObj('../resources/models/rock/', 'Free_rock', [25,5,-140], [1.5,1,1], [0,0,0], false)

    loadObj('../resources/models/rock/', 'Free_rock', [-40,5,-50], [2,3,1], [0,0,0], false)

    loadObj('../resources/models/rock/', 'Free_rock', [20,15,-80], [1,2,1], [0,90,0], false)

    loadObj('../resources/models/rock/', 'Free_rock', [-50,15, 25 ], [2,6,2], [0,0,45], false)


    loadObj('../resources/models/sea/', 'sea', [0,2,-100], [8,4,4], [0,0,0], false)

    loadObj('../resources/models/sand/', 'sand', [0,2.5,50], [8,4,4], [0,0,0], false)

    loadObj('../resources/models/moon/', 'Moon', [0,-100, -350], [50,50,50], [0,0,0], false)

    renderer.render(scene, camera);
    requestAnimationFrame(render);

    let color = 0x9f5050;
    // const intensity = 1;
    // // const light = new THREE.PointLight(color, intensity);
    // const light = new THREE.SpotLight(color, intensity);
    // light.position.set(0, 200, 0);
    // scene.add(light);
    // scene.add(light.target);

    let intensity = 2.1;
    let light = new THREE.DirectionalLight(color, intensity);
    light.castShadow = true;
    light.position.set(0, 200, 0);
    light.target.position.set(0, 0, 0);

    // Increase the width and height of the shadow camera
    const shadowCameraSize = 200; // You can adjust this value as needed
    light.shadow.camera.left = -shadowCameraSize;
    light.shadow.camera.right = shadowCameraSize;
    light.shadow.camera.top = shadowCameraSize;
    light.shadow.camera.bottom = -shadowCameraSize;

    // Optional: adjust near and far plane to fit your scene better
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 500;

    // Update the shadow camera projection matrix
    light.shadow.camera.updateProjectionMatrix();

    scene.add(light);
    scene.add(light.target);
    

    const gui = new GUI();
    gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
    gui.add(light, 'intensity', 0, 5, 0.01).name('Main Intensity');


    const skyColor = 0xB1E1FF;  // light blue
    const groundColor = 0xB97A20;  // brownish orange
    intensity = 0.2;
    let light_2 = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light_2);

    gui.add(light_2, 'intensity', 0, 0.5, 0.01).name('HemiSphere Intensity');
    gui.addColor(new ColorGUIHelper(light_2, 'color'), 'value').name('skyColor');
    gui.addColor(new ColorGUIHelper(light_2, 'groundColor'), 'value').name('groundColor');

    color = 0x5f541b;
    intensity = 0.2;
    let light_3 = new THREE.AmbientLight(color, intensity);
    scene.add(light_3);
    gui.add(light_3, 'intensity', 0, 0.5, 0.01).name('Ambient Intensity');
    gui.addColor(new ColorGUIHelper(light_3, 'color'), 'value').name('ambiColor');


    gui.add(animation, "switch").name("Animation");
    gui.add(fogEnabled, "switch").name("Fog");

    pickPosition = {x: 0, y: 0};
    clearPickPosition();
    
    window.addEventListener('mousemove', setPickPosition);
    window.addEventListener('mouseout', clearPickPosition);
    window.addEventListener('mouseleave', clearPickPosition);
}
    
function getCanvasRelativePosition(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * canvas.width  / rect.width,
    y: (event.clientY - rect.top ) * canvas.height / rect.height,
  };
}

function setPickPosition(event) {
  const pos = getCanvasRelativePosition(event);
  pickPosition.x = (pos.x / canvas.width ) *  2 - 1;
  pickPosition.y = (pos.y / canvas.height) * -2 + 1;  // note we flip Y
}

function clearPickPosition() {
  // unlike the mouse which always has a position
  // if the user stops touching the screen we want
  // to stop picking. For now we just pick a value
  // unlikely to pick something
  pickPosition.x = -100000;
  pickPosition.y = -100000;
}

class PickHelper {
  constructor() {
    this.raycaster = new THREE.Raycaster();
    this.pickedObject = null;
    this.pickedObjectSavedColor = 0;
  }
  pick(normalizedPosition, scene, camera, time) {
    // restore the color if there is a picked object
    if (this.pickedObject) {
      this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
      this.pickedObject = undefined;
    }
 
    // cast a ray through the frustum
    this.raycaster.setFromCamera(normalizedPosition, camera);

    // Get only the objects with the 'pickable' property set to true
    const pickableObjects = scene.children.filter(child => child.pickable);

    // get the list of objects the ray intersected, only considering the filtered pickable objects
    const intersectedObjects = this.raycaster.intersectObjects(pickableObjects);

    if (intersectedObjects.length) {
      // pick the first object. It's the closest one
      this.pickedObject = intersectedObjects[0].object;
      // save its color
      this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
      // set its emissive color to flashing red/yellow
      this.pickedObject.material.emissive.setHex((time / 5 * 8) % 2 > 1 ? this.pickedObjectSavedColor : 0x000000);
    }
  }
}

function makeXYZGUI(gui, vector3, name, onChangeFn) {
  const folder = gui.addFolder(name);
  folder.add(vector3, 'x', -10, 10).onChange(onChangeFn);
  folder.add(vector3, 'y', 0, 10).onChange(onChangeFn);
  folder.add(vector3, 'z', -10, 10).onChange(onChangeFn);
  folder.open();
}

class DegRadHelper {
  constructor(obj, prop) {
    this.obj = obj;
    this.prop = prop;
  }
  get value() {
    return THREE.MathUtils.radToDeg(this.obj[this.prop]);
  }
  set value(v) {
    this.obj[this.prop] = THREE.MathUtils.degToRad(v);
  }
}

class ColorGUIHelper {
  constructor(object, prop) {
    this.object = object;
    this.prop = prop;
  }
  get value() {
    return `#${this.object[this.prop].getHexString()}`;
  }
  set value(hexString) {
    this.object[this.prop].set(hexString);
  }
}

class MinMaxGUIHelper {
    constructor(obj, minProp, maxProp, minDif) {
      this.obj = obj;
      this.minProp = minProp;
      this.maxProp = maxProp;
      this.minDif = minDif;
    }
    get min() {
      return this.obj[this.minProp];
    }
    set min(v) {
      this.obj[this.minProp] = v;
      this.obj[this.maxProp] = Math.max(this.obj[this.maxProp], v + this.minDif);
    }
    get max() {
      return this.obj[this.maxProp];
    }
    set max(v) {
      this.obj[this.maxProp] = v;
      this.min = this.min;  // this will call the min setter
    }
}

function makeSettingCube() {
  const cubeSize = 4;
  const numCubes = 50; // number of cubes
  
  for (let i = 0; i < numCubes; i++) {
    const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    
    // Add an emissive property to the material to make cubes glow more
    const cubeMat = new THREE.MeshPhongMaterial({
      color: '#8AC',  // Base color
      emissive: '#1A2A44',  // Glowing color (bright red-orange)
      emissiveIntensity: 4  // Increase the intensity for a stronger glow
    });
    
    const mesh = new THREE.Mesh(cubeGeo, cubeMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Calculate the angle of each cube in radians (same as before)
    const angle = (i / numCubes) * (Math.PI * 2); // angle around the circle (2π for full circle)
    
    // Randomize the radius for each cube within a specified range (e.g., 5 to 15)
    const radius = Math.random() * 300; // Random radius between 5 and 15

    // Use polar coordinates to place cubes in a circular pattern
    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);
    const y = cubeSize / 2 + i * 3 + 10; // Optionally vary Y axis, or keep it constant

    mesh.position.set(x, y, z);
    mesh.pickable = true;
    scene.add(mesh);
    cubes.push(mesh);
  }
}

function makeSettingTetrahedron(numTetrahedrons = 5) {
  const tetraSize = 3;
  const tetraGeo = new THREE.TetrahedronGeometry(tetraSize);
  const tetraMat = new THREE.MeshPhongMaterial({ color: '#8AC' });

  for (let i = 0; i < numTetrahedrons; i++) {
    const x = Math.random() * 100 - 50; // Random X position between -50 and 50
    const z = Math.random() * -100 - 50; // Random Z position between -50 and 50
    const y = tetraSize; // Keep Y position the same for all tetrahedrons

    const mesh = new THREE.Mesh(tetraGeo, tetraMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.set(x, y, z);

    scene.add(mesh);
  }
}




function makeSettingSphere(numSpheres = 5) {
  const sphereRadius = 3;
  const sphereWidthDivisions = 32;
  const sphereHeightDivisions = 16;
  const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
  const sphereMat = new THREE.MeshPhongMaterial({ color: '#CA8' });

  // Place spheres randomly around the scene at the same Y position
  for (let i = 0; i < numSpheres; i++) {
    const x = Math.random() * 100 - 50; // Random X position between -50 and 50
    const z = Math.random() * -100 - 50; // Random Z position between -50 and 50
    const y = sphereRadius; // Keep Y position the same for all spheres

    const mesh = new THREE.Mesh(sphereGeo, sphereMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.set(x, y, z); // Set the random position
    scene.add(mesh);
  }
}

function loadObj(path, obj_name, position, scale, rot, frameCamera, visible=true) {
  var mtlLoader = new MTLLoader();
    mtlLoader.setResourcePath(path);
    mtlLoader.setPath(path);
    mtlLoader.load(obj_name + '.mtl', function(materials) {
        materials.preload();

        var objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath(path)
        objLoader.load(obj_name + '.obj', function(object)  {
            object.scale.set(...scale);
            object.position.set(...position);
            object.rotation.set(...rot);

             // Set the object to receive shadows
            object.traverse(function(child) {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;  // Enable shadow receiving on each mesh part
              }
            });

            if (visible) {
              scene.add(object);
            }

            if (frameCamera) {
              // compute the box that contains all the stuff
              // from root and below
              const box = new THREE.Box3().setFromObject(object);
          
              const boxSize = box.getSize(new THREE.Vector3()).length();
              const boxCenter = box.getCenter(new THREE.Vector3());
          
              // set the camera to frame the box
              frameArea(boxSize * 1.2, boxSize, boxCenter, camera, 2, 15);
          
              // update the Trackball controls to handle the new size
              controls.maxDistance = boxSize * 20;
              controls.target.copy(boxCenter);
              controls.update();
            }
        });
  });
}

function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera, factor = 1, additionalHeight = 0) {
  const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
  const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5);
  const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
 
  // compute a unit vector that points in the direction the camera is now
  // in the xz plane from the center of the box
  const direction = (new THREE.Vector3())
  .subVectors(camera.position, boxCenter)
  .multiply(new THREE.Vector3(1, 0, 1))  // Flatten in the y direction
  .normalize();
 
  // move the camera to a position further away from the center
  camera.position.copy(direction.multiplyScalar(distance * factor).add(boxCenter));

  // Explicitly increase the height by adding additionalHeight to the y-coordinate
  camera.position.y += additionalHeight;
  camera.position.x -= additionalHeight * 3;
 
  // pick some near and far values for the frustum that
  // will contain the box.
  camera.near = boxSize / 100;
  camera.far = boxSize * 100;
 
  camera.updateProjectionMatrix();
 
  // point the camera to look at the center of the box
  camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
}


function render(time) {
    time *= 0.001;  // convert time to seconds

    if (animation.switch) {
      cubes.forEach((cube, ndx) => {
          const speed = 1 + ndx * 0.1;
          const rot = time * speed;
          cube.rotation.x = rot;
          cube.rotation.y = rot * 3;
      });
    }

    toggleFog();

    pickHelper.pick(pickPosition, scene, camera, time);

    renderer.render(scene, camera);

    requestAnimationFrame(render);
}

function makeMoreWhite(hexColor, blendRatio) {
  const r = (hexColor >> 16) & 0xFF;
  const g = (hexColor >> 8) & 0xFF;
  const b = hexColor & 0xFF;

  // Blend the color with white (255, 255, 255)
  const newR = Math.floor(r + (255 - r) * blendRatio);
  const newG = Math.floor(g + (255 - g) * blendRatio);
  const newB = Math.floor(b + (255 - b) * blendRatio);

  // Return the blended color as a hex value
  return (newR << 16) | (newG << 8) | newB;
}

function toggleFog() {
  if (!fogEnabled.switch) {
      // Turn fog off
      scene.fog = null;
  } else {
      // Turn fog on (example: linear fog)
      let near = 200;
      let far = 300;
      const originalColor = 0x9f5050;
      const blendedColor = makeMoreWhite(originalColor, 0.5); // blend 50% with white
      scene.fog = new THREE.Fog(blendedColor, near, far);
  }
}

function loadColorTexture( path ) {
    const texture = loader.load( path );
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

main();
