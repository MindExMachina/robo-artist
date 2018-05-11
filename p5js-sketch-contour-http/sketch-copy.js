// A class representing a sketch-rnn-friendly stroke
class SketchRNNStroke {
    constructor(distanceThreshold) {
        this.vectors = []; // sketch-rnn vectors: [x, y, down?, up? end?]
        this.started = false;
        this.threshold = distanceThreshold;
        this.ended = false;
        this.streamed = false;
    }

    addStroke(stroke) {
        this.vectors = stroke;
        this.started = true;
        this.ended = true;
    }

    down(x, y) {
        if (!this.started) {
            this.vectors.push([x, y, 1, 0, 0]);
            this.started = true;
        } else {
            let prev = this.vectors[this.vectors.length - 1];

            if (distance(prev[0], prev[1], x, y) > this.threshold) {
                this.vectors.push([x, y, 1, 0, 0]);
            }
        }
    }



    render() {

        let prev = [];
        let current = [];
        for (let i = 1; i < this.vectors.length; i++) {
            prev = this.vectors[i - 1];
            current = this.vectors[i];

            // If prev was pen up, don't draw anything
            if (prev[3] == 1) continue;

            line(prev[0], prev[1], current[0], current[1]);
        }
    }


}



// Represents an input stroke and its prediction by sketch-rnn
class SketchRNNDoodle {
    constructor(distanceThreshold) {
        this.tolerance = distanceThreshold;
        this.inputStroke = new SketchRNNStroke(distanceThreshold);
        this.predictedStroke = undefined;
        this.started = false;
    }

    down(x, y) {
        this.inputStroke.down(x, y);
        this.started = true;
    }

    add(x, y) {
        this.inputStroke.add(x, y);
    }

    up(x, y) {
        this.inputStroke.up(x, y);
    }

    end() {
        this.inputStroke.end(x, y);
    }

    attachPrediction(prediction) {
        this.predictedStroke = prediction;
    }

    render(drawPrediction) {
        strokeWeight(3);
        stroke(0, this.inputStroke.streamed ? 255 : 127);
        this.inputStroke.render();

        if (drawPrediction && this.predictedStroke) {
            stroke(60, 171, 249, this.predictedStroke.streamed ? 255 : 64);
            this.predictedStroke.render();
        }
    }


}















//  ██████╗ ███████╗        ██╗███████╗
//  ██╔══██╗██╔════╝        ██║██╔════╝
//  ██████╔╝███████╗        ██║███████╗
//  ██╔═══╝ ╚════██║   ██   ██║╚════██║
//  ██║     ███████║██╗╚█████╔╝███████║
//  ╚═╝     ╚══════╝╚═╝ ╚════╝ ╚══════╝
/**
 * The setup() function serves to initialize your p5.js sketch.
 * Things like setting the canvas size, frame rate, or other
 * global settings.
 */
function setup() {
    // make sure we enforce some minimum size of our demo
    screen_width = Math.max(window.innerWidth, 480);
    screen_height = Math.max(window.innerHeight, 320);

    // make the canvas and clear the screens
    createCanvas(screen_width, screen_height);
    frameRate(60);

    noFill();

    clearAllDoodles();

    //drawRectStrokes(200,400);

    var polylines = [];

    var pointsString = [

        { x: 0, y: 0 },
        { x: 0, y: 200 },
        { x: 300, y: 200 },
        { x: 123, y: 234 },
        { x: 430, y: 432 },
        { x: 300, y: 0 },
        { x: 0, y: 0 }
    ]

    //var polyline = document.createElementNS('http://www.w3.org/2000/svg','polyline');
    //  polyline.setAttributeNS(null, 'points', pointsString);

    drawPolylineStroke(pointsString);

}

function draw() {
    background(255);

    strokeWeight(3);
    stroke(0);


    drawingDoodle.render();

    completedDoodles.forEach(doodle => doodle.render(showPredictions));
    robotDrawnDoodles.forEach(doodle => doodle.render(showPredictions));
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
        case 'c':
            console.log("clearing strokes");
            clearAllDoodles();
            return false;

        case 'p':
            makePrediction();
            return false;

        case 's':
            showPredictions = !showPredictions;
            console.log("Showing predictions: " + showPredictions);
            return false;

        case 'r':
            sendDoodlesToRobot();
            return false;

        case 'h':
            homeRobot(robotDrawer);
            return false;

            // Change model:
        default:
            let numericEntry = availableModels[key];
            if (numericEntry) {
                model_name_current = availableModels[key];
                console.log("Set model to #" + key + " " + model_name_current);
                return false;
            }
            break;
    };

    // return false;  // prevent default browser behavior
}