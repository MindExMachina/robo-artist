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
let animateDrawing = false;

function setup() {
    createCanvas(480, 240);
    capture = createCapture(VIDEO);
    capture.size(320, 240);
    capture.hide();

    stroke(0);
    strokeWeight(1);
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

    image(capture.loadPixels(), 240, 0, 320, 240);
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

function extractEdges() {

    img = document.getElementById('image');
    img.src = captureDataURL();

    setCaptureImage();
    // parseContours(contourFinder);
}


function processContours(contourFinder) {

    polylines = JSON.parse(JSON.stringify(contourFinder.allContours));

    // iterate through contours
    // let contours = JSON.parse(JSON.stringify(contourFinder.allContours));
    // for (var i = 0; i < contours.length - 1; i++) {
    //     let polyline = [];
    //     let contour = contours[i];
    //     for (var j = 0; j < contour.length - 1; j++) {
    //         polyline.push(contour[j]);
    //     }
    //     polylines.push(polyline);
    // }

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


// ------------------------
// ------------------------
// ------------------------
// ------------------------
// ------------------------
// ------------------------

let tolerance = 15;

// Virtual paper data in robot coordinates (note pixel coordinates will be flipped)
// Horizontal drawing defined by top-left corner, and width-height in mm
// Should probably match pixel space for easier mapping...
const ROBOT_MAKE = "ABB";

let cornerX = 500,
    cornerY = 100,
    cornerZSharpie1 = 215, // should lower this value to the Z height of the drawing surface 
    cornerZSharpie4 = 217.5; // this one too
let paperWidth = 17 * 25.4;
let paperScale;

let travelSpeed = 200;
    robotDrawingSpeed = 25;

let approachDistance = 50;
let penUpDistance = 15;
let approachPrecision = 5,
    drawingPrecision = 1;

let robotDrawer;

// ------------------------
// ------------------------
// ------------------------
// ------------------------
// ------------------------
// ------------------------

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

function printRobot(bot, cornerZ) {
    // TODO: if there are polylines
    // archive "drawn polylines"

    let stroke = polylines[0];
    let firstPosition = stroke[0];
    console.log('printRobot Drawing stroke');
    
    paperScale = paperWidth/width;
    bot.Message("Drawing stroke");

    bot.Attach("sharpie1");

    // start print stroke

    bot.PushSettings();
    bot.MotionMode("joint");
    bot.SpeedTo(travelSpeed);
    bot.PrecisionTo(approachPrecision);
    //bot.TransformTo(cornerX + paperScale * this.vectors[0][1], cornerY + paperScale * this.vectors[0][0], cornerZ + approachDistance, -1, 0, 0, 0, 1, 0); // Note robot XY and processing XY are flipped... 
    bot.TransformTo(
        cornerX + paperScale * firstPosition.y,
        cornerY + paperScale * firstPosition.x,
        cornerZ + approachDistance,
        // ..
        -1, 0, 0,
        0, 1, 0); // Note robot XY and processing XY are flipped... 
    bot.PopSettings();

    bot.PushSettings();
    bot.MotionMode("joint");
    bot.SpeedTo(robotDrawingSpeed);
    bot.PrecisionTo(drawingPrecision);

    console.log('printRobot before stroke iteration ');
    for (let i = 0; i < stroke.length; i++) {

        let position = stroke[i];
        bot.MoveTo(
            cornerX + paperScale * position.y,
            cornerY + paperScale * position.x,
            cornerZ);

        if (i == stroke.length - 1) {
            //last gets up
            bot.Move(0, 0, approachDistance);
        } else {
            // every position but the last is MoveTo
            bot.MoveTo(position.x, position.y, cornerZ)
        }

    }

    bot.PopSettings();

    // end print stroke

    bot.Wait(1000);
}

// function sendStrokeToRobot(bot, cornerZ) {

//     bot.PushSettings();
//     bot.MotionMode("joint");
//     bot.SpeedTo(travelSpeed);
//     bot.PrecisionTo(approachPrecision);
//     bot.TransformTo(cornerX + paperScale * this.vectors[0][1], cornerY + paperScale * this.vectors[0][0], cornerZ + approachDistance, -1, 0, 0, 0, 1, 0); // Note robot XY and processing XY are flipped... 
//     bot.PopSettings();

//     bot.PushSettings();
//     bot.MotionMode("joint");
//     bot.SpeedTo(drawingSpeed);
//     bot.PrecisionTo(drawingPrecision);

//     for (let i = 0; i < this.vectors.length; i++) {
//         bot.MoveTo(cornerX + paperScale * this.vectors[i][1], cornerY + paperScale * this.vectors[i][0], cornerZ);

//         // Check if pen up
//         if (this.vectors[i][3] == 1) {
//             bot.Move(0, 0, penUpDistance);
//             if (this.vectors[i + 1]) {
//                 bot.MoveTo(cornerX + paperScale * this.vectors[i + 1][1], cornerY + paperScale * this.vectors[i + 1][0], cornerZ + penUpDistance);
//             }
//         } else if (this.vectors[i][4] == 1) {
//             bot.Move(0, 0, approachDistance);
//         }
//     }

//     bot.PopSettings();

//     this.streamed = true;
// }

// function sendNextStrokeToRobot(bot) {
//     // Send the inputstroke
//     if (!this.inputStroke.streamed && this.inputStroke.started) {
//         paperScale = paperWidth / width; // in case widndow changed

//         bot.Message("Drawing stroke");

//         bot.Attach("sharpie1");
//         this.inputStroke.sendStrokeToRobot(bot, cornerZSharpie1);

//         bot.Wait(1000);
//     }
//     // send the prediction
//     else if (this.predictedStroke) {
//         bot.Attach("sharpie4");
//         this.predictedStroke.sendStrokeToRobot(bot, cornerZSharpie4);

//         bot.Wait(1000);
//     }

//     return this.predictedStroke && this.predictedStroke.streamed;
// }



//  ███╗   ███╗ ██████╗ ██╗   ██╗███████╗███████╗
//  ████╗ ████║██╔═══██╗██║   ██║██╔════╝██╔════╝
//  ██╔████╔██║██║   ██║██║   ██║███████╗█████╗  
//  ██║╚██╔╝██║██║   ██║██║   ██║╚════██║██╔══╝  
//  ██║ ╚═╝ ██║╚██████╔╝╚██████╔╝███████║███████╗
//  ╚═╝     ╚═╝ ╚═════╝  ╚═════╝ ╚══════╝╚══════╝
//                                               

function keyTyped() {
    switch (key) {
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
            printRobot(robotDrawer, cornerZSharpie1);
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
        default:

            break;
    };

    // return false;  // prevent default browser behavior
}