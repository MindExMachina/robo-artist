//   ██████╗██╗      █████╗ ███████╗███████╗███████╗███████╗
//  ██╔════╝██║     ██╔══██╗██╔════╝██╔════╝██╔════╝██╔════╝
//  ██║     ██║     ███████║███████╗███████╗█████╗  ███████╗
//  ██║     ██║     ██╔══██║╚════██║╚════██║██╔══╝  ╚════██║
//  ╚██████╗███████╗██║  ██║███████║███████║███████╗███████║
//   ╚═════╝╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝╚══════╝
//                                                          

// Quick Machina-like API to connect to MachinaBridge
class Robot {
    constructor(socket) {
        this.socket = socket;
    }

    Move(x, y) {
        this.socket.send("Move(" + x + "," + y + ",0);");
    }

    Move(x, y, z) {
        this.socket.send("Move(" + x + "," + y + "," + z + ");");
    }

    MoveTo(x, y, z) {
        this.socket.send("MoveTo(" + x + "," + y + "," + z + ");");
    }

    TransformTo(x, y, z, x0, x1, x2, y0, y1, y2) {
        this.socket.send("TransformTo(" + x + "," + y + "," + z + "," +
            x0 + "," + x1 + "," + x2 + "," +
            y0 + "," + y1 + "," + y2 + ");");
    }

    Rotate(x, y, z, angle) {
        this.socket.send("Rotate(" + x + "," + y + "," + z + "," + angle + ");");
    }

    RotateTo(x0, x1, x2, y0, y1, y2) {
        this.socket.send("RotateTo(" + x0 + "," + x1 + "," + x2 + "," +
            y0 + "," + y1 + "," + y2 + ");");
    }

    Axes(j1, j2, j3, j4, j5, j6) {
        this.socket.send("Axes(" + j1 + "," + j2 + "," + j3 + "," + j4 + "," + j5 + "," + j6 + ");");
    }

    AxesTo(j1, j2, j3, j4, j5, j6) {
        this.socket.send("AxesTo(" + j1 + "," + j2 + "," + j3 + "," + j4 + "," + j5 + "," + j6 + ");");
    }

    Speed(speed) {
        this.socket.send("Speed(" + speed + ");");
    }

    SpeedTo(speed) {
        this.socket.send("SpeedTo(" + speed + ");");
    }

    Precision(precision) {
        this.socket.send("Precision(" + precision + ");");
    }

    PrecisionTo(precision) {
        this.socket.send("PrecisionTo(" + precision + ");");
    }

    MotionMode(mode) {
        this.socket.send('MotionMode("' + mode + '");');
    }

    Message(msg) {
        this.socket.send('Message("' + msg + '");');
    }

    Wait(millis) {
        this.socket.send("Wait(" + millis + ");");
    }

    PushSettings() {
        this.socket.send("PushSettings();");
    }

    PopSettings() {
        this.socket.send("PopSettings();");
    }

    Tool(name, x, y, z, x0, x1, x2, y0, y1, y2, weightkg, gx, gy, gz) {
        this.socket.send(`DefineTool("${name}",${x},${y},${z},${x0},${x1},${x2},${y0},${y1},${y2},${weightkg},${gx},${gy},${gz});`);
    }

    Attach(toolName) {
        this.socket.send(`AttachTool("${toolName}");`);
    }

    Detach() {
        this.socket.send("Detach();");
    }
}


//  ██████╗  ██████╗ ██████╗  ██████╗ ████████╗
//  ██╔══██╗██╔═══██╗██╔══██╗██╔═══██╗╚══██╔══╝
//  ██████╔╝██║   ██║██████╔╝██║   ██║   ██║   
//  ██╔══██╗██║   ██║██╔══██╗██║   ██║   ██║   
//  ██║  ██║╚██████╔╝██████╔╝╚██████╔╝   ██║   
//  ╚═╝  ╚═╝ ╚═════╝ ╚═════╝  ╚═════╝    ╚═╝   
//                                             
const rws = new ReconnectingWebSocket('ws://127.0.0.1:6999/Bridge', undefined, {});
rws.timeout = 1000;

rws.addEventListener('open', () => {
    // console.log('send-strokes');
    // rws.send('{"method":"send-strokes", "params": {"strokes": [[-3,4,1,0,0],[3,10,1,0,0]]}}');
    console.log('websocket.open()');
    initializeRobot();
});

rws.addEventListener('message', (e) => {
    // handleMessage(JSON.parse(e.data));
    console.log("Received from server: " + e.data);
});

rws.addEventListener('close', () => {
    console.log('connection closed');
});

rws.onerror = (err) => {
    if (err.code === 'EHOSTDOWN') {
        console.log('server down');
    }
};

function initializeRobot() {
    console.log('intializeRobot()');
    robotDrawer = new Robot(rws);

    // Init the sharpies (definitions taken from 'toolDefinitionGenerator' in GH)
    switch (ROBOT_MAKE.toUpperCase()) {
        // new Tool("${name}",${x},${y},${z},${x0},${x1},${x2},${y0},${y1},${y2},${weightkg},${gx},${gy},${gz});`);
        case "UR":``
            robotDrawer.Tool("sharpie1",
                101.116, 0, 150.116,
                0.70711, 0, -0.70711,
                0, 1, 0,
                0.1,
                0, 0, 49);
            robotDrawer.Tool("sharpie4",
                0, 101.116, 150.116,
                0, 0.70711, -0.70711, -1, 0, 0,
                0.1,
                0, 0, 49);
            break;

        case "ABB":
            robotDrawer.Tool("sharpie1", 67.5, -67.5, 154.459, 0.5, -0.5, -0.70711, 0.70711, 0.70711, 0, 0.1, 0, 0, 59); // sharpie sticking 60mm out
            robotDrawer.Tool("sharpie4", 69, 69, 156.581, 0.5, 0.5, -0.70711, -0.70711, 0.70711, 0, 0.1, 0, 0, 59); // sharpie sticking 63mm out
            break;

        default:
            bot.Message("CANNOT INITIALIZE SHARPIE TOOLS");
            break;

        bot.Message("Initialized robot on robo-artist.");
    }

    homeRobot(robotDrawer);
}

function homeRobot(bot) {
    bot.Message("Homing Robot");
    bot.PushSettings();
    bot.SpeedTo(travelSpeed);
    switch (ROBOT_MAKE.toUpperCase()) {
        case "UR":
            bot.AxesTo(0, -90, -90, -90, 90, 90);
            break;

        case "ABB":
            bot.AxesTo(0, 0, 0, 0, 90, 0);
            break;

        default:
            bot.Message("NOT SURE HOW TO HOME THIS ROBOT...");
            break
    }
    bot.PopSettings();
}
