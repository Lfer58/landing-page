// Keshav Dubey
// nidubey@ucsc.edu
// https://lfer58.github.io/landing-page/graphics/A0/asg0.html

// DrawRectangke.js
function main() {
    // Retrieve <canvas> element
    var canvas = document.getElementById('example');
    const drawBtn = document.querySelector('input[id="draw"]');
    const drawOpBtn = document.querySelector('input[id="drawOp"]');
    const xV1 = document.getElementById('x1');
    const yV1 = document.getElementById('y1');
    const xV2 = document.getElementById('x2');
    const yV2 = document.getElementById('y2');
    const scalar = document.getElementById('scalar');
    const operation = document.getElementById('operations');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> elemnt');
        return;
    }

    // Get the rendering context for 2DCG
    var ctx = canvas.getContext('2d');
    // Draw a blue rectangle
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set a black color
    ctx.fillRect(0, 0, 400, 400); // Fill a rectangle with the color

    drawBtn.addEventListener("click", handleDrawEvent);
    drawOpBtn.addEventListener("click", handleOperation);

    const vect1 = new Vector3([34, 6, 34.2222]);
    const vect2 = new Vector3([87, 34.8675, -234]);

    const v = Vector3.cross(vect1, vect2).elements;

    console.log(v);

    // var v1 = new Vector3([2.25, 2.25, 0]);

    // drawVector(v1, "red");

    function drawVector(v, color) {
        ctx.strokeStyle = color; 
        ctx.beginPath();
        ctx.moveTo(200, 200);
        ctx.lineTo(200 + v.elements[0] * 20, 200 - v.elements[1] * 20);

        ctx.stroke();
    }

    function handleDrawEvent() {
        ctx.fillRect(0, 0, 400, 400); // clears canvas
        if (xV1.value && yV1.value) {
            var v1 = new Vector3([xV1.value, yV1.value, 0]);
            drawVector(v1, "red");
        }

        if (xV2.value && yV2.value) {
            var v2 = new Vector3([xV2.value, yV2.value, 0]);
            drawVector(v2, "blue");
        }
    }

    function areaTriangle(v1, v2) {
        return 0.5 * (Vector3.cross(v1, v2)).magnitude();
    }

    function handleOperation() {
        op = operation.value;
        var v1 = new Vector3([xV1.value, yV1.value, 0]);
        var v2 = new Vector3([xV2.value, yV2.value, 0]);
        if (op == "Add") {
            drawVector(v1.add(v2), "green");
        } else if (op == "Sub") {
            drawVector(v1.sub(v2), "green");
        } else if (op == "Mul") {
            scaVal = scalar.value;
            drawVector(v1.mul(scaVal), "green");
            drawVector(v2.mul(scaVal), "green");
        } else if (op == "Div") {
            scaVal = scalar.value;
            drawVector(v1.div(scaVal), "green");
            drawVector(v2.div(scaVal), "green");
        } else if (op == "Mag") {
            console.log("Magnitude of v1: " + v1.magnitude());
            console.log("Magnitude of v2: " + v2.magnitude());
        } else if (op == "Nor") {
            drawVector(v1.normalize(), "green");
            drawVector(v2.normalize(), "green");
        } else if (op == "Agb") {
            const dot = Vector3.dot(v1, v2);
            const radians = Math.acos(dot/(v1.magnitude() * v2.magnitude()));
            const angle = radians * (180/Math.PI);
            console.log("Angle between v1 and v2 is " + angle + " degrees");
        } else if (op == "Ara") {
            const area = areaTriangle(v1, v2);
            console.log("Area of triangle made by v1 and v2 is " + area);
        }
    }

}