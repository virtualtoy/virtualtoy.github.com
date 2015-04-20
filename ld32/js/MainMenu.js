"use strict";
(function() {

    /**
     * @param {Container} container
     * @constructor
     */
    function MainMenu(container) {

        var view = new createjs.Container();
        container.addChild(view);

        var background = new createjs.Bitmap(queue.getResult("img/main_menu_background.jpg"));
        view.addChild(background);

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

        var startButton = createButton(spriteSheet, 85, 102, "startDown", "startUp");
        var helpButton = createButton(spriteSheet, 85, 126, "helpUp", "helpDown");
        var creditsButton = createButton(spriteSheet, 85, 150, "creditsUp", "creditsDown");

        var credits = new createjs.Bitmap(queue.getResult("img/credits_background.jpg"));
        credits.visible = false;
        view.addChild(credits);

        var help = new createjs.Bitmap(queue.getResult("img/help_background.jpg"));
        help.visible = false;
        view.addChild(help);

        view.on("click", onMouseEvent.bind(this));

        function createButton(spriteSheet, x, y, upLabel, downLabel) {
            var button = new createjs.Sprite(spriteSheet);
            button.x = x;
            button.y = y;
            view.addChild(button);
            new createjs.ButtonHelper(button, upLabel, downLabel, downLabel);
            return button;
        }

        function onMouseEvent(e) {
            switch (e.target) {
                case startButton:
                    createjs.Sound.registerPlugins([createjs.WebAudioPlugin]);
                    createjs.Sound.alternateExtensions = ["ogg"];
                    createjs.Sound.registerSound("snd/One-eyed Maestro_loop.mp3", "sound");
                    createjs.Sound.on("fileload", function (e) {
                        createjs.Sound.play("sound", {loop: -1});
                    });
                    openGame();
                    break;
                case helpButton:
                    help.visible = true;
                    break;
                case creditsButton:
                    credits.visible = true;
                    break;
                case help:
                case credits:
                    e.target.visible = false;
                    break;
            }
        }

        this.update = function () {
            // do nothing
        };

        this.dispose = function () {
            container.removeChild(view);
        };


    }

    window.MainMenu = MainMenu;

})();
