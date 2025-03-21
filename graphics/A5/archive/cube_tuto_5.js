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

function main() {
    canvas = document.querySelector('#c');
    renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    

    const fov = 45;
    const aspect = 2;  // the canvas default
    const near = 0.01;
    const far = 100;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    function updateCamera() {
      camera.updateProjectionMatrix();
    }

    scene = new THREE.Scene();

    makeSettingCube();

    makeSettingSphere();

    createPlane();

    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 5, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    var keyLight = new THREE.DirectionalLight(new THREE.Color('hsl(30, 100%, 75%)'), 1.0);
    keyLight.position.set(-100, 0, 100);

    var fillLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 100%, 75%)'), 0.75);
    fillLight.position.set(100, 0, 100);

    var backLight = new THREE.DirectionalLight(0xffffff, 1.0);
    backLight.position.set(100, 0, -100).normalize();

    // scene.add(keyLight);
    // scene.add(backLight);

    loadObj('/resources/models/lighthouse/', 'lighthouse')

    renderer.render(scene, camera);
    requestAnimationFrame(render);

    // let color = 0xFFFFFF;
    // let intensity = 1;
    // let light = new THREE.DirectionalLight(color, intensity);
    // light.position.set(-1, 2, 4);
    // scene.add(light);

    // let color = 0xFFFFFF;
    // let intensity = 1;
    // let light = new THREE.AmbientLight(color, intensity);
    // scene.add(light);

    // const skyColor = 0xB1E1FF;  // light blue
    // const groundColor = 0xB97A20;  // brownish orange
    // const intensity = 1;
    // const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    // scene.add(light);

    // const gui = new GUI();
    // gui.add(camera, 'fov', 1, 180).onChange(updateCamera);
    // const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
    // gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
    // gui.add(minMaxGUIHelper, 'max', 0.1, 100, 0.1).name('far').onChange(updateCamera);
    // gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('skyColor');
    // gui.addColor(new ColorGUIHelper(light, 'groundColor'), 'value').name('groundColor');
    // gui.add(light, 'intensity', 0, 5, 0.01);

    // const color = 0xFFFFFF;
    // const intensity = 1;
    // const light = new THREE.DirectionalLight(color, intensity);
    // light.position.set(0, 10, 0);
    // light.target.position.set(-5, 0, 0);
    // scene.add(light);
    // scene.add(light.target);

    // const helper = new THREE.DirectionalLightHelper(light);
    // scene.add(helper);

    const color = 0xFFFFFF;
    const intensity = 1;
    // const light = new THREE.PointLight(color, intensity);
    const light = new THREE.SpotLight(color, intensity);
    light.position.set(0, 10, 0);
    scene.add(light);
    scene.add(light.target);

    // const helper = new THREE.PointLightHelper(light);
    const helper = new THREE.SpotLightHelper(light);
    scene.add(helper);

    function updateLight() {
      // light.target.updateMatrixWorld();
      helper.update();
    }

    // updateLight();

    const gui = new GUI();
    gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
    gui.add(light, 'intensity', 0, 1, 0.01);
    gui.add(light, 'distance', 0, 40).onChange(updateLight);
    gui.add(light, 'penumbra', 0, 1, 0.01);
    gui.add(new DegRadHelper(light, 'angle'), 'value', 0, 90).name('angle').onChange(updateLight);
    
    makeXYZGUI(gui, light.position, 'position', updateLight);
    makeXYZGUI(gui, light.target.position, 'target', updateLight);

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
  const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
  // const cubeMat = new THREE.MeshPhongMaterial({color: '#8AC'});
  const cubeMat = new THREE.MeshStandardMaterial({color: '#8AC'});
  const mesh = new THREE.Mesh(cubeGeo, cubeMat);
  mesh.position.set(cubeSize + 1, cubeSize / 2, 0);
  scene.add(mesh);
}

function makeSettingSphere() {
  const sphereRadius = 3;
  const sphereWidthDivisions = 32;
  const sphereHeightDivisions = 16;
  const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
  // const sphereMat = new THREE.MeshPhongMaterial({color: '#CA8'});
  const sphereMat = new THREE.MeshStandardMaterial({color: '#CA8'});
  const mesh = new THREE.Mesh(sphereGeo, sphereMat);
  mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
  scene.add(mesh);
}

function loadObj(path, obj_name) {
  var mtlLoader = new MTLLoader();
    mtlLoader.setResourcePath(path);
    mtlLoader.setPath(path);
    mtlLoader.load(obj_name + '.mtl', function(materials) {
        materials.preload();

        var objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath(path)
        objLoader.load(obj_name + '.obj', function(object)  {
            // object.position.set(0, -5, 0);
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
}

function createPlane() {
  const planeSize = 40;
 
  const loader = new THREE.TextureLoader();
  const texture = loader.load('resources/images/checker.png');
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  const repeats = planeSize / 2;
  texture.repeat.set(repeats, repeats);

  const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
  // const planeMat = new THREE.MeshPhongMaterial({
  const planeMat = new THREE.MeshStandardMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(planeGeo, planeMat);
  mesh.rotation.x = Math.PI * -.5;
  scene.add(mesh);
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

function loadColorTexture( path ) {
    const texture = loader.load( path );
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

main();
