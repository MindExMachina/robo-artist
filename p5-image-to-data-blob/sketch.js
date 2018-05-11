var capture;

function setup() {
    createCanvas(390, 240);
    capture = createCapture(VIDEO);
    capture.size(320, 240);
    capture.hide();
}

function draw() {
    //background(240);
    // if we access loadPixels once we stop the capture
    // we need to re-access at every frame
    image(capture.loadPixels(), 0, 0, 320, 240);
    //filter('INVERT');
}

function captureDataURL() {
    return capture.loadPixels().canvas.toDataURL();
}