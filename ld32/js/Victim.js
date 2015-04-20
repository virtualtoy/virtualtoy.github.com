"use strict";
(function() {

    /**
     * @constructor
     */
    function Victim() {

        var INSANITY_CHANGE = 0.09;
        var INSANITY_AUTO = 0.0003;

        var view = new createjs.Container();

        var victim = new createjs.Bitmap(queue.getResult(
            Math.random() < 0.5 ? "img/victim_male.jpg" : "img/victim_female.jpg"
        ));
        view.addChild(victim);

        var face = new createjs.Bitmap(queue.getResult(ALL_FACES[0]));
        face.x = 69;
        face.y = 45;
        view.addChild(face);

        var insanity = 0;
        var downed = false;
        var upped = false;

        this.update = function () {
            if (insanity == 1) {
                return;
            }

            if (!downed && !upped) {
                insanity -= INSANITY_AUTO;
            }else {
                if (downed) {
                    insanity += INSANITY_CHANGE;
                    downed = false;
                }
                if (upped) {
                    insanity -= INSANITY_CHANGE;
                    upped = false;
                }
            }

            if (insanity < 0) {
                insanity = 0;
            }else if (insanity > 1) {
                insanity = 1;
            }

            var faceFrame = Math.floor(insanity * (ALL_FACES.length - 1));
            face.image = queue.getResult(ALL_FACES[faceFrame]);

        };

        this.down = function () {
            downed = true;
        };

        this.up = function () {
            upped = true;
        };

        this.getInsanity = function () {
            return insanity;
        };

        this.isDead = function () {
            return insanity >= 1;
        };

        this.getView = function () {
            return view;
        };

    }

    window.Victim = Victim;

})();
