class CubeMod_Rep {
  constructor(color, length, height, width, scale, texNum) {
    this.type = 'cube_mod_rep';
    this.color = color;
    this.matrix = new Matrix4();

    this.vertices = [];
    this.textureNum = texNum;
    this.buffer = null;
    this.scale = 1.25;

    let [x,y,z] = [0.5,0.5,0.5]

    let b_lf = [-x, -y, -z]; // bottom left  forward
    let b_rf = [ x, -y, -z]; // bottom right forward
    let t_rf = [ x,  y, -z]; // top    right forward
    let t_lf = [-x,  y, -z]; // top    left  forward
    let b_lb = [-x, -y,  z]; // bottom left  back
    let b_rb = [ x, -y,  z]; // bottom right back
    let t_rb = [ x,  y,  z]; // top    right back
    let t_lb = [-x,  y,  z]; // top    left  back

    // front/back walls
    let ft_r = [length / scale, height/scale];
    let ft_l = [0,height / scale];
    let fb_r = [length / scale, 0];
    let fb_l = [0,0];

    // side walls
    let st_r = [width / scale, height/scale];
    let st_l = [0,height / scale];
    let sb_r = [width / scale, 0];
    let sb_l = [0,0];

    // top/bottom walls
    let tt_r = [length / scale, width/scale];
    let tt_l = [0,width / scale];
    let tb_r = [length / scale, 0];
    let tb_l = [0,0];

    {
    // Back of cube
    this.vertices.push(...b_lb, ...fb_l); 
    this.vertices.push(...b_rb, ...fb_r); 
    this.vertices.push(...t_rb, ...ft_r);

    this.vertices.push(...b_lb, ...fb_l);
    this.vertices.push(...t_lb, ...ft_l);
    this.vertices.push(...t_rb, ...ft_r);

    //left of cube
    this.vertices.push(...b_lf, ...sb_r);
    this.vertices.push(...t_lf, ...st_r);
    this.vertices.push(...t_lb, ...st_l);

    this.vertices.push(...b_lf, ...sb_r);
    this.vertices.push(...b_lb, ...sb_l);
    this.vertices.push(...t_lb, ...st_l);

    // right of cube
    this.vertices.push(...b_rb, ...sb_r);
    this.vertices.push(...t_rb, ...st_r);
    this.vertices.push(...t_rf, ...st_l);

    this.vertices.push(...b_rb, ...sb_r);
    this.vertices.push(...b_rf, ...sb_l);
    this.vertices.push(...t_rf, ...st_l);
    
    // bottom of cube
    this.vertices.push(...b_lf, ...tb_l);
    this.vertices.push(...b_rf, ...tb_r);
    this.vertices.push(...b_rb, ...tt_r);

    this.vertices.push(...b_lf, ...tb_l);
    this.vertices.push(...b_lb, ...tt_l);
    this.vertices.push(...b_rb, ...tt_r);

    // Front of cube
    this.vertices.push(...b_lf, ...fb_l);
    this.vertices.push(...b_rf, ...fb_r);
    this.vertices.push(...t_rf, ...ft_r);

    this.vertices.push(...b_lf, ...fb_l);
    this.vertices.push(...t_lf, ...ft_l);
    this.vertices.push(...t_rf, ...ft_r);
    
    // top of cube
    this.vertices.push(...t_lf, ...tb_l);
    this.vertices.push(...t_rf, ...tb_r);
    this.vertices.push(...t_rb, ...tt_r);

    this.vertices.push(...t_lf, ...tb_l);
    this.vertices.push(...t_lb, ...tt_l);
    this.vertices.push(...t_rb, ...tt_r);
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