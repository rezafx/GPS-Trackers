'use strict'
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var SSE = require('express-sse');
var sse = new SSE();
var path = require('path');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

var array = new Array();
array.push( [29.619171,52.539622]
    // ,[29.620887,52.537208],
    // [29.624189,52.531811]
    );
setInterval(broadCastingData, 5000);

app.post('/setLocation', function (req, res) {

    if (typeof req.body != 'undefined') {
        let result;
        console.log('recieved data from device : ', req.body);
        try {

            let lat = req.body.lat;
            let long = req.body.long;
            var arr = [];
            arr.push(lat);
            arr.push(long);
            array.push(arr);

            eventEmitter.emit('newLocation');
        } catch (error) {
            res.send(error);
        }

        res.send(array);

    } else res.send('invalid params !');
});
app.get('/', function (req, res) {
    //   res.send(array);
    res.sendFile(path.join(__dirname + '/landing.html'));
});
app.get('/getHistory', function (req, res) {
    res.send(array);
});
app.get('/reset', function (req, res) {
    var lastIndex = array[array.length - 1];
    array = new Array();
    array.push(lastIndex);
    res.send(true);
});
app.get('/stream', sse.init);
function broadCastingData() {
    sse.send(array[array.length - 1]);
}

eventEmitter.addListener('newLocation', broadCastingData);
app.listen(3000);