class CubeMod {
  constructor(color) {
    this.type = 'cube_mod';
    this.color = color;
    this.matrix = new Matrix4();

    this.vertices = [];
    this.textureNum = -2;
    this.buffer = null;

    let [x,y,z] = [0.5,0.5,0.5]

    let b_lf = [-x, -y, -z]; // bottom left  forward
    let b_rf = [ x, -y, -z]; // bottom right forward
    let t_rf = [ x,  y, -z]; // top    right forward
    let t_lf = [-x,  y, -z]; // top    left  forward
    let b_lb = [-x, -y,  z]; // bottom left  back
    let b_rb = [ x, -y,  z]; // bottom right back
    let t_rb = [ x,  y,  z]; // top    right back
    let t_lb = [-x,  y,  z]; // top    left  back

    let t_r = [1,1];
    let t_l = [0,1];
    let b_r = [1,0];
    let b_l = [0,0];

    {
    // Back of cube
    this.vertices.push(...b_lb, 0,0); 
    this.vertices.push(...b_rb, 1,0); 
    this.vertices.push(...t_rb, 1,1);

    this.vertices.push(...b_lb, 0,0);
    this.vertices.push(...t_lb, 0,1);
    this.vertices.push(...t_rb, 1,1);

    //left of cube
    this.vertices.push(...b_lf, 1,0);
    this.vertices.push(...t_lf, 1,1);
    this.vertices.push(...t_lb, 0,1);

    this.vertices.push(...b_lf, 1,0);
    this.vertices.push(...b_lb, 0,0);
    this.vertices.push(...t_lb, 0,1);

    // right of cube
    this.vertices.push(...b_rb, 1,0);
    this.vertices.push(...t_rb, 1,1);
    this.vertices.push(...t_rf, 0,1);

    this.vertices.push(...b_rb, 1,0);
    this.vertices.push(...b_rf, 0,0);
    this.vertices.push(...t_rf, 0,1);
    
    // bottom of cube
    this.vertices.push(...b_lf, 0,0);
    this.vertices.push(...b_rf, 1,0);
    this.vertices.push(...b_rb, 1,1);

    this.vertices.push(...b_lf, 0,0);
    this.vertices.push(...b_lb, 0,1);
    this.vertices.push(...b_rb, 1,1);

    // Front of cube
    this.vertices.push(...b_lf, 0,0);
    this.vertices.push(...b_rf, 1,0);
    this.vertices.push(...t_rf, 1,1);

    this.vertices.push(...b_lf, 0,0);
    this.vertices.push(...t_lf, 0,1);
    this.vertices.push(...t_rf, 1,1);
    
    // top of cube
    this.vertices.push(...t_lf, 0,0);
    this.vertices.push(...t_rf, 1,0);
    this.vertices.push(...t_rb, 1,1);

    this.vertices.push(...t_lf, 0,0);
    this.vertices.push(...t_lb, 0,1);
    this.vertices.push(...t_rb, 1,1);
    }

    this.vertices = new Float32Array(this.vertices);

  }

  render() {

    let [r, g, b, a] = this.color;

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, r, g, b, a);

    // Pass the texture number
    gl.uniform1i(u_WhichTexture, this.textureNum);
    
    // pass the matrix to u_ModelMatrix attribute
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // Pass the color of a point to u_fragColor uniform variable
    // gl.uniform4f(u_FragColor, r, g*0.75, b*0.75, a);

    // Pass the color of a point to u_fragColor uniform variable
    // gl.uniform4f(u_FragColor, r, g, b, a);
    
    // Pass the color of a point to u_fragColor uniform variable
    // gl.uniform4f(u_FragColor, r*0.8, g*0.9, b*0.75, a);
  
    this.initTriangles();
  
    gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 5);
  }

  initTriangles() {
    if (this.buffer === null) {
      // Create a buffer object
      this.buffer = gl.createBuffer();
      if (!this.buffer) {
        console.log("Failed to create the buffer object");
        return -1;
      }
    
      // Bind the buffer object to target
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    
      // Write date into the buffer object
      gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
    
    
      // Assign the buffer object to a_Position variable
      gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 5 * 4, 0);
    
      // Enable the assignment to a_Position variable
      gl.enableVertexAttribArray(a_Position);
    
      // Assign the buffer object to a_UV variable
      gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 5 * 4, 12);
    
      // Enable the assignment to a_UV variable
      gl.enableVertexAttribArray(a_UV);
    }
  }
}