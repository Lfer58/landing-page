class Cylinder {
  constructor(color) {
    this.type = 'cylinder';
    this.color = color;
    this.matrix = new Matrix4();
    this.segments = 20;

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


    this.generateCircleVertices([0.0, 0.0, 0.5], 360, 0);

    drawTriangle3D(this.vertices, this.buffer);
  }

  generateCircleVertices(position, angle_des, start_angle) {

    let [x, y, z] = position;
    var d = 0.5; // delta

    let angleStep = angle_des / this.segments;
    for (var angle = start_angle; angle < angle_des + start_angle; angle = angle + angleStep) {

      let centerPt = [x, y];
      let angle1 = angle;
      let angle2 = angle + angleStep;

      let vec1 = [
        Math.cos((angle1 * Math.PI) / 180) * d,
        Math.sin((angle1 * Math.PI) / 180) * d,
      ];
      let vec2 = [
        Math.cos((angle2 * Math.PI) / 180) * d,
        Math.sin((angle2 * Math.PI) / 180) * d,
      ];

      let pt1 = [centerPt[0] + vec1[0], centerPt[1] + vec1[1]];
      let pt2 = [centerPt[0] + vec2[0], centerPt[1] + vec2[1]];

      this.vertices.push(x, y, z, pt1[0], pt1[1], z, pt2[0], pt2[1], z);
      this.vertices.push(x, y, -z, pt1[0], pt1[1], -z, pt2[0], pt2[1], -z);

      // connecting face
      this.vertices.push(pt1[0], pt1[1], z, pt1[0], pt1[1], -z, pt2[0], pt2[1], z);
      this.vertices.push(pt2[0], pt2[1], -z, pt1[0], pt1[1], -z, pt2[0], pt2[1], z);
    }

  }

  // generateCubeVertices () {

  //   let [x,y,z] = [0.25, 0.125, 0.5]
    
  //   let c_1 = [-0.5,  -y, -z] // bottom left  forward
  //   let c_2 = [ 0.5,  -y, -z] // bottom right forward
  //   let c_1a = [  -x,  -y, -z] // bottom left  forward
  //   let c_2a = [   x,  -y, -z] // bottom right forward
  //   let c_3 = [   x,   y, -z] // top    right forward
  //   let c_4 = [  -x,   y, -z] // top    left  forward
  //   let c_5 = [-0.5, - y,  z] // bottom left  back
  //   let c_6 = [ 0.5, - y,  z] // bottom right back
  //   let c_5a = [ -x, - y,  z] // bottom left  back
  //   let c_6a = [  x, - y,  z] // bottom right back
  //   let c_7 = [   x,   y,  z] // top    right back
  //   let c_8 = [  -x,   y,  z] // top    left  back

  //   // Back of cube
  //   this.vertices.push(c_5a[0],c_5a[1],c_5a[2], c_6a[0],c_6a[1],c_6a[2], c_7[0],c_7[1],c_7[2]);
  //   this.vertices.push(c_5a[0],c_5a[1],c_5a[2], c_8[0],c_8[1],c_8[2], c_7[0],c_7[1],c_7[2]);

    
  //   // bottom of cube
  //   this.vertices.push(c_1[0],c_1[1],c_1[2], c_2[0],c_2[1],c_2[2], c_6[0],c_6[1],c_6[2]);
  //   this.vertices.push(c_1[0],c_1[1],c_1[2], c_5[0],c_5[1],c_5[2], c_6[0],c_6[1],c_6[2]);
    
  //   // Front of cube
  //   this.vertices.push(c_1a[0],c_1a[1],c_1a[2], c_2a[0],c_2a[1],c_2a[2], c_3[0],c_3[1],c_3[2]);
  //   this.vertices.push(c_1a[0],c_1a[1],c_1a[2], c_4[0],c_4[1],c_4[2], c_3[0],c_3[1],c_3[2]);
    
  //   // top of cube
  //   this.vertices.push(c_4[0],c_4[1],c_4[2], c_3[0],c_3[1],c_3[2], c_7[0],c_7[1],c_7[2]);
  //   this.vertices.push(c_4[0],c_4[1],c_4[2], c_8[0],c_8[1],c_8[2], c_7[0],c_7[1],c_7[2]);

  // }
}