/* global Raphael, buzz */

(function (Class, _, $, Raphael) {

    'use strict';

    var CyclicBackground, Bubbler, Bubble;

    var requestAnimationFrame = window.requestAnimationFrame ||
                                window.mozRequestAnimationFrame ||
                                window.webkitRequestAnimationFrame;

    window.MusicBubbles = Class.create({

        initialize : function (options) {
            var defaults = {
                $elem : undefined,
                width : 1024,
                height : 768
            };
            options = $.extend(defaults, options);
            $.extend(this, options);

            this.shouldAnimate = true;
            this.lastFrame = new Date();
            this.initializeElements();

            this.animate = _.bind(this.animate, this);
            this.animate();
        },

        initializeElements : function () {
            this.$elem.css('user-select', 'none');
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
            requestAnimationFrame(this.animate);
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
                paper : undefined,
                tempo : 140
            };
            options = $.extend(defaults, options);
            $.extend(this, options);

            this.timeAlive = 0;
            this.bubbles = [];
            this.lastMade = 0;

            this.loadSounds();
            this.bind();
        },

        loadSounds : function () {
            var filenames = ['a#2', 'c#3', 'd#3', 'f3', 'a#3', 'c#4', 'd#4', 'f4', 'a#4', 'c#5', 'd#5', 'f5'];
            this.sounds = [];
            for (var i = 0; i < filenames.length; i += 1) {
                var url = 'audio/notes/' + encodeURIComponent(filenames[i]);
                this.sounds.push(
                    new buzz.sound(url, {
                        formats: ['wav'],
                        preload: true
                    })
                );
            }
        },

        bind : function () {
            this.onClick = _.bind(this.onClick, this);
            $(this.paper.canvas).on('click', this.onClick);
        },

        onClick : function (event) {
            this.makeBubble(event.offsetX, event.offsetY);
            this.nextDuration = this.getNoteDuration();
        },

        makeBubble : function (x, y) {
            var sound = this.soundFor(x),
                bubble = new Bubble({
                    paper : this.paper,
                    sound : sound,
                    x : x,
                    y : y
                });

            this.bubbles.push(bubble);
            this.lastMade = this.timeAlive;
        },

        soundFor : function (x) {
            var sel = Math.floor(
                (x / (this.paper.width + 1)) * this.sounds.length
            );
            return this.sounds[sel];
        },

        update : function (frameDiff) {
            this.timeAlive += frameDiff;

            this.playBubbles();

            for (var i = 0; i < this.bubbles.length; i += 1) {
                this.bubbles[i].update(frameDiff);
            }

            this.bubbles = _.filter(this.bubbles, {alive: true});
        },

        playBubbles : function () {
            if (!this.nextDuration) {
                this.nextDuration = this.getNoteDuration();
            }

            if ((this.timeAlive - this.lastMade) > this.nextDuration) {
                this.makeRandomBubble();
                this.nextDuration = this.getNoteDuration();
            }
        },

        noteDurations : [0.25, 0.5, 0.5, 0.5, 1.0, 1.0, 1.0, 2.0, 2.0, 4.0, 4.0, 4.0, 4.0],

        getNoteDuration : function () {
            var noteLength = this.noteDurations[_.random(this.noteDurations.length - 1)],
                singleNoteLength = ((60 * 1000) / this.tempo);
            return noteLength * singleNoteLength;

        },

        makeRandomBubble : function () {
            var x = _.random(0, this.paper.width),
                y = _.random(0, this.paper.height);
            this.makeBubble(x, y);
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
                startRadius: 0.01,
                stopRadius: 0.03,
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

            var percentage = this.timeAlive / this.duration,
                radius = this.paper.width * this.interpolate(this.startRadius, this.stopRadius, percentage);

            this.circle.attr({
                r: radius,
                'fill-opacity': this.interpolate(this.startOpacity, this.stopOpacity, percentage)
            });
        },

        interpolate : function (start, stop, percentage) {
            return start + percentage * (stop - start);
        }

    });

})(Class, _, $, Raphael);
