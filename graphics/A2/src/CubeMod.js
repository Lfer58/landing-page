class CubeMod {
  constructor(color) {
    this.type = 'cube_mod';
    this.color = color;
    this.matrix = new Matrix4();

    this.buffer = null;
    this.vertices = [];
  }

  render() {

    let [r, g, b, a] = this.color;

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, r, g, b, a);
    
    // pass the matrix to u_ModelMatrix attribute
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    if (this.buffer === null) {
      // Create a buffer object
      this.buffer = gl.createBuffer();
      if (!this.buffer) {
        console.log("Failed to create the buffer object");
        return -1;
      }
    }

    let [x,y,z] = [0.5,0.5,0.5]

    let c_1 = [-x, -y, -z] // bottom left  forward
    let c_2 = [ x, -y, -z] // bottom right forward
    let c_3 = [ x,  y, -z] // top    right forward
    let c_4 = [-x,  y, -z] // top    left  forward
    let c_5 = [-x, -y,  z] // bottom left  back
    let c_6 = [ x, -y,  z] // bottom right back
    let c_7 = [ x,  y,  z] // top    right back
    let c_8 = [-x,  y,  z] // top    left  back

    // Pass the color of a point to u_fragColor uniform variable
    gl.uniform4f(u_FragColor, r, g*0.75, b*0.75, a);

    // Back of cube
    this.vertices.push(c_5[0],c_5[1],c_5[2], c_6[0],c_6[1],c_6[2], c_7[0],c_7[1],c_7[2]);
    this.vertices.push(c_5[0],c_5[1],c_5[2], c_8[0],c_8[1],c_8[2], c_7[0],c_7[1],c_7[2]);

    drawTriangle3D(this.vertices, this.buffer);
    this.vertices = [];

    // Pass the color of a point to u_fragColor uniform variable
    gl.uniform4f(u_FragColor, r, g, b, a);

    //left of cube
    this.vertices.push(c_1[0],c_1[1],c_1[2], c_4[0],c_4[1],c_4[2], c_8[0],c_8[1],c_8[2]);
    this.vertices.push(c_1[0],c_1[1],c_1[2], c_5[0],c_5[1],c_5[2], c_8[0],c_8[1],c_8[2]);

    // right of cube
    this.vertices.push(c_2[0],c_2[1],c_2[2], c_3[0],c_3[1],c_3[2], c_7[0],c_7[1],c_7[2]);
    this.vertices.push(c_2[0],c_2[1],c_2[2], c_6[0],c_6[1],c_6[2], c_7[0],c_7[1],c_7[2]);

    
    // bottom of cube
    this.vertices.push(c_1[0],c_1[1],c_1[2], c_2[0],c_2[1],c_2[2], c_6[0],c_6[1],c_6[2]);
    this.vertices.push(c_1[0],c_1[1],c_1[2], c_5[0],c_5[1],c_5[2], c_6[0],c_6[1],c_6[2]);

    drawTriangle3D(this.vertices, this.buffer);
    this.vertices = [];
    
    // Pass the color of a point to u_fragColor uniform variable
    gl.uniform4f(u_FragColor, r*0.8, g*0.9, b*0.75, a);
    
    // Front of cube
    this.vertices.push(c_1[0],c_1[1],c_1[2], c_2[0],c_2[1],c_2[2], c_3[0],c_3[1],c_3[2]);
    this.vertices.push(c_1[0],c_1[1],c_1[2], c_4[0],c_4[1],c_4[2], c_3[0],c_3[1],c_3[2]);
    
    // top of cube
    this.vertices.push(c_4[0],c_4[1],c_4[2], c_3[0],c_3[1],c_3[2], c_7[0],c_7[1],c_7[2]);
    this.vertices.push(c_4[0],c_4[1],c_4[2], c_8[0],c_8[1],c_8[2], c_7[0],c_7[1],c_7[2]);

    drawTriangle3D(this.vertices, this.buffer);
  }
}