var capture;
var img;
// Keep latest detected edges as polylines
let polylines = [];
let origin = { x: 0, y: 0 };
// let paperCorner = { x: 700, y: -300, z: 16 };
let paperCorner = { x: 700, y: 100, z: 16 };
// let paperCorner = { x: 700, y: 100, z: 17 };
let extractingEdges = false;
let shouldExtract = false;
let minLength = 3;

// loop
let drawingSpeed = 0.0025; //0.0025;
let drawingScale = 4;
let pointCount;
let drawingCompletion = 1;
let loopAnimation = true;
let animateDrawing = false;
let shouldDisplayCapture = false;
let shouldOptimizeContours = false;
let drawingWeight = 5;

function setup() {
    createCanvas(480 * 3, 240 * 3.5);
    capture = createCapture(VIDEO);
    capture.size(320, 240);
    capture.hide();

    stroke(0);
    strokeWeight(drawingWeight);
    noFill();
    setTimeout(function() { extractEdges(); }, 2500);
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
                    vertex(p.x * drawingScale, p.y * drawingScale);
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
            if (animateDrawing) {
                drawingCompletion = 0;
            }
        }
    } else {
        if (animateDrawing) {
            drawingCompletion += drawingSpeed;
        }
    }

    // if (recording && frameC > 2) {
    //     frameC = 0;
    //     gif.addFrame(c.elt, { delay: 30, copy: true });
    //     console.log('recording frame');
    // }

    //frameC++;

    if (shouldDisplayCapture) {
        image(capture.loadPixels(), 0, 0, 320, 240);
    }
}

// function mouseClicked() {
//     extractEdges();
// }

function toggleAnimation() {
    animateDrawing = !animateDrawing;
    if (animateDrawing == false) {
        drawingCompletion = 1;
    }
}

function captureDataURL() {
    return capture.loadPixels().canvas.toDataURL();
}
//: 700, y: 50
function extractEdges() {

    img = document.getElementById('image');
    img.src = captureDataURL();

    setCaptureImage();
    // parseContours(contourFinder);
}

function extractEdgesFromData(data) {
    img = document.getElementById('image');
    img.src = data;

    setCaptureImage();
}


