import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {GUI} from 'three/addons/libs/lil-gui.module.min.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';


let canvas;
let renderer;
let scene;
let cubes = [];
let camera;
let loader;
let texture;

function main() {
    canvas = document.querySelector('#c');
    renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

    const loadingElem = document.querySelector('#loading');
    const progressBarElem = loadingElem.querySelector('.progressbar');

    const fov = 75;
    const aspect = 2;  // the canvas default
    const near = 0.01;
    const far = 100;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = -10;

    scene = new THREE.Scene();

    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    const loadManager = new THREE.LoadingManager();
    loader = new THREE.TextureLoader(loadManager);
    texture = loader.load( 'resources/images/wall.jpg' );
    texture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshPhongMaterial({map: loadColorTexture('resources/images/wall.jpg')})

    // const materials = [
    //     new THREE.MeshPhongMaterial({map: loadColorTexture('resources/images/flower-1.jpg')}),
    //     new THREE.MeshPhongMaterial({map: loadColorTexture('resources/images/flower-2.jpg')}),
    //     new THREE.MeshPhongMaterial({map: loadColorTexture('resources/images/flower-3.jpg')}),
    //     new THREE.MeshPhongMaterial({map: loadColorTexture('resources/images/flower-4.jpg')}),
    //     new THREE.MeshPhongMaterial({map: loadColorTexture('resources/images/flower-5.jpg')}),
    //     new THREE.MeshPhongMaterial({map: loadColorTexture('resources/images/flower-6.jpg')}),
    // ];

    // loadManager.onLoad = () => {
    //     loadingElem.style.display = 'none';
    //     const cube = new THREE.Mesh(geometry, materials);
    //     scene.add(cube);
    //     cubes.push(cube);  // add to our list of cubes to rotate
    // };

    var controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    var keyLight = new THREE.DirectionalLight(new THREE.Color('hsl(30, 100%, 75%)'), 1.0);
    keyLight.position.set(-100, 0, 100);

    var fillLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 100%, 75%)'), 0.75);
    fillLight.position.set(100, 0, 100);

    var backLight = new THREE.DirectionalLight(0xffffff, 1.0);
    backLight.position.set(100, 0, -100).normalize();

    scene.add(keyLight);
    scene.add(fillLight);
    scene.add(backLight);


    var mtlLoader = new MTLLoader();
    mtlLoader.setResourcePath('./resources/models/lighthouse/');
    mtlLoader.setPath('./resources/models/lighthouse/');
    mtlLoader.load('lighthouse.mtl', function(materials) {
        materials.preload();

        // for (const material of Object.values(mtl.materials)) {
        //   material.side = THREE.DoubleSide;
        // }

        var objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath('/resources/models/lighthouse/')
        objLoader.load('lighthouse.obj', function(object)  {
            object.position.set(0, -5, 0);
            scene.add(object);

            // compute the box that contains all the stuff
            // from root and below
            const box = new THREE.Box3().setFromObject(object);
        
            const boxSize = box.getSize(new THREE.Vector3()).length();
            const boxCenter = box.getCenter(new THREE.Vector3());
        
            // set the camera to frame the box
            frameArea(boxSize * 1.2, boxSize, boxCenter, camera);
        
            // update the Trackball controls to handle the new size
            controls.maxDistance = boxSize * 10;
            controls.target.copy(boxCenter);
            controls.update();
        });
    });

    // const gui = new GUI();

    const cube = new THREE.Mesh(geometry, material);
    cubes.push(cube);

    // scene.add(cube);

    renderer.render(scene, camera);
    requestAnimationFrame(render);

    const color = 0xFFFFFF;
    const intensity = 3;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
}

function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
    const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
    const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5);
    const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
   
    // compute a unit vector that points in the direction the camera is now
    // in the xz plane from the center of the box
    const direction = (new THREE.Vector3())
    .subVectors(camera.position, boxCenter)
    .multiply(new THREE.Vector3(1, 0, 1))
    .normalize();
   
    // move the camera to a position distance units way from the center
    // in whatever direction the camera was from the center already
    camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));
   
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

    cubes.forEach((cube, ndx) => {
        const speed = 1 + ndx * 0.1;
        const rot = time * speed;
        cube.rotation.x = rot;
        // cube.rotation.y = rot;
    });

    renderer.render(scene, camera);

    requestAnimationFrame(render);
}

function makeInstance(geometry, color, x) {
    const material = new THREE.MeshPhongMaterial({ color });

    const cube = new THREE.Mesh(geometry, material);

    cube.position.x = x;

    return cube;
}

function loadColorTexture( path ) {
    const texture = loader.load( path );
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
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

class StringToNumberHelper {
    constructor(obj, prop) {
      this.obj = obj;
      this.prop = prop;
    }
    get value() {
      return this.obj[this.prop];
    }
    set value(v) {
      this.obj[this.prop] = parseFloat(v);
    }
}

const wrapModes = {
    'ClampToEdgeWrapping': THREE.ClampToEdgeWrapping,
    'RepeatWrapping': THREE.RepeatWrapping,
    'MirroredRepeatWrapping': THREE.MirroredRepeatWrapping,
  };
   
function updateTexture() {
    texture.needsUpdate = true;
}

main();
