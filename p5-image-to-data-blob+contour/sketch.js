var capture;
var img;
// Keep latest detected edges as polylines
let polylines = [];
let origin = { x: 0, y: 0 };
let extractingEdges = false;
let shouldExtract = false;
let minLength = 3;

// loop
let drawingSpeed = 0.0025; //0.0025;
let pointCount;
let drawingCompletion = 1;
let loopAnimation = true;

function setup() {
    createCanvas(480, 240);
    capture = createCapture(VIDEO);
    capture.size(320, 240);
    capture.hide();

    stroke(0);
    strokeWeight(1);
    noFill();
    setTimeout(function() { extractEdges(); }, 1000);
}

function draw() {

    background(255);

    if (!extractingEdges && shouldExtract) {
        extractEdges();
        extractingEdges = true;
    }

    // if we access loadPixels once we stop the capture
    // we need to re-access at every frame
    //image(capture.loadPixels(), 0, 0, 320, 240);
    //filter('INVERT');
    //extractEdges();

    // draw
    let drawnPointCount = 0.01;
    for (var i in polylines) {
        let pl = polylines[i];
        strokeCap(ROUND);
        if (pl.length > minLength) {
            beginShape();
            for (var i in pl) {
                let drawingStage = drawnPointCount / parseFloat(pointCount);
                let displayCompletion = Math.sin(drawingCompletion * Math.PI - Math.PI / 2) * 0.5 + 0.5;
                if (drawingStage < displayCompletion) {
                    let p = pl[i];
                    vertex(origin.x + p.x, origin.y + p.y);
                }
                drawnPointCount++;
            }
            endShape();
        }
    }

    // -----

    if (drawingCompletion >= 1) {
        // if (recording) {
        //     console.log('drawing completed');
        //     recording = false;
        //     gif.render();
        // }
        if (loopAnimation) {
            drawingCompletion = 0;
        }
    } else {
        drawingCompletion += drawingSpeed;
    }

    // if (recording && frameC > 2) {
    //     frameC = 0;
    //     gif.addFrame(c.elt, { delay: 30, copy: true });
    //     console.log('recording frame');
    // }

    //frameC++;

    image(capture.loadPixels(), 240, 0, 320, 240);
}

// function mouseClicked() {
//     extractEdges();
// }

function captureDataURL() {
    return capture.loadPixels().canvas.toDataURL();
}

function extractEdges() {

    img = document.getElementById('image');
    img.src = captureDataURL();

    setCaptureImage();
    // parseContours(contourFinder);
}

function keyPressed() {
    console.log(key);
    if (key == 'E') {
        extractEdges();
    }
}

function processContours(contourFinder) {

    // clear existing polylines
    polylines = [];

    // iterate through contours
    let contours = JSON.parse(JSON.stringify(contourFinder.allContours));
    for (var i = 0; i < contours.length - 1; i++) {
        let polyline = [];
        let contour = contours[i];
        for (var j = 0; j < contour.length - 1; j++) {
            polyline.push(contour[j]);
        }
        polylines.push(polyline);
    }

    extractingEdges = false;
    pointCount = getPointCount();
}

// helpers

function getPointCount() {
    let count = 0;
    for (var i = 0; i < polylines.length - 1; i++) {
        let polyline = polylines[i];
        for (var j = 0; j < polyline.length - 1; j++) {
            count++;
        }
    }
    return count;
}