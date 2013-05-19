/* global Raphael, buzz */

(function (Class, _, $, Raphael) {

    'use strict';

    var CyclicBackground, Bubbler, Bubble;

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
            this.bubbler = new Bubbler({paper : this.paper});
        },

        animate : function () {
            var now = new Date(),
                frameDiff = now - this.lastFrame;

            this.background.update(frameDiff);
            this.bubbler.update(frameDiff);

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

    Bubbler = Class.create({

        initialize : function (options) {
            var defaults = {
            };
            options = $.extend(defaults, options);
            $.extend(this, options);

            this.timeSince = 0;
            this.bubbles = [];

            this.loadSounds();
        },

        loadSounds : function () {
            var filenames = ['a#2', 'c#3', 'd#3', 'f3', 'a#3', 'c#4', 'd#4', 'f4', 'a#4', 'c#5', 'd#5', 'f5'];
            this.sounds = [];
            for (var i = 0; i < filenames.length; i += 1) {
                var filename = encodeURIComponent('audio/notes/' + filenames[i]);
                this.sounds.push(
                    new buzz.sound(filename, {
                        formats: ['wav'],
                        preload: true
                    })
                );
            }
        },

        update : function (frameDiff) {
            this.timeSince += frameDiff;

            if (_.random(0, 100) === 24) {
                this.makeNewBubble();
            }

            for (var i = 0; i < this.bubbles.length; i += 1) {
                this.bubbles[i].update(frameDiff);
            }
        },

        makeNewBubble : function () {
            var x = _.random(0, this.paper.width),
                y = _.random(0, this.paper.height),
                sound = this.soundFor(x),
                bubble = new Bubble({
                    paper : this.paper,
                    sound : sound,
                    x : x,
                    y : y
                });

            this.bubbles.push(bubble);
        },

        soundFor : function (x) {
            var sel = Math.floor(
                (x / (this.paper.width + 1)) * this.sounds.length
            );
            return this.sounds[sel];
        }

    });

    Bubble = Class.create({

        initialize : function (options) {
            var defaults = {
                sound: undefined,
                paper: undefined,
                x: 0,
                y: 0,
                fill: '#fff',
                startRadius: 10,
                stopRadius: 30,
                duration: 1000,
                startOpacity: 1.0,
                stopOpacity: 0.0
            };
            options = $.extend(defaults, options);
            $.extend(this, options);

            this.created = new Date();
            this.timeAlive = 0;
            this.alive = true;

            this.createElements();
        },

        createElements : function () {
            this.sound.stop().play();
            this.circle = this.paper.circle(this.x, this.y, this.startRadius);
            this.circle.attr({
                'fill': this.fill,
                'fill-opacity': this.startOpacity,
                'stroke-width': 0
            });
        },

        update : function (frameDiff) {
            this.timeAlive += frameDiff;

            if (this.timeAlive >= this.duration) {
                this.alive = false;
                this.circle.remove();
                return;
            }

            var percentage = this.timeAlive / this.duration;

            this.circle.attr({
                r: this.interpolate(this.startRadius, this.stopRadius, percentage),
                'fill-opacity': this.interpolate(this.startOpacity, this.stopOpacity, percentage)
            });
        },

        interpolate : function (start, stop, percentage) {
            return start + percentage * (stop - start);
        }

    });

})(Class, _, $, Raphael);
