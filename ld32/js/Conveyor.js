"use strict";
(function() {

    /**
     *
     * @param {Game} game
     * @constructor
     */
    function Conveyor(game) {

        var TEMP_POINT = new createjs.Point();
        var IMAGE_SCALE = 0.44;
        var IMAGE_SPACING = 54;
        var IMAGE_MAX_X = 256;
        var IMAGE_MIN_X = 0;
        var TOP_LINE_Y = 133;
        var BOTTOM_LINE_Y = 162;
        var IMAGES_PER_LINE = 7;
        var MIN_MATCH_DX = 24;
        var IMAGES_COUNT = 5;

        var originalImages = ALL_IMAGES.slice();
        while (originalImages.length > IMAGES_COUNT) {
            var rndIndex = Math.floor(Math.random()* originalImages.length);
            originalImages.splice(rndIndex, 1);
        }

        var tempImages = [];

        var view = new createjs.Container();

        /**
         * @type {Array.<Bitmap>}
         */
        var lineBitmapsTop = [];
        /**
         * @type {Array.<Bitmap>}
         */
        var lineBitmapsBottom = [];
        var lineSpeedTop = -1;
        var lineSpeedBottom = 1;
        var readyImages = [];

        this.getView = function () {
            return view;
        };

        this.update = function () {
            if (!game.isCompleted()) {
                this.updateLine(true);
                this.updateLine(false);
            }
        };

        this.updateLine = function (isTop) {
            var lineBitmaps = isTop ? lineBitmapsTop : lineBitmapsBottom;
            var lineSpeed = isTop ? lineSpeedTop : lineSpeedBottom;
            var i;
            var dx;
            if (lineSpeed < 0) {
                for (i = 0; i < lineBitmaps.length; i++) {
                    if (i == 0) {
                        dx = lineBitmaps[i].x;
                        if (dx < 1) {
                            lineBitmaps[i].x += lineSpeed;
                        }else {
                            lineBitmaps[i].x -= dx / 2;
                        }
                    }else {
                        var prevItemX = lineBitmaps[i - 1].x;
                        dx = lineBitmaps[i].x - prevItemX - IMAGE_SPACING;
                        lineBitmaps[i].x = prevItemX + IMAGE_SPACING + dx / 2;
                    }
                }
                var firstBitmap = lineBitmaps[0];
                if (firstBitmap.x < IMAGE_MIN_X - firstBitmap.getTransformedBounds().width) {
                    view.removeChild(firstBitmap);
                    lineBitmaps.shift();
                    this.createBitmap(isTop);
                }
            }else if (lineSpeed > 0) {
                for (i = lineBitmaps.length - 1; i >= 0; i--) {
                    if (i == lineBitmaps.length - 1) {
                        dx = IMAGE_MAX_X - lineBitmaps[i].getTransformedBounds().width - lineBitmaps[i].x;
                        if (dx < 1) {
                            lineBitmaps[i].x += lineSpeed;
                        }else {
                            lineBitmaps[i].x += dx / 2;
                        }
                    }else {
                        var nextItemX = lineBitmaps[i + 1].x;
                        dx = nextItemX - lineBitmaps[i].x - IMAGE_SPACING;
                        lineBitmaps[i].x = nextItemX - IMAGE_SPACING - dx / 2;
                    }
                }
                var lastBitmap = lineBitmaps[lineBitmaps.length - 1];
                if (lastBitmap.x > IMAGE_MAX_X) {
                    view.removeChild(lastBitmap);
                    lineBitmaps.pop();
                    this.createBitmap(isTop);
                }
            }
        };

        this.createBitmap = function (isTop) {
            if (tempImages.length == 0) {
                tempImages = originalImages.slice();
            }

            var rndIndex = Math.floor(Math.random() * tempImages.length);
            var rndImage = tempImages.splice(rndIndex, 1)[0];

            var bitmap = new createjs.Bitmap(queue.getResult(rndImage));
            bitmap.__conveyorBitmapImage__ = rndImage;
            bitmap.scaleX = bitmap.scaleY = IMAGE_SCALE;
            var sourceY = isTop ? 0 : bitmap.image.height / 2.0;
            bitmap.sourceRect = new createjs.Rectangle(0, sourceY, bitmap.image.width, bitmap.image.height / 2.0);
            view.addChild(bitmap);
            var lineBitmaps = isTop ? lineBitmapsTop : lineBitmapsBottom;
            var lineSpeed = isTop ? lineSpeedTop : lineSpeedBottom;
            if (lineSpeed < 0) {
                bitmap.x = IMAGE_MAX_X;
            }else {
                bitmap.x = IMAGE_MIN_X - bitmap.getTransformedBounds().width;
            }
            bitmap.y = isTop ? TOP_LINE_Y : BOTTOM_LINE_Y;
            if (lineSpeed < 0) {
                lineBitmaps.push(bitmap);
            }else {
                lineBitmaps.unshift(bitmap);
            }
        };
        
        this.hitTest = function (stageX, stageY) {
            var bitmap =    this.findBitmapHitTest(stageX, stageY, lineBitmapsTop) ||
                            this.findBitmapHitTest(stageX, stageY, lineBitmapsBottom);
            if (bitmap) {
                this.selectBitmap(bitmap);
            }
        };

        /**
         * @param stageX
         * @param stageY
         * @param lineBitmaps
         * @returns {Bitmap}
         */
        this.findBitmapHitTest = function (stageX, stageY, lineBitmaps) {
            for (var i = 0; i < lineBitmaps.length; i++) {
                var bitmap = lineBitmaps[i];
                bitmap.globalToLocal(stageX, stageY, TEMP_POINT);
                if (bitmap.hitTest(TEMP_POINT.x, TEMP_POINT.y)) {
                    return bitmap;
                }
            }
            return null;
        };

        this.selectBitmap = function (bitmap) {
            var isTop = lineBitmapsTop.indexOf(bitmap) != -1;

            var otherLineBitmaps = !isTop ? lineBitmapsTop : lineBitmapsBottom;
            for (var i = 0; i < otherLineBitmaps.length; i++) {
                var otherBitmap = otherLineBitmaps[i];
                var dx = Math.abs(otherBitmap.x - bitmap.x);
                if (dx < MIN_MATCH_DX) {
                    if (bitmap.__conveyorBitmapImage__ == otherBitmap.__conveyorBitmapImage__) {
                        this.removeBitmaps(isTop ? bitmap : otherBitmap, !isTop ? bitmap : otherBitmap);
                        return;
                    }
                }
            }
            
            this.removeBitmap(bitmap, isTop);

        };
        
        this.removeBitmap = function (bitmap, isTop) {

            var lineBitmaps = isTop ? lineBitmapsTop : lineBitmapsBottom;

            lineBitmaps.splice(lineBitmaps.indexOf(bitmap), 1);
            this.createBitmap(isTop);

            var bitmapBounds = bitmap.getTransformedBounds();

            bitmap.regX = bitmapBounds.width / 2;
            bitmap.regY = bitmapBounds.height / 2;

            var offset = (Math.random() * 10 + 10) * (Math.random() < 0.5 ? -1 : 1);
            var x = bitmap.x;
            var y = bitmap.y;
            var path = [x, y, x + offset / 2, Math.random() * 10 + 80, x + offset, 200];

            view.setChildIndex(bitmap, view.numChildren - 1);

            createjs.Tween.get(bitmap).to({guide:{ path: path}, rotation: Math.random() * 300 - 150}, 400).call(
                function () {
                    view.removeChild(bitmap);
                }.bind(this)
            );

            game.victimUp();
        };

        this.removeBitmaps = function (topBitmap, bottomBitmap) {

            lineBitmapsTop.splice(lineBitmapsTop.indexOf(topBitmap), 1);
            lineBitmapsBottom.splice(lineBitmapsBottom.indexOf(bottomBitmap), 1);
            view.removeChild(topBitmap);
            view.removeChild(bottomBitmap);

            var readyImage = new createjs.Bitmap(queue.getResult(topBitmap.__conveyorBitmapImage__));
            view.addChild(readyImage);

            readyImage.scaleX = readyImage.scaleY = IMAGE_SCALE;
            readyImage.x = topBitmap.x;
            readyImage.y = topBitmap.y;

            createjs.Tween.get(readyImage).to({x:128, y:0, scaleX: 1, scaleY: 1}, 300, createjs.Ease.sineInOut).call(
                function () {
                    if (readyImages.length) {
                        view.removeChild(readyImages.pop());
                    }
                    readyImages.push(readyImage);
                }.bind(this)
            );

            this.createBitmap(true);
            this.createBitmap(false);

            game.victimDown();

            var rnd = Math.random();
            if (rnd < 0.2) {
                lineSpeedTop = -lineSpeedTop;
                lineSpeedBottom = -lineSpeedBottom;
            }else if (rnd < 0.4) {
                lineSpeedTop = (Math.random() * 0.5 + 1) * (lineSpeedTop > 0 ? 1 : -1);
                lineSpeedBottom = (Math.random() * 0.5 + 1) * (lineSpeedBottom > 0 ? 1 : -1);
            }
        };

        for (var i = 0; i <  IMAGES_PER_LINE; i++) {
            this.createBitmap(true);
            this.createBitmap(false);
        }

    }

    window.Conveyor = Conveyor;

})();
