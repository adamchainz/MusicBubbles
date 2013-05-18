/* global Raphael */

(function (Class, _, $, Raphael) {

    'use strict';

    window.MusicBubbles = Class.create({

        initialize : function (options) {
            var defaults = {
                width : 400,
                height : 600
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

            this.background = this.paper.rect(0, 0, this.width, this.height);
            this.background.attr({
                fill: 'white',
                'stroke-width': 0
            });
            this.backgroundAngle = Math.random();
        },

        animate : function () {
            var now = new Date(),
                frameDiff = now - this.lastFrame;

            this.updateBackground(frameDiff);

            this.lastFrame = now;
            window.requestAnimationFrame(this._animate);
        },

        updateBackground : function (frameDiff) {
            this.backgroundAngle += (frameDiff / 1000000);
            while (this.backgroundAngle > 1) {
                this.backgroundAngle -= Math.floor(this.backgroundAngle);
            }

            this.background.attr({
                fill: Raphael.hsb(this.backgroundAngle, 0.75, 0.75)
            });
        }

    });

})(Class, _, $, Raphael);
