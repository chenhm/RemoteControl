//lusob.github.com/videotracker.js#v0.0.1
(function (window, document, undefined) {

    /**
     * Copyright (c) 2012 Luis Sobrecueva
     * Licensed under the MIT license
     */

    // HTML Document functions
    // ------------------------
    function createEl(tag, prop) {
        var el = document.createElement(tag || 'div');
        var n;
        for (n in prop) {
            el[n] = prop[n];
        }
        return el;
    }

    function ins(parent /* child1, child2, ...*/) {
        for (var i = 1, n = arguments.length; i < n; i++) {
            parent.appendChild(arguments[i]);
        }
        return parent;
    }

    function css(el, prop) {
        for (var n in prop) {
            el.style[n] = prop[n];
        }
        return el;
    }

    function merge(obj) {
        for (var i = 1; i < arguments.length; i++) {
            var def = arguments[i];
            for (var n in def) {
                if (obj[n] === undefined) obj[n] = def[n];
            }
        }
        return obj;
    }

    function pos(el) {
        var o = {x: el.offsetLeft, y: el.offsetTop};
        while ((el = el.offsetParent)) {
            o.x += el.offsetLeft;
            o.y += el.offsetTop;
        }
        return o;
    }

    // Video tracking functions
    // -------------------------
    var pikachu_show = false;
    var pikachu_show_time;
    var pikachu_size = 1;
    var car_msg = '';

    var image = new Image();
    image.onload = function() {
    };
    image.src = "sprite_01.png";

    function createFrame() {
        if(pikachu_show && car_msg == 'up' && pikachu_size > 120){
          document.querySelector('#gameover').style.zIndex = 2e9 +1;
          document.querySelector('#gameover').style.display = 'block';
          mqttClient.sendCar('down');
          return;
        }
        ctx.drawImage(video2track, 0, 0, video_width, video_height);
        if(pikachu_show){
          ctx.drawImage(image, 240 * Math.floor((pikachu_size % 8)/4), 0, 240, 200, 240 - pikachu_size, 100, 240 + pikachu_size * 2, 200 + pikachu_size * 2);
          // console.log("show");
          // ctx.strokeRect( video_width/2 - pikachu_size * 2 , video_height/2 - pikachu_size * 2 , pikachu_size * 4, pikachu_size * 4);
          pikachu_size++;
        }
        setTimeout(createFrame, 1000/30);
    };

    function showPikachu(){
      pikachu_show = true;
      pikachu_show_time = new Date().getTime()
    }
    // showPikachu()
    function processMessage(msg) {
        console.log(msg.payloadString);
        car_msg = msg.payloadString
        if(msg.payloadString == 'up'){
          setTimeout(showPikachu, 2000)
        }
        if(msg.payloadString == 'right' || msg.payloadString == 'left'){

        }
    }
    mqttClient.subscribe('/car', processMessage);

    var video2track;
    var video_width, video_height;
    var ctx, ctxBlended;
    var min_speed, hcolor, vcolor, scolor;
    var lastImageData;
    var defaults = {
        min_speed: 0x45,               // Minimun speed of the object to trigger the onMove function
        tracker_size: 40,              // Size of the tracker
        color_to_track: '#EFD0CF',     // Caucasian skin color by defect
        color_tolerance: [0.2, 0.2, 0.2],  // h,s,v vector color tolerance (range 0-1)
        blended_opacity: 0,
        tracker_opacity: 1,
        zIndex: 2e9,                   // Use a high z-index by default
        video_target_id: 'video2track',// Video css id to track
        interactive: true,             // Allow click over a object to track
        inverted: false,               // Invert the video (usefull using webcam)
    };

    /** The constructor */
    var VideoTracker = function VideoTracker(o) {
        if (!this.start) return new VideoTracker(o);
        this.opts = merge(o || {}, VideoTracker.defaults, defaults);
    };

    VideoTracker.defaults = {};
    merge(VideoTracker.prototype, {
        start: function () {
            this.stop();
            var self = this;
            var o = self.opts;
            video2track = document.getElementById(o.video_target_id);
            video_width = video2track.width;
            video_height = video2track.height;
            var vtCanvas = css(createEl('canvas', {
                'id': 'vtCanvas',
                'width': video_width,
                'height': video_height
            }), {position: 'absolute', zIndex: o.zIndex, opacity: o.tracker_opacity});
            var vtp; // video2track position
            min_speed = o.min_speed;
            color_tolerance = o.color_tolerance;
            tracker_size = o.tracker_size;
            if (video2track) {
                if (o.inverted) {
                    video2track.className += ' inverted';
                    vtCanvas.className += ' inverted';
                    vtCanvasBlended.className += ' inverted';
                }
                video2track.parentNode.insertBefore(vtCanvas, video2track || null);
                vtDimensions = {
                    left: video2track.offsetLeft + 'px',
                    top: video2track.offsetTop + 'px',
                    width: video_width + 'px',
                    height: video_height + 'px'
                };
                css(vtCanvas, vtDimensions);
                css(document.querySelector('#gameover'), vtDimensions);
            }

            ctx = vtCanvas.getContext('2d');
            video2track.loop = true;
            createFrame();
        },
        stop: function () {
        }
    });

    window.VideoTracker = VideoTracker;

})(window, document);

var sendFlag = false;

document.addEventListener("DOMContentLoaded", function () {
    //connect with mqtt


    var videoObj = {'video': true}
    var errBack = function (error) {
        console.log('Video capture error: ', error.code)
    }
    if (navigator.webkitGetUserMedia) { // WebKit-prefixed
        navigator.webkitGetUserMedia(videoObj, callback, errBack)
    } else if (navigator.mozGetUserMedia) { // Firefox-prefixed
        navigator.mozGetUserMedia(videoObj, callback, errBack)
    }

    function callback(stream) {
        var video = document.getElementById('video_car')
        video.src = window.URL.createObjectURL(stream)
        video.play()
    }

    var videotracker = new VideoTracker({video_target_id: 'video_car', inverted: false});
    videotracker.start();

});
