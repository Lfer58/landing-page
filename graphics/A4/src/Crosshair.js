/**
 * This class is inspired by
 * https://stackoverflow.com/questions/44541915/javascript-canvas-crosshair-at-center
 * https://www.w3schools.com/jsref/canvas_lineto.asp
 * https://sites.google.com/site/webglbook/home/9-various-techniques
 * and my classmate.
 */
class Crosshair {

    constructor() {
        let img = new Image();

        var c_midx = canvas.width / 2;
        var c_midy = canvas.height / 2;
        
        img.src = "../img/crosshair/xhairb2.png"; // Path to your crosshair image
        img.onload = function () {
            // this.ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, c_midx - 10, c_midy - 10, 20, 20);
        };

        let img1 = new Image();
        
        img1.src = "../img/weapons/shotgun/SHTFC0.png"; // Path to your crosshair image
        img1.onload = function () {
            ctx.drawImage(img1, c_midx - 150, c_midy + 100, 300, 300);
        };
    }
}