/* global Raphael */

(function (Class, _, $, Raphael) {

    'use strict';

    var CyclicBackground;

    window.MusicBubbles = Class.create({

        initialize : function (options) {
            var defaults = {
                width : 400,
                height : 300
            };
            this.options = $.extend(defaults, options);
            this.$elem = options.$elem;
            this.width = this.options.width;
            this.height = this.options.height;

            this.initializeElements();
            this._animate = _.bind(this.animate, this);
            this.shouldAnimate = true;
            this.lastFrame = new Date();
            this._animate();
        },

        initializeElements : function () {
            this.paper = new Raphael(this.$elem[0], this.width, this.height);

            this.background = new CyclicBackground({paper : this.paper});
        },

        animate : function () {
            var now = new Date(),
                frameDiff = now - this.lastFrame;

            this.background.update(frameDiff);

            this.lastFrame = now;
            window.requestAnimationFrame(this._animate);
        }

    });

    CyclicBackground = Class.create({

        initialize : function (options) {
            var defaults = {
                cycleTime : 30 * 1000,  // 10 seconds
                hue : Math.random(),
                saturation : 0.75,
                lightness : 0.75
            };
            options = $.extend(defaults, options);
            $.extend(this, options);

            this.rect = options.paper.rect(0, 0, options.paper.width, options.paper.height);
            this.rect.attr({
                fill: 'white',
                'stroke-width': 0
            });
        },

        update : function (frameDiff) {
            this.hue += (frameDiff / this.cycleTime);
            while (this.hue > 1) {
                this.hue -= Math.floor(this.hue);
            }

            this.rect.attr({
                fill: Raphael.hsb(this.hue, this.saturation, this.lightness)
            });
        }

    });

})(Class, _, $, Raphael);
