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
    console.log('Running on port ' + PORT);
});

app.post('/newplayerchart', function(req, res) {
	let player = nba.findPlayer(req.body.name);

	if (player === undefined) {
		console.log('sending 500');
		res.status(500).send('Player not defined');
		console.log('sending 500');
	}
	else {
		console.log('creating chart');
		shotChart.create_chart(player);
		console.log('done creating chart');

		// hacky way to wait for all cells color to be updated
		setTimeout(function() {
			console.log('sending 200');
			res.sendStatus(200)
			console.log('sent 200');
		}, 7500);
	}

});
