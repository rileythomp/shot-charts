'use strict'

const shotChart = require('./shotchart')
const nba = require('nba');
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
	let player = nba.findPlayer(req.body.name);

	if (player === undefined) {
		res.status(500).send('Player not defined');
	}
	else {
		shotChart.create_chart(player);

		// hacky way to wait for all cells color to be updated
		setTimeout(function() {
			res.sendStatus(200)
		}, 7500);
	}

});
