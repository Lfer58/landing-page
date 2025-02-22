class Triangle {
  constructor() {
    this.type = 'triangle';
    this.position = [0.0, 0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.size = 10.0;

    this.buffer = null;
    this.vertices = null;
  }

  render() {
    var xy = this.position;

    let [r, g, b, a] = this.color;
  

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, r, g, b, a);

    if (this.buffer === null) {
      // Create a buffer object
      this.buffer = gl.createBuffer();
      if (!this.buffer) {
        console.log("Failed to create the buffer object");
        return -1;
      }
    }


    var d = this.size/400.0;
    var d2 = this.size/200.0;
    this.vertices = [xy[0]-d, xy[1],0, xy[0]+d, xy[1],0, xy[0], xy[1]+d2,0]
    drawTriangle3D(this.vertices, this.buffer);
  }
}

function drawTriangle3D(vertices, buffer) {

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);


  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  gl.disableVertexAttribArray(a_UV);

  gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);
}

var g_globalBuffer = null;


function drawTriangle3DUV(vertices) {

  if (g_globalBuffer === null) {
    // Create a buffer object
    g_globalBuffer = gl.createBuffer();
    if (!g_globalBuffer) {
      console.log("Failed to create the buffer object");
      return -1;
    }
  
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, g_globalBuffer);
  
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
  
  
    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 5 * 4, 0);
  
    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);
  
    // Assign the buffer object to a_UV variable
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 5 * 4, 12);
  
    // Enable the assignment to a_UV variable
    gl.enableVertexAttribArray(a_UV);
  }


  gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 5);
}