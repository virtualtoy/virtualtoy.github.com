'use strict';

(function() {
    /**
     * @type {Stage}
     */
    var stage;

    /**
     * @type {LoadQueue}
     */
    var queue;

    /**
     * @type {Game}
     */
    var game;

    window.init = function() {
        stage = new createjs.Stage('app-canvas');

        createjs.Ticker.framerate = 30;
        createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
        createjs.Ticker.addEventListener('tick', tick);

        queue =
        window.queue = new createjs.LoadQueue();
        queue.on('complete', onLoadComplete, this);
        queue.loadManifest([
            'img/background.png',
            'img/sprite.png',
            'img/overlay.png'
        ]);
    };

    function onLoadComplete() {

        window.__stopPreloader__();

        createjs.MotionGuidePlugin.install();

        if (createjs.Touch.isSupported()) {
            createjs.Touch.enable(stage, true);
        }

        game = new Game(stage);
    }

    function tick(event) {
        stage.update();
        if (game) {
            game.update(event);
        }
    }
})();