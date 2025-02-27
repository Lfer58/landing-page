class CubeMod_Rep1 {
  constructor(color, length, width, height) {
    this.type = 'cube_mod_rep1';
    this.color = color;
    this.matrix = new Matrix4();

    this.vertices = [];
    this.textureNum = 0;
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

    // [x,y,z] = [1,1,1]

    var beg_length = - length / 2 + 0.5;
    var beg_width = - width / 2 + 0.5;
    var beg_height = - height / 2 + 0.5;

    var end_length = length / 2 - 0.5;
    var end_width = width / 2 - 0.5;
    var end_height = height / 2 - 0.5;

    {

      for (var i = - length / 2 + 0.5; i < length / 2 + 0.5; i++) {
        // length = 1
        // i = 0, i = 1 x
        // length = 2
        // i = -0.5, i = 0.5, i = 1.5 x
        // length = 3
        // i = -1, i = 0, i = 1, i = 2 x
        for (var j = - width / 2 + 0.5; j < width / 2 + 0.5; j++) {
          // top of cube
          this.vertices.push(t_lf[0] + i, t_lf[1] + end_height, t_lf[2] + j, 0,0);
          this.vertices.push(t_rf[0] + i, t_rf[1] + end_height, t_rf[2] + j, 1,0);
          this.vertices.push(t_rb[0] + i, t_rb[1] + end_height, t_rb[2] + j, 1,1);

          this.vertices.push(t_lf[0] + i, t_lf[1] + end_height, t_lf[2] + j, 0,0);
          this.vertices.push(t_lb[0] + i, t_lb[1] + end_height, t_lb[2] + j, 0,1);
          this.vertices.push(t_rb[0] + i, t_rb[1] + end_height, t_rb[2] + j, 1,1);

          // bottom of cube
          this.vertices.push(b_lf[0] + i, b_lf[1] + beg_height, b_lf[2] + j, 0,0);
          this.vertices.push(b_rf[0] + i, b_rf[1] + beg_height, b_rf[2] + j, 1,0);
          this.vertices.push(b_rb[0] + i, b_rb[1] + beg_height, b_rb[2] + j, 1,1);

          this.vertices.push(b_lf[0] + i, b_lf[1] + beg_height, b_lf[2] + j, 0,0);
          this.vertices.push(b_lb[0] + i, b_lb[1] + beg_height, b_lb[2] + j, 0,1);
          this.vertices.push(b_rb[0] + i, b_rb[1] + beg_height, b_rb[2] + j, 1,1);
        }
        
        for (var j = - height / 2 + 0.5; j < height / 2 + 0.5; j++) {
          // Front of cube
          this.vertices.push(b_lf[0] + i, b_lf[1] + j, b_lf[2] + beg_width, 0,0);
          this.vertices.push(b_rf[0] + i, b_rf[1] + j, b_rf[2] + beg_width, 1,0);
          this.vertices.push(t_rf[0] + i, t_rf[1] + j, t_rf[2] + beg_width, 1,1);

          this.vertices.push(b_lf[0] + i, b_lf[1] + j, b_lf[2] + beg_width, 0,0);
          this.vertices.push(t_lf[0] + i, t_lf[1] + j, t_lf[2] + beg_width, 0,1);
          this.vertices.push(t_rf[0] + i, t_rf[1] + j, t_rf[2] + beg_width, 1,1);

          // Back of cube
          this.vertices.push(b_lb[0] + i, b_lb[1] + j, b_lb[2] + end_width, 0,0);
          this.vertices.push(b_rb[0] + i, b_rb[1] + j, b_rb[2] + end_width, 1,0);
          this.vertices.push(t_rb[0] + i, t_rb[1] + j, t_rb[2] + end_width, 1,1);

          this.vertices.push(b_lb[0] + i, b_lb[1] + j, b_lb[2] + end_width, 0,0);
          this.vertices.push(t_lb[0] + i, t_lb[1] + j, t_lb[2] + end_width, 1,0);
          this.vertices.push(t_rb[0] + i, t_rb[1] + j, t_rb[2] + end_width, 1,1);
        }
      }

      for (var i = - width / 2 + 0.5; i < width / 2 + 0.5; i++) {
        for (var j = - height / 2 + 0.5; j < height / 2 + 0.5; j++) {
          // left of cube
          this.vertices.push(b_lf[0] + beg_length, b_lf[1] + j, b_lf[2] + i, 1,0);
          this.vertices.push(t_lf[0] + beg_length, t_lf[1] + j, t_lf[2] + i, 1,1);
          this.vertices.push(t_lb[0] + beg_length, t_lb[1] + j, t_lb[2] + i, 0,1);

          this.vertices.push(b_lf[0] + beg_length, b_lf[1] + j, b_lf[2] + i, 1,0);
          this.vertices.push(b_lb[0] + beg_length, b_lb[1] + j, b_lb[2] + i, 0,0);
          this.vertices.push(t_lb[0] + beg_length, t_lb[1] + j, t_lb[2] + i, 0,1);

          // right of cube
          this.vertices.push(b_rb[0] + end_length, b_rb[1] + j, b_rb[2] + i, 0,0);
          this.vertices.push(t_rb[0] + end_length, t_rb[1] + j, t_rb[2] + i, 1,0);
          this.vertices.push(t_rf[0] + end_length, t_rf[1] + j, t_rf[2] + i, 1,1);

          this.vertices.push(b_rb[0] + end_length, b_rb[1] + j, b_rb[2] + i, 0,0);
          this.vertices.push(b_rf[0] + end_length, b_rf[1] + j, b_rf[2] + i, 0,1);
          this.vertices.push(t_rf[0] + end_length, t_rf[1] + j, t_rf[2] + i, 1,1);
        }
      }


  
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