'use strict';
(function() {

    /**
     * @param {Container} container
     * @constructor
     */
    function Game(container) {


        var DECEL = 0.4;
        var STATE_IDLE = 0;
        var STATE_STARTING = 1;
        var STATE_STARTED = 2;
        var STATE_STOPPING_TOP = 3;
        var STATE_STOPPING_MIDDLE = 4;
        var STATE_STOPPING_BOTTOM = 5;
        var STATE_STOPPING = 6;
        var STATE_BEFORE_STOPPING = 7;

        var KARINE = 'Karine';
        var KIT = 'Kit';
        var JOSH = 'Josh';
        var ELLIOTT = 'Elliott';

        var state = STATE_IDLE;

        var vTop = 0;
        var vMiddle = 0;
        var vBottom = 0;

        var aTop;
        var aMiddle;
        var aBottom;

        var stoppingTime;

        var view = new createjs.Container();
        container.addChild(view);

        var background = new createjs.Bitmap(queue.getResult('img/background.png'));
        view.addChild(background);

        var spriteSheet = new createjs.SpriteSheet({
            images: [queue.getResult('img/sprite.png')],
            frames: [
                [0, 0, 800, 33],
                [0, 33, 800, 34],
                [0, 67, 800, 33]
            ],
            animations: {
                top: 0,
                middle: 1,
                bottom: 2
            }
        });

        var spriteTop = new createjs.Sprite(spriteSheet, 'top');
        spriteTop.y = 10;
        view.addChild(spriteTop);

        var spriteMiddle = new createjs.Sprite(spriteSheet, 'middle');
        spriteMiddle.y = spriteTop.y + spriteTop.getBounds().height;
        view.addChild(spriteMiddle);

        var spriteBottom = new createjs.Sprite(spriteSheet, 'bottom');
        spriteBottom.y = spriteMiddle.y + spriteMiddle.getBounds().height;
        view.addChild(spriteBottom);

        var overlay = new createjs.Bitmap(queue.getResult('img/overlay.png'));
        overlay.x = 96;
        overlay.y = 6;
        view.addChild(overlay);

        var text1 = new createjs.Text("", "16px Arial", "#000000");
        text1.x = 11;
        text1.y = 117;
        view.addChild(text1);
        var text2 = new createjs.Text("", "16px Arial", "#ffffff");
        text2.x = 10;
        text2.y = 116;
        view.addChild(text2);

        updateText();

        view.on('mousedown', onMouseEvent.bind(this));

        function onMouseEvent() {
            if (state === STATE_IDLE) {
                start();
            }else if (state = STATE_STARTED) {
                stop();
            }
        }

        function updateText() {
            var score1 = localStorage.getItem('score.' + KARINE) || 0;
            var score2 = localStorage.getItem('score.' + KIT) || 0;
            var score3 = localStorage.getItem('score.' + JOSH) || 0;
            var score4 = localStorage.getItem('score.' + ELLIOTT) || 0;
            text1.text =
            text2.text = 'Karine:' + score1 + ' Kit:' + score2 + ' Josh:' + score3 + ' Elliott:' + score4;
            var w = text1.getBounds().width;
            text1.x = Math.round((300 - w) / 2);
            text2.x = text1.x - 1;
        }

        function start() {
            if (state !== STATE_IDLE) {
                return;
            }
            aTop = Math.random() * 0.15 + 0.15;
            aMiddle = Math.random() * 0.15 + 0.15;
            aBottom = Math.random() * 0.15 + 0.15;
            state = STATE_STARTING;
        }

        function stop() {
            if (state !== STATE_STARTED) {
                return;
            }
            stoppingTime = Math.random() * 1000;
            state = STATE_BEFORE_STOPPING;
        }

        function update(event) {
            switch (state) {
                case STATE_STARTING:
                    updateStarting();
                    break;
                case STATE_BEFORE_STOPPING:
                    updateBeforeStopping(event.delta);
                    break;
                case STATE_STOPPING_TOP:
                    updateStoppingTop();
                    break;
                case STATE_STOPPING_MIDDLE:
                    updateStoppingMiddle();
                    break;
                case STATE_STOPPING_BOTTOM:
                    updateStoppingBottom();
                    break;
            }
            updateSprites();
        }

        function updateSprites() {
            spriteTop.x += vTop;
            spriteMiddle.x += vMiddle;
            spriteBottom.x += vBottom;
            clampSprite(spriteTop);
            clampSprite(spriteMiddle);
            clampSprite(spriteBottom);
        }

        function clampSprite(sprite) {
            if (sprite.x > 0) {
                sprite.x = sprite.x % 400 - 400;
            }else {
                sprite.x = sprite.x % 400;
            }
        }

        function updateStarting() {
            vTop -= aTop;
            vMiddle += aMiddle;
            vBottom -= aBottom;
            vTop = Math.max(-7, vTop);
            vMiddle = Math.min(7, vMiddle);
            vBottom = Math.max(-7, vBottom);
        }

        function updateBeforeStopping(delta) {
            stoppingTime -= delta;
            if (stoppingTime <= 0) {
                state = STATE_STOPPING_TOP;
            }
        }

        function updateStoppingTop() {
            vTop += DECEL;
            vTop = Math.min(0, vTop);
            if (vTop === 0) {
                state = STATE_STOPPING;
                var nearest = Math.round(spriteTop.x / 100) * 100;
                createjs.Tween.get(spriteTop).to({x:nearest}, 300, createjs.Ease.backOut).call(
                    function () {
                        state = STATE_STOPPING_MIDDLE;
                    }
                );
            }
        }

        function updateStoppingMiddle() {
            vMiddle -= DECEL;
            vMiddle = Math.max(0, vMiddle);
            if (vMiddle === 0) {
                state = STATE_STOPPING;
                var nearest = Math.round(spriteMiddle.x / 100) * 100;
                createjs.Tween.get(spriteMiddle).to({x:nearest}, 300, createjs.Ease.backOut).call(
                    function () {
                        state = STATE_STOPPING_BOTTOM;
                    }
                );
            }
        }

        function updateStoppingBottom() {
            vBottom += DECEL;
            vBottom = Math.min(0, vBottom);
            if (vBottom === 0) {
                state = STATE_STOPPING;
                var nearest = Math.round(spriteBottom.x / 100) * 100;
                createjs.Tween.get(spriteBottom).to({x:nearest}, 300, createjs.Ease.backOut).call(
                    function () {
                        complete();
                    }
                );
            }
        }

        function complete() {
            state = STATE_IDLE;
            var top = Math.abs(Math.round(spriteTop.x) % 400 / 100);
            var middle = Math.abs(Math.round(spriteMiddle.x) % 400 / 100);
            var bottom = Math.abs(Math.round(spriteBottom.x) % 400 / 100);
            if (top == middle && top == bottom) {
                var winner = ([KARINE, KIT, JOSH, ELLIOTT])[top];
                var prevScore = parseInt(localStorage.getItem('score.' + winner)) || 0;
                localStorage.setItem('score.' + winner, prevScore + 1);
                updateText();
            }
        }

        this.update = update;

    }

    window.Game = Game;

})();
