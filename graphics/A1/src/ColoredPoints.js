// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform float u_Size;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  gl_PointSize = u_Size;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +  // uniform変数
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

// Global variables
let canvas;
let gl;
let a_Position;
let u_Size;
let u_FragColor;

function setupWebGL() {
    // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
const CUSTOM_TRI = 3;

let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_size = 10.0;
let g_selectedType = POINT;
let g_segments = 10;

function addActionsForHtmlUI() {

  // Button events
  document.getElementById('green').onclick = function() { g_selectedColor = [0.0, 1.0, 0.0, 1.0]; };
  document.getElementById('red').onclick = function() { g_selectedColor = [1.0, 0.0, 0.0, 1.0]; };
  document.getElementById('clear').onclick = function() {  g_shapesList = []; g_vertices = []; renderAllShapes();};
  document.getElementById('image').onclick = function() {  drawImage(); };

  document.getElementById('point').onclick = function() { g_selectedType = POINT; g_vertices = [];}
  document.getElementById('triangle').onclick = function() { g_selectedType = TRIANGLE; g_vertices = [];}
  document.getElementById('circle').onclick = function() { g_selectedType = CIRCLE; g_vertices = [];}
  document.getElementById('custri').onclick = function() { g_selectedType = CUSTOM_TRI; g_vertices = [];}
  
  // Color Slider events
  document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
  document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100; });
  
  // attribute slide events
  document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_size = this.value * 1.0 });
  document.getElementById('segmentSlide').addEventListener('mouseup', function() { g_segments = this.value * 1.0 });

}


function main() {
  
  setupWebGL();

  // set up GLSL shader program and connect all variables
  connectVariablesToGLSL();

  // set up actions for the html ui elements
  addActionsForHtmlUI();


  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  // canvas.onmousemove = click;
  canvas.onmousemove = function(ev) {if (ev.buttons == 1) {click(ev)}};

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];
var g_vertices = [];

// var g_points = [];  // The array for the position of a mouse press
// var g_colors = [];  // The array to store the color of a point
// var g_sizes = [];   // The array to store the size of a point

function click(ev) {

  [x, y] = converCoordinatesEventToGL(ev);

  // new point object to hold all the point information
  let point;

  if (g_selectedType != CUSTOM_TRI) {
    if (g_selectedType == POINT) {
      point = new Point();
      point.size = g_size;
    } else if (g_selectedType == TRIANGLE) {
      point = new Triangle();
    } else if (g_selectedType == CIRCLE) {
      point = new Circle();
      point.segments = g_segments;
    }
    point.position = [x,y];
    point.color = g_selectedColor.slice();
    g_shapesList.push(point);

  } else {

    if (g_vertices.length != 6) {
      g_vertices.push(x);
      g_vertices.push(y);
      console.log(g_vertices);
      if (g_vertices.length == 6) {
        point = new TriangleMod()
        point.vertices = g_vertices.slice();
        point.color = g_selectedColor.slice();
        g_vertices = [];
        g_shapesList.push(point);
      }
    } 
  }

  // Store the coordinates to g_points array
  // g_points.push([x, y]);

  // Store the size of a g_points array
  // g_sizes.push(g_size);

  // Store the colors to g_points array
  // g_colors.push(g_selectedColor.slice());

  // if (x >= 0.0 && y >= 0.0) {      // First quadrant
  //   g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
  // } else if (x < 0.0 && y < 0.0) { // Third quadrant
  //   g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
  // } else {                         // Others
  //   g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
  // }

  //Draw eveyr shape that is supposed to be in the canvas
  renderAllShapes();
}

function converCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y]);

}

function renderAllShapes() {

  var startTime = performance.now();

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);


  var len = g_shapesList.length;

  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }

  var duration = performance.now() - startTime;
  sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration), 'numdot');
  
}


// Set the text of a html element
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}

