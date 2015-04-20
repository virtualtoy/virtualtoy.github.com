"use strict";
(function() {

    /**
     * @param {Container} container
     * @constructor
     */
    function Game(container) {

        var view = new createjs.Container();
        container.addChild(view);

        var background = new createjs.Bitmap(queue.getResult("img/game_background.jpg"));
        view.addChild(background);

        var victim = new Victim();
        view.addChild(victim.getView());

        var barBackground = new createjs.Bitmap(queue.getResult("img/progress_bar_background.png"));
        barBackground.x = 3;
        barBackground.y = 116;
        view.addChild(barBackground);

        var barMask = new createjs.Shape();
        barMask.graphics.beginFill("red");
        barMask.graphics.drawRect(0, 0, 123, 13);
        barMask.cache(0, 0, 123, 13);

        barMask.scaleX = 0.5;

        var bar = new createjs.Bitmap(queue.getResult("img/progress_bar.png"));
        bar.x = 3;
        bar.y = 116;
        bar.filters = [
            new createjs.AlphaMaskFilter(barMask.cacheCanvas)
        ];
        bar.cache(0, 0, 123, 13);
        view.addChild(bar);

        var conveyor = new Conveyor(this);
        view.addChild(conveyor.getView());

        var startTime = Date.now();
        var resultShown = false;

        view.on("mousedown", onMouseEvent.bind(this));

        /**
         * @param {MouseEvent} e
         */
        function onMouseEvent (e) {
            if (!victim.isDead()) {
                conveyor.hitTest(e.stageX, e.stageY);
            }
        }

        function showResult() {
            var time = Math.floor((Date.now() - startTime) / 1000);

            var resultPopup = new createjs.Container();
            resultPopup.addChild(new createjs.Bitmap(queue.getResult("img/result_popup.png")));

            var spriteSheetData = {
                images: [queue.getResult("img/buttons.png")],
                frames: {width: 85, height: 26},
                animations: {
                    startUp: 0,
                    startDown: 1,
                    helpUp: 2,
                    helpDown: 3,
                    creditsUp: 4,
                    creditsDown: 5
                }
            };

            var spriteSheet = new createjs.SpriteSheet(spriteSheetData);

            var startButton = new createjs.Sprite(spriteSheet);
            startButton.x = 85;
            startButton.y = 140;
            resultPopup.addChild(startButton);
            new createjs.ButtonHelper(startButton, "startDown", "startUp", "startUp");

            var twitterButton = new createjs.Bitmap(queue.getResult("img/twitter_button.png"));
            twitterButton.x = 59;
            twitterButton.y = 168;
            twitterButton.on("click", function () {
                window.open("https://twitter.com/virtualtoy");
            });
            resultPopup.addChild(twitterButton);

            spriteSheetData = {
                images: [queue.getResult("img/bitmap_font.png")],
                frames: {width: 18, height: 19},
                animations: {
                    0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9
                }
            };

            spriteSheet = new createjs.SpriteSheet(spriteSheetData);

            var scoreText = new createjs.BitmapText(time.toString(), spriteSheet);
            scoreText.x = (256 - scoreText.getBounds().width) / 2;
            scoreText.y = 50;
            resultPopup.addChild(scoreText);

            var bestTime = time;
            try {
                if (window.localStorage) {
                    var parsedBestTime = parseFloat(window.localStorage.getItem("confessomatic_besttime"));
                    if (!isNaN(parsedBestTime)) {
                        if (time < parsedBestTime) {
                            window.localStorage.setItem("confessomatic_besttime", time);
                        }else {
                            bestTime = parsedBestTime;
                        }
                    }else {
                        window.localStorage.setItem("confessomatic_besttime", time);
                    }
                }
            }catch (e){
                console.log("Error: " + e);
            }

            var bestScoreText = new createjs.BitmapText(bestTime.toString(), spriteSheet);
            bestScoreText.x = (256 - bestScoreText.getBounds().width) / 2;
            bestScoreText.y = 104;
            resultPopup.addChild(bestScoreText);

            resultPopup.y = -192;
            view.addChild(resultPopup);

            createjs.Tween.get(resultPopup).wait(800).to({y:0}, 800, createjs.Ease.bounceOut).call(
                function () {
                    startButton.on("click", restart);
                }
            );

        }

        function restart() {
            openGame();
        }

        this.update = function () {
            victim.update();
            conveyor.update();

            barMask.cache(0, 0, Math.max(1, 123 * victim.getInsanity()), 13);
            bar.cache(0, 0, 123, 13);

            if (this.isCompleted() && !resultShown) {
                resultShown = true;
                showResult();
            }
        };
        
        this.victimDown = function () {
            victim.down();
        };

        this.victimUp = function () {
            victim.up();
        };

        this.isCompleted = function () {
            return victim.isDead();
        };
        
        this.dispose = function () {
            container.removeChild(view);
        };

    }

    window.Game = Game;

})();
