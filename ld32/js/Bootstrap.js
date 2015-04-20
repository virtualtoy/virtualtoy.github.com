"use strict";

/**
 * @type {Stage}
 */
var stage;

/**
 * @type {LoadQueue}
 */
var queue;

/**
 * @type {Object}
 */
var scene;

var ALL_IMAGES = [
    "img/images2.jpg",
    "img/images3.jpg",
    "img/images5.jpg",
    "img/images9.jpg",
    "img/images10.jpg",
    "img/images11.jpg",
    "img/images12.jpg",
    "img/images13.jpg",
    "img/images14.jpg",
    "img/images15.jpg",
    "img/images20.jpg",
    "img/images21.jpg",
    "img/images22.jpg",
    "img/images23.jpg",
    "img/images25.jpg",
    "img/images26.jpg",
    "img/images27.jpg",
    "img/images29.jpg"
];

var ALL_FACES = [
    "img/face_0.png",
    "img/face_1.png",
    "img/face_2.png",
    "img/face_3.png",
    "img/face_4.png",
    "img/face_5.png",
    "img/face_6.png",
    "img/face_7.png",
    "img/face_8.png",
    "img/face_9.png"
];

function init () {
    stage = new createjs.Stage("app-canvas");

    //Listening for a tick event that will update the stage
    createjs.Ticker.framerate = 30;
    createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
    createjs.Ticker.addEventListener("tick", tick);

    queue = new createjs.LoadQueue();
    queue.on("complete", onLoadComplete, this);
    queue.loadManifest([
        "img/game_background.jpg",
        "img/main_menu_background.jpg",
        "img/credits_background.jpg",
        "img/help_background.jpg",
        "img/buttons.png",
        "img/victim_male.jpg",
        "img/victim_female.jpg",
        "img/progress_bar_background.png",
        "img/progress_bar.png",
        "img/bitmap_font.png",
        "img/result_popup.png",
        "img/twitter_button.png"
    ].concat(ALL_IMAGES).concat(ALL_FACES));

}

function onLoadComplete() {
    document.getElementById("loading-message").style.display = "none";
    createjs.MotionGuidePlugin.install();

    //openGame();
    openMainMenu();
}

function openGame() {
    if (scene) {
        scene.dispose();
    }
    scene = new Game(stage);
}

function openMainMenu() {
    if (scene) {
        scene.dispose();
    }
    scene = new MainMenu(stage);
}

function tick () {
    stage.update();
    if (scene) {
        scene.update();
    }
}