function drawImage() {

  var floor_color = [0.5, 0.1, 0.3, 1.0];
  var floor_color_light = [1.0, 0.4, 0.4, 1.0];
  var side_wall_color = [0.2, 0.0, 0.3, 1.0];
  var back_wall = [0.3, 0.1, 1.0, 1.0];
  var back_wall_lit = [0.0, 0.5, 1.0, 0.9];
  var frame = [0.5, 0.3, 0.2, 1.0];
  var frame_lit = [0.9, 0.6, 0.5, 1.0];
  var painting_color = [0.025, 0.45, 0.43, 1.0]
  var painting_color_lit = [0.05, 0.92, 0.87, 1.0]

  cieling_1 = new TriangleMod();
  cieling_1.vertices = [1, 1, -0.60, 0.4, -1, 1];
  cieling_1.color = floor_color;
  g_shapesList.push(cieling_1);

  cieling_2 = new TriangleMod();
  cieling_2.vertices = [1, 1, -0.60, 0.4, 0.4, 0.4];
  cieling_2.color = floor_color;
  g_shapesList.push(cieling_2);

  left_wall_1 = new TriangleMod();
  left_wall_1.vertices = [-1, -1, -0.60, -0.6, -0.6, 0.6];
  left_wall_1.color = side_wall_color;
  g_shapesList.push(left_wall_1);

  left_wall_2 = new TriangleMod();
  left_wall_2.vertices = [-1, -1, -0.60, 0.6, -1, 1];
  left_wall_2.color = side_wall_color;
  g_shapesList.push(left_wall_2);

  right_wall_1 = new TriangleMod();
  right_wall_1.vertices = [1, -1, 1, 1, 0.4, -0.4];
  right_wall_1.color = side_wall_color;
  g_shapesList.push(right_wall_1);

  right_wall_2 = new TriangleMod();
  right_wall_2.vertices = [1, 1, 0.4, 0.4, 0.4, -0.4];
  right_wall_2.color = side_wall_color;
  g_shapesList.push(right_wall_2);

  floor_1 = new TriangleMod();
  floor_1.vertices = [-1, -1, 1, -1, 0.7, -0.7];
  floor_1.color = floor_color;
  g_shapesList.push(floor_1);

  floor_2 = new TriangleMod();
  floor_2.vertices = [-1, -1, -0.60, -0.6, 0.7, -0.7];
  floor_2.color = floor_color;
  g_shapesList.push(floor_2);

  floor_1_light = new TriangleMod();
  floor_1_light.vertices = [0.7, -0.7, -0.60, -0.6, 0.4, -0.4];
  floor_1_light.color = floor_color_light;
  g_shapesList.push(floor_1_light);

  floor_2_light = new TriangleMod();
  floor_2_light.vertices = [0.4, -0.4, -0.60, -0.6, -0.6, -0.4];
  floor_2_light.color = floor_color_light;
  g_shapesList.push(floor_2_light);

  back_wall_1 = new TriangleMod();
  back_wall_1.vertices = [-0.6, 0.4, 0.4, -0.4, 0.4, 0.4];
  back_wall_1.color = back_wall;
  g_shapesList.push(back_wall_1);

  back_wall_2 = new TriangleMod();
  back_wall_2.vertices = [-0.6, 0.4, -0.6, 0.3, 0.4, -0.4];
  back_wall_2.color = back_wall;
  g_shapesList.push(back_wall_2);

  back_wall_light = new TriangleMod();
  back_wall_light.vertices = [-0.6, 0.3, -0.6, -0.4, 0.4, -0.4];
  back_wall_light.color = back_wall_lit;
  g_shapesList.push(back_wall_light);

  painting_frame_1 = new TriangleMod();
  painting_frame_1.vertices = [0.05, 0.2, -0.25, 0.2, 0.05, -0.155];
  painting_frame_1.color = frame;
  g_shapesList.push(painting_frame_1);

  painting_frame_2 = new TriangleMod();
  painting_frame_2.vertices = [-0.25, 0.055, -0.25, 0.2, 0.05, -0.155];
  painting_frame_2.color = frame;
  g_shapesList.push(painting_frame_2);

  painting_frame_1_light = new TriangleMod();
  painting_frame_1_light.vertices = [0.05, -0.155, -0.25, 0.055, 0.05, -0.2];
  painting_frame_1_light.color = frame_lit;
  g_shapesList.push(painting_frame_1_light);

  painting_frame_2_light = new TriangleMod();
  painting_frame_2_light.vertices = [-0.25, -0.2, -0.25, 0.055, 0.05, -0.2];
  painting_frame_2_light.color = frame_lit;
  g_shapesList.push(painting_frame_2_light);

  painting_1 = new TriangleMod();
  painting_1.vertices = [0.03, 0.18, -0.23, 0.18, 0.03, -0.141];
  painting_1.color = painting_color;
  g_shapesList.push(painting_1);

  painting_2 = new TriangleMod();
  painting_2.vertices = [-0.23, 0.040, -0.23, 0.18, 0.03, -0.141];
  painting_2.color = painting_color;
  g_shapesList.push(painting_2);

  painting_1_light = new TriangleMod();
  painting_1_light.vertices = [0.03, -0.141, -0.23, 0.040, 0.03, -0.18];
  painting_1_light.color = painting_color_lit;
  g_shapesList.push(painting_1_light);

  painting_2_light = new TriangleMod();
  painting_2_light.vertices = [-0.23, -0.18, -0.23, 0.040, 0.03, -0.18];
  painting_2_light.color = painting_color_lit;
  g_shapesList.push(painting_2_light);
  
  renderAllShapes();
}
