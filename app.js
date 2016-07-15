var Helpers = {
    "randomString" : function (length) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }
};

var mqttClient = (function(){
    "use strict";
	var mqtt = new Paho.MQTT.Client('172.28.225.1',61614,Helpers.randomString(21));
	mqtt.onConnectionLost = function(){
		console.log("mqttClient Connection Lost.");
        lightoff(light);
        client.subscribe(_vin,_callback);
	}
    function lighton(light){
        stoplight();
        light.show();
        light.css('background-image','-webkit-gradient(radial,50% 50%, 0, 50% 50%, 8, color-stop(0%, #0F0), color-stop(30%, #0F0), color-stop(100%, rgba(0,255,0,0)))');
        light.attr('title','connected');
    }
    var stoplight = function(){};
    function lightoff(light){
        light.css('background-image','-webkit-gradient(radial,50% 50%, 0, 50% 50%, 8, color-stop(0%, #F00), color-stop(30%, #F00), color-stop(100%, rgba(255,0,0,0)))');
        stoplight = execStep([
            function(){light.hide()},
            function(){light.show()}
        ],200,Infinity);
        light.attr('title','disconnected');
    }
    var light = $('<div style="width:15px;height:15px;position:absolute;top:5px;right:5px;">');
    lightoff(light);
    $('body').append(light);
    
    var subscribeOption = {
        onSuccess:function(){
            console.log("mqttClient subscribe " + _filter + " success." );
        },
        onFailure: function(error){
            console.log("mqttClient subscribe fail. " + _filter);
        },
        qos:1
    };
    
    var _filter, _callback, _vin;
	var client = {
		subscribe: function(vin,cb){
            _callback = cb;
            _vin = vin;
            mqtt.onMessageArrived = cb;
			if(mqtt.isConnected()){
                mqtt.unsubscribe(_filter);
                _filter = '/cvc/status/' + vin;
                mqtt.subscribe(_filter,subscribeOption);                
            }else{
                mqtt.connect({
                    onSuccess:function(){
                        console.log("mqttClient connected.");
                        lighton(light);
                        _filter = '/cvc/status/' + vin;
                        mqtt.subscribe(_filter,subscribeOption);
                    },
                    onFailure: function(error){
                        console.log("mqttClient connect fail. "+ error.errorMessage);
                        setTimeout(function(){
                            client.subscribe(_vin,_callback);    
                        },10000);
                    },
                    keepAliveInterval: 20
                });
            }
		},
        _send:function(topic, msg){
            if(mqtt.isConnected()){
                msg = (typeof msg == 'string')?msg:JSON.stringify(msg);
                var message = new Paho.MQTT.Message(msg);
                message.destinationName = topic;
                message.qos = 1;
                mqtt.send(message);
                console.log("send message: " + msg + ", successfully!");
            }else{
                console.log("Can't send message, mqtt client is disconnected.");
            }
        },
        sendCar:function(msg){
            this._send('/car'+ _vin, msg);
        },
        sendPPT:function(msg){
            this._send('/ppt'+ _vin, msg);
        },
        pong:function(){
            this._send('/cvc/status/'+ _vin, {pong:new Date().getTime()});
        }
	};
    return client;
})();


function execStep(funcList,timeout,times){
    var count = 0;
    times = (times||1)*funcList.length;
    var step = function(){
        if(count >= times)
            return;
        funcList[count % funcList.length]();
        count++;
        setTimeout(step,timeout);
    };
    step();
    return function(){times=0};
}





