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
    function createFrame() {
        ctx.drawImage(video2track, 0, 0, video_width, video_height);
        computeFrame();
        setTimeout(createFrame, 0.5);
    };

    function dist(x1, y1, x2, y2) {
        return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    }

    function hex2rgb(col) {
        var r, g, b;
        if (col.charAt(0) == '#') {
            col = col.substr(1);
        }
        r = col.charAt(0) + col.charAt(1);
        g = col.charAt(2) + col.charAt(3);
        b = col.charAt(4) + col.charAt(5);
        r = parseInt(r, 16);
        g = parseInt(g, 16);
        b = parseInt(b, 16);
        return [r, g, b];
    }

    function rgbToHsv(rgb) {
        r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, v = max;

        var d = max - min;
        s = max == 0 ? 0 : d / max;

        if (max == min) {
            h = 0; // achromatic
        } else {
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }

        return [h, s, v];
    }

    function setColorToTrack(hsv) {
        hcolor = hsv[0];
        scolor = hsv[1];
        vcolor = hsv[2];
    }

    function is_object_color(pos, frame, frameBlended) {
        frameData = frame.data;
        frameBlendedData = frameBlended.data;
        if ((frameBlendedData[pos + 0] + frameBlendedData[pos + 1] + frameBlendedData[pos + 2]) / 3 < 255)
            return false;
        for (i = pos - 4; i <= pos + 4; i += 4) {
            hsv = rgbToHsv([frameData[pos + 0], frameData[pos + 1], frameData[pos + 2]]);
            if (hsv[0] < hcolor - color_tolerance[0] / 2 || hsv[0] > hcolor + color_tolerance[0] / 2 ||
                hsv[1] < scolor - color_tolerance[1] / 2 || hsv[1] > scolor + color_tolerance[1] / 2 ||
                hsv[2] < vcolor - color_tolerance[2] / 2 || hsv[2] > vcolor + color_tolerance[2] / 2)
                return false;
        }
        return true;
    }

    var _points = new Array();
    var _r;

    var pointTime = new Date().getTime();


    //connect with mqtt
    mqttClient.subscribe('', processMessage);


    function computeFrame() {
        var frame = ctx.getImageData(0, 0, video_width, video_height);
        var frameBlended = blend(frame);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        // ctx.clearRect (0, 0, video_width, video_height);
        var object_shape = null;
        var shapes = [];
        var x, y;
        var frame_length = frame.data.length / 4;
        // We dont' need to compute each pixels
        var step = 4;
        var distance = 0;
        for (var i = 0; i < frame_length; i += step) {
            pos = i * 4;
            x = i % frame.width;
            y = Math.round(i / frame.width);
            if (is_object_color(pos, frame, frameBlended)) {
                //console.log("object found!");
                if (!object_shape) {
                    // no shape yet, create the first one
                    object_shape = {};
                    object_shape.x = x;
                    object_shape.y = y;

                    object_shape.currentTime = new Date().getTime();

                    if (Math.abs(x - last_x) > tracker_size || Math.abs(y - last_y) > tracker_size) {
                        // console.log(new Date().getTime() - last_time)
                        if (new Date().getTime() - last_time < 150) {
                            //console.log("distance > tracker_size");
                            return
                        }
                    }

                    shapes.push(object_shape);
                    path.push(object_shape);
                    _points.push(new Point(x, y));

                }
            }
        }
        if (shapes.length == 1) {
            last_x = shapes[0].x;
            last_y = shapes[0].y;
            last_time = new Date().getTime();
            // console.log(shapes[0].x, shapes[0].y);
            var colorTracked = ctx.getImageData(shapes[0].x, shapes[0].y, 1, 1).data;
            // console.log(colorTracked);
            // console.log("color: r="+colorTracked[0]+",g="+colorTracked[1]+",b="+colorTracked[2]);
            var hsv = rgbToHsv(colorTracked);
            // console.log(colorTracked);
            setColorToTrack(hsv);
            ctx.beginPath();
            // ctx.moveTo(path[0].x, path[0].y);
            for (var s = 0; s < path.length; s += 1) {
                // ctx.strokeRect(path[s].x-tracker_size/2,  path[s].y-tracker_size/2, tracker_size, tracker_size);
                ctx.arc(path[s].x, path[s].y, tracker_size / 2, 0, 2 * Math.PI);
                // ctx.lineTo(shapes[s].x, shapes[s].y);
            }
            ctx.closePath();
            ctx.stroke();
            if (shapes.length == 1) {
                onMoveFunc(shapes[0].x, shapes[0].y);
            }
        } else {
            var currentTime = new Date().getTime();
            var clearFlag = true;
            //get the last point time
            var lastPoint = path.pop();
            if (lastPoint && currentTime - lastPoint.currentTime < 300) {
                clearFlag = false;
            }
            if (clearFlag) {
                console.log("clear _points array list");
                _points = [];
                path = [];
            } else {
                if (_points.length > 10) {
                    filterInvalidPoint(_points);
                    if ($("input:checked").val() == "car") {
                        _r = new DollarRecognizer();
                    } else if ($("input:checked").val() == "ppt") {
                        _r = new PPTRecognizer();
                    }
                    var result = _r.Recognize(_points);
                    if (result.Score < 0.5) {
                        return;
                    }
                    if ($("input:checked").val() == "car") {
                        console.info("car controller: " + result.Name);
                        mqttClient.sendCar(result.Name);
                    }else{
                        if (!sendFlag) {
                             if($("input:checked").val() == "ppt") {
                                console.info("PPT controller: " + result.Name);
                                mqttClient.sendPPT(result.Name);
                            }
                            sendFlag = true;
                            setTimeout(function () {
                                sendFlag = false;
                                console.log("reset send flag.");
                            }, 2000);
                        }
                    }
                }
            }
        }
    }

    function filterInvalidPoint(points) {
        for (var i = 0; i < points.length - 1; i++) {
            if (Math.abs(points[i].x - points[i + 1].x) > 50
                || Math.abs(points[i].y - points[i + 1].y) > 50) {
                points.splice(i, 1);
            }
        }
    }

    function processMessage(msg) {
        var response = JSON.parse(msg.payloadString).contentNodes;
        console.log(response);
    }

    var path = [];
    var last_x = 0, last_y = 0, last_time = 0;

    function blend(frame) {
        if (!lastImageData) lastImageData = frame;
        var blendedData = ctx.createImageData(video_width, video_height);
        createBlendedMask(blendedData.data, frame.data, lastImageData.data);
        ctxBlended.putImageData(blendedData, 0, 0);
        var frameBlended = ctxBlended.getImageData(0, 0, video_width, video_height);
        lastImageData = frame;
        return frameBlended;
    }

    function fastAbs(value) {
        return (value ^ (value >> 31)) - (value >> 31);
    }

    function threshold(value) {
        return (value > min_speed) ? 0xFF : 0;
    }

    function createBlendedMask(target, data1, data2) {
        if (data1.length != data2.length) return null;
        var i = 0;
        while (i < (data1.length * 0.25)) {
            var average1 = (data1[4 * i] + data1[4 * i + 1] + data1[4 * i + 2]) / 3;
            var average2 = (data2[4 * i] + data2[4 * i + 1] + data2[4 * i + 2]) / 3;
            var diff = threshold(fastAbs(average1 - average2));
            target[4 * i] = diff;
            target[4 * i + 1] = diff;
            target[4 * i + 2] = diff;
            target[4 * i + 3] = 0xFF;
            ++i;
        }
    }

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
            var vtCanvasBlended = css(createEl('canvas', {
                'id': 'vtCanvasBlended',
                'width': video_width,
                'height': video_height
            }), {position: 'absolute', zIndex: o.zIndex - 1, opacity: o.blended_opacity});
            var vtp; // video2track position
            min_speed = o.min_speed;
            color_tolerance = o.color_tolerance;
            tracker_size = o.tracker_size;
            setColorToTrack(rgbToHsv(hex2rgb(o.color_to_track)));
            if (video2track) {
                if (o.inverted) {
                    video2track.className += ' inverted';
                    vtCanvas.className += ' inverted';
                    vtCanvasBlended.className += ' inverted';
                }
                video2track.parentNode.insertBefore(vtCanvas, video2track || null);
                video2track.parentNode.insertBefore(vtCanvasBlended, video2track || null);
                vtDimensions = {
                    left: video2track.offsetLeft + 'px',
                    top: video2track.offsetTop + 'px',
                    width: video_width + 'px',
                    height: video_height + 'px'
                };
                css(vtCanvas, vtDimensions);
                css(vtCanvasBlended, vtDimensions);
            }

            ctx = vtCanvas.getContext('2d');
            ctxBlended = vtCanvasBlended.getContext('2d');
            if (o.interactive) {
                vtCanvas.addEventListener('click', function (e) {
                    ctx.drawImage(video2track, 0, 0, video_width, video_height);
                    var colorTracked = ctx.getImageData(video_width - e.clientX, e.clientY, 1, 1).data;
                    hsv = rgbToHsv(colorTracked);
                    console.log("color: r=" + colorTracked[0] + ",g=" + colorTracked[1] + ",b=" + colorTracked[2]);
                    console.log("color: H=" + hsv[0] + ",S=" + hsv[1] + ",V=" + hsv[2]);
                    setColorToTrack(hsv);
                }, true);
            }
            video2track.loop = true;
            createFrame();
        },
        stop: function () {
        },
        setOnMoveFunc: function (func) {
            onMoveFunc = func;
        }

    });

    window.VideoTracker = VideoTracker;

})(window, document);

var sendFlag = false;

document.addEventListener("DOMContentLoaded", function () {
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
        var video = document.getElementById('video_id')
        video.src = window.URL.createObjectURL(stream)
        video.play()
    }

    var playid;
    var onMoveFunc = function (x, y) {
        //console.log('Object detected at x=' + x + ', y=' + y);
        if (y > 200) return
        var id = "#b" + Math.floor(x / 80);
        if (id == playid) return
        playid = id
        var play = document.querySelector(id);
        // if(play) play.play()
    };
    var videotracker = new VideoTracker({video_target_id: 'video_id', inverted: true});
    videotracker.setOnMoveFunc(onMoveFunc);
    videotracker.start();

});