function processContours(contourFinder) {

    let shouldScale = false;

    if (shouldScale) {
        // iterate through contours
        polylines = [];
        let contours = JSON.parse(JSON.stringify(contourFinder.allContours));
        for (var i = 0; i < contours.length - 1; i++) {
            let polyline = [];
            let contour = contours[i];
            for (var j = 0; j < contour.length - 1; j++) {
                let position = contour[j];
                let origin = { x: -100, y: 300 };
                polyline.push({
                    x: origin.x + position.x * 0.2,
                    y: origin.y + position.y * 0.2
                });
            }
            polylines.push(polyline);
        }
    } else {
        polylines = JSON.parse(JSON.stringify(contourFinder.allContours));
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



//  ██╗    ██╗██╗███╗   ██╗██████╗  ██████╗ ██╗    ██╗
//  ██║    ██║██║████╗  ██║██╔══██╗██╔═══██╗██║    ██║
//  ██║ █╗ ██║██║██╔██╗ ██║██║  ██║██║   ██║██║ █╗ ██║
//  ██║███╗██║██║██║╚██╗██║██║  ██║██║   ██║██║███╗██║
//  ╚███╔███╔╝██║██║ ╚████║██████╔╝╚██████╔╝╚███╔███╔╝
//   ╚══╝╚══╝ ╚═╝╚═╝  ╚═══╝╚═════╝  ╚═════╝  ╚══╝╚══╝ 

// prevent touches on mobile to scroll window
var firstMove;

window.addEventListener('touchstart', function(e) {
    firstMove = true;
});

window.addEventListener('touchmove', function(e) {
    if (firstMove) {
        e.preventDefault();
        firstMove = false;
    }
});

// ensure full screen on resizing
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

let tolerance = 15;

// Virtual paper data in robot coordinates (note pixel coordinates will be flipped)
// Horizontal drawing defined by top-left corner, and width-height in mm
// Should probably match pixel space for easier mapping...
const ROBOT_MAKE = "UR";

let paperWidth = 17 * 25.4;
let paperScale;

let travelSpeed = 100;
robotDrawingSpeed = 25;

let approachDistance = 10;
let penUpDistance = 15;
let approachPrecision = 5,
    drawingPrecision = 1;

let robotDrawer;


function drawPolylineStroke(polyline) {

    for (let i = 0; i < polyline.length; i++) {

        if (i == 0) { //first gets pet down
            drawingDoodle.down(polyline[i].x, polyline[i].y);
        } else if (i == polyline.length - 1) { //last gets up
            drawingDoodle.up(polyline[i].x, polyline[i].y);
        } else {
            drawingDoodle.add(polyline[i].x, polyline[i].y);
        }
    }

    completedDoodles.push(drawingDoodle);
    drawingDoodle = new SketchRNNDoodle(tolerance);

}

function printRobot(bot) {

    paperScale = paperWidth / 320;

    scaled_polylines = [];
    let polylines_copy = JSON.parse(JSON.stringify(polylines));
    for (var i = 0; i < polylines_copy.length; i++) {
        let polyline = [];
        let contour = polylines_copy[i];
        for (var j = 0; j < contour.length; j++) {
            let position = contour[j];
            let origin = { x: -100, y: 300 };
            polyline.push({
                x: paperCorner.x + position.y * paperScale,
                y: paperCorner.y + position.x * paperScale
            });
        }
        scaled_polylines.push(polyline);
    }

    // TODO: if there are polylines
    // archive "drawn polylines"
    //console.log(scaled_polylines);

    for(var k = 0; k < scaled_polylines.length; k++) {

        let stroke = scaled_polylines[k];
        let firstPosition = stroke[0];
        console.log('printRobot Drawing stroke');
    
        bot.Message("Drawing stroke");
    
        bot.Attach("sharpie1");
    
        // start print stroke
    
        let approachDistancecornerX = 0; // TODO:initialize before
    
        bot.PushSettings();
        bot.MotionMode("joint");
        bot.SpeedTo(travelSpeed);
        bot.PrecisionTo(approachPrecision);
    
        bot.TransformTo(
            firstPosition.x, firstPosition.y, paperCorner.z + approachDistance, -1, 0, 0,
            0, 1, 0);
    
        bot.PopSettings();
    
        bot.PushSettings();
        bot.MotionMode("joint");
        bot.SpeedTo(robotDrawingSpeed);
        bot.PrecisionTo(drawingPrecision);
    
        console.log('printRobot before stroke iteration ');
        for (let i = 0; i < stroke.length; i++) {
    
            let position = stroke[i];
    
            if (i == stroke.length - 1) {
                //last gets up
                bot.MoveTo(position.x, position.y, paperCorner.z);
                //console.log("bot.MoveTo("+position.x+", "+position.y+", "+paperCorner.z+");");
                bot.Move(0, 0, approachDistance);
                //console.log("bot.Move(0, 0, "+approachDistance+");");
            } else {
                // every position but the last is MoveTo
                bot.MoveTo(position.x, position.y, paperCorner.z);
                //console.log("bot.MoveTo("+position.x+", "+position.y+", "+paperCorner.z+");");
            }
    
        }
    
        bot.PopSettings();

    }

    // end print stroke

    bot.Wait(1000);

    bot.Move(0, 0, 100);

    bot.Wait(1000);
    
}




//  ███╗   ███╗ ██████╗ ██╗   ██╗███████╗███████╗
//  ████╗ ████║██╔═══██╗██║   ██║██╔════╝██╔════╝
//  ██╔████╔██║██║   ██║██║   ██║███████╗█████╗  
//  ██║╚██╔╝██║██║   ██║██║   ██║╚════██║██╔══╝  
//  ██║ ╚═╝ ██║╚██████╔╝╚██████╔╝███████║███████╗
//  ╚═╝     ╚═╝ ╚═════╝  ╚═════╝ ╚══════╝╚══════╝
//                                               

function keyTyped() {
    switch (key) {
        case 'l':
            shouldExtract = !shouldExtract;
            break;
        case 'a':
            toggleAnimation();
            break;
        case 'm':
            if (ROBOT_MAKE == 'ABB') {
                ROBOT_MAKE = 'UR';
            } else {
                ROBOT_MAKE = 'ABB'
            }
            return false;
        case 'e':
            extractEdges();
            break;
        case 'p':
            console.log('p, print');
            printRobot(robotDrawer);
            break;
        case '9':
            shouldOptimizeContours = !shouldOptimizeContours;
            console.log('shouldOptimizeContours: ' + shouldOptimizeContours);
            break;
        case '0':
            polylines = [
                [{ x: 10, y: 10 }, { x: 310, y: 10 }, { x: 310, y: 230 }, { x: 10, y: 230 }, { x: 10, y: 10 }]
            ];
            break;
        case 'h':
            homeRobot(robotDrawer);
            return false;
        case '1':
            minLength += 3;
            break;
        case '2':
            minLength += -3;
            break;
        case '3':
            minLength = 5;
            break;
        case 'c':
            shouldDisplayCapture = !shouldDisplayCapture;
            break;
        case '3':
            drawingWeight += -0.3;
            strokeWeight(drawingWeight);
            break;
        case '4':
            drawingWeight += 0.3;
            strokeWeight(drawingWeight);
            break;
        default:

            break;
    };

    // return false;  // prevent default browser behavior
}