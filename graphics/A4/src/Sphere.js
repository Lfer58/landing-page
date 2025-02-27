class Sphere {
  constructor(color, length, height, width, scale, texNum) {
    this.type = 'sphere';
    this.color = color;
    this.matrix = new Matrix4();
    this.normalMatrix = new Matrix4();

    this.vertices = [];
    if (g_normalOn) {
      this.textureNum = -3;
    } else {
      this.textureNum = texNum;
    }

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

    // textures coords
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

    // normals
    let f_n = [ 0, 0,-1];
    let l_n = [-1, 0, 0];
    let r_n = [ 1, 0, 0];
    let t_n = [ 0, 1, 0];
    let d_n = [ 0,-1, 0];
    let b_n = [ 0, 0, 1];

    var d = Math.PI / 25;
    var dd = Math.PI / 25;

    for (var t = 0; t < Math.PI; t += d) {
      for (var r = 0; r < 2 * Math.PI; r += d) {
        var p1 = [sin(t) * cos(r), sin(t) * sin(r), cos(t)];

        var p2 = [sin(t+dd) * cos(r), sin(t+dd) * sin(r), cos(t+dd)];
        var p3 = [sin(t) * cos(r+dd), sin(t) * sin(r+dd), cos(t)];
        var p4 = [sin(t+dd) * cos(r+dd), sin(t+dd) * sin(r+dd), cos(t+dd)];

        var uv1 = [t/ Math.PI, r/ (2 * Math.PI)]
        var uv2 = [(t+dd)/ Math.PI, r/ (2 * Math.PI)]
        var uv3 = [t/ Math.PI, (r+dd)/ (2 * Math.PI)]
        var uv4 = [(t+dd)/ Math.PI, (r+dd)/ (2 * Math.PI)]


        this.vertices.push(...p1, ...uv1, ...p1);
        this.vertices.push(...p2, ...uv2, ...p2);
        this.vertices.push(...p4, ...uv4, ...p4);

        this.vertices.push(...p1, ...uv1, ...p1);
        this.vertices.push(...p4, ...uv4, ...p4);
        this.vertices.push(...p3, ...uv3, ...p3);


        gl.uniform4f(u_FragColor, 1,1,1,1);
      }
    }

    this.vertices = new Float32Array(this.vertices)

    this.initTriangles();


    // {
    // // Back of cube
    // this.vertices.push(...b_lb, ...fb_l, ...b_n); 
    // this.vertices.push(...b_rb, ...fb_r, ...b_n); 
    // this.vertices.push(...t_rb, ...ft_r, ...b_n);

    // this.vertices.push(...b_lb, ...fb_l, ...b_n);
    // this.vertices.push(...t_lb, ...ft_l, ...b_n);
    // this.vertices.push(...t_rb, ...ft_r, ...b_n);

    // //left of cube
    // this.vertices.push(...b_lf, ...sb_r, ...l_n);
    // this.vertices.push(...t_lf, ...st_r, ...l_n);
    // this.vertices.push(...t_lb, ...st_l, ...l_n);

    // this.vertices.push(...b_lf, ...sb_r, ...l_n);
    // this.vertices.push(...b_lb, ...sb_l, ...l_n);
    // this.vertices.push(...t_lb, ...st_l, ...l_n);

    // // right of cube
    // this.vertices.push(...b_rb, ...sb_r, ...r_n);
    // this.vertices.push(...t_rb, ...st_r, ...r_n);
    // this.vertices.push(...t_rf, ...st_l, ...r_n);

    // this.vertices.push(...b_rb, ...sb_r, ...r_n);
    // this.vertices.push(...b_rf, ...sb_l, ...r_n);
    // this.vertices.push(...t_rf, ...st_l, ...r_n);
    
    // // bottom of cube
    // this.vertices.push(...b_lf, ...tb_l, ...d_n);
    // this.vertices.push(...b_rf, ...tb_r, ...d_n);
    // this.vertices.push(...b_rb, ...tt_r, ...d_n);

    // this.vertices.push(...b_lf, ...tb_l, ...d_n);
    // this.vertices.push(...b_lb, ...tt_l, ...d_n);
    // this.vertices.push(...b_rb, ...tt_r, ...d_n);

    // // Front of cube
    // this.vertices.push(...b_lf, ...fb_l, ...f_n);
    // this.vertices.push(...b_rf, ...fb_r, ...f_n);
    // this.vertices.push(...t_rf, ...ft_r, ...f_n);

    // this.vertices.push(...b_lf, ...fb_l, ...f_n);
    // this.vertices.push(...t_lf, ...ft_l, ...f_n);
    // this.vertices.push(...t_rf, ...ft_r, ...f_n);
    
    // // top of cube
    // this.vertices.push(...t_lf, ...tb_l, ...t_n);
    // this.vertices.push(...t_rf, ...tb_r, ...t_n);
    // this.vertices.push(...t_rb, ...tt_r, ...t_n);

    // this.vertices.push(...t_lf, ...tb_l, ...t_n);
    // this.vertices.push(...t_lb, ...tt_l, ...t_n);
    // this.vertices.push(...t_rb, ...tt_r, ...t_n);
    // }

    // this.vertices = new Float32Array(this.vertices);

  }

  render() {

    let [r, g, b, a] = this.color;

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, r, g, b, a);

    // Pass the texture number
    gl.uniform1i(u_WhichTexture, this.textureNum);

    // pass the matrix to u_NormalMatrix attribute
    gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);
    
    // pass the matrix to u_ModelMatrix attribute
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // Pass the color of a point to u_fragColor uniform variable
    // gl.uniform4f(u_FragColor, r, g*0.75, b*0.75, a);

    // Pass the color of a point to u_fragColor uniform variable
    // gl.uniform4f(u_FragColor, r, g, b, a);
    
    // Pass the color of a point to u_fragColor uniform variable
    // gl.uniform4f(u_FragColor, r*0.8, g*0.9, b*0.75, a);
  
    this.initTriangles();
  
    gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 8);
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
      gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 8 * 4, 0);
    
      // Enable the assignment to a_Position variable
      gl.enableVertexAttribArray(a_Position);
    
      // Assign the buffer object to a_UV variable
      gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 8 * 4, 12);
    
      // Enable the assignment to a_UV variable
      gl.enableVertexAttribArray(a_UV);

      // Assign the buffer object to a_Normal variable
      gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 8 * 4, 20);
    
      // Enable the assignment to a_Normal variable
      gl.enableVertexAttribArray(a_Normal);
    }
  }
}

function sin(x) {
  return Math.sin(x)
}

function cos(x) {
  return Math.cos(x)
}