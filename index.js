'use strict'

const shotChart = require('./shotchart')
var express = require('express');

var app = express();
app.use(express.urlencoded());
app.use(express.json());
app.use(express.static(__dirname + '/public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
    console.log('Running on localhost:' + PORT);
});

app.post('/newplayerchart', function(req, res) {
	shotChart.create_chart(req.body.name);

	// hacky way to wait for all cells color to be updated
	setTimeout(function() {
		res.send(200)
	}, 7500);
});
