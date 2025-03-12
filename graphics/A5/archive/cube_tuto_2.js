import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {GUI} from 'three/addons/libs/lil-gui.module.min.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';

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
    const near = 0.1;
    const far = 5;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 2;

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

    loadManager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {
        const progress = itemsLoaded / itemsTotal;
        progressBarElem.style.transform = `scaleX(${progress})`;
    };

    const gui = new GUI();
    gui.add(new StringToNumberHelper(texture, 'wrapS'), 'value', wrapModes)
    .name('texture.wrapS')
    .onChange(updateTexture);
    gui.add(new StringToNumberHelper(texture, 'wrapT'), 'value', wrapModes)
    .name('texture.wrapT')
    .onChange(updateTexture);
    gui.add(texture.repeat, 'x', 0, 5, .01).name('texture.repeat.x');
    gui.add(texture.repeat, 'y', 0, 5, .01).name('texture.repeat.y');
    gui.add(texture.offset, 'x', -2, 2, .01).name('texture.offset.x');
    gui.add(texture.offset, 'y', -2, 2, .01).name('texture.offset.y');
    gui.add(texture.center, 'x', -.5, 1.5, .01).name('texture.center.x');
    gui.add(texture.center, 'y', -.5, 1.5, .01).name('texture.center.y');
    gui.add(new DegRadHelper(texture, 'rotation'), 'value', -360, 360)
    .name('texture.rotation');

    const cube = new THREE.Mesh(geometry, material);
    cubes.push(cube);

    scene.add(cube);

    renderer.render(scene, camera);
    requestAnimationFrame(render);

    const color = 0xFFFFFF;
    const intensity = 3;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
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
