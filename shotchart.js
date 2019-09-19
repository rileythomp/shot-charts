'use strict'

const nba = require('nba');
const replaceColor = require('replace-color');
const fs = require('fs')

let color_from_percent = function(percent) {
    if (percent > 0 && percent <= 0.1) {
		return [255, 0, 0];
	}
	else if (percent >= 0.1 && percent <= 0.2) {
		return [255, 87, 0];
	}
	else if (percent >= 0.2 && percent <= 0.3) {
		return [255, 175, 0];
	}
	else if (percent >= 0.3 && percent <= 0.4) {
		return [255, 255, 0];
	}
	else if (percent >= 0.4 && percent <= 0.5) {
		return [159, 255, 86];
	}
	else if (percent >= 0.5 && percent <= 0.6) {
		return [71, 255, 0];
	}
	else if (percent >= 0.6) {
		return [0, 255, 0];
	}
	else {
		return [222, 184, 135]; // burlywood
		// return [150, 111, 51];
	}
}

let replace_color = function(image, replace) {
	replaceColor({
		image: './public/court_bits/' + image + '.png',
		colors: {
			type: 'rgb',
			targetColor: [255, 255, 255],
			replaceColor: replace
		},
		deltaE: 10
	})
	.then((jimpObject) => {
		jimpObject.write('./public/court_bits/' + image + '.png', (err) => {
			if (err) { 
				console.error(err);
				return; 
			}
		})
	})
	.catch((err) => {
		console.error(err);
	})
}

let remove_current_chart = function(num_cells) {
	for (let i = 1; i <= num_cells; ++i) {
		let path = './public/court_bits/' + i + '.png';

		fs.unlink(path, (err) => {
			if (err) {
				console.error(err);
				return;
			}
		})
	}
}

let add_empty_chart = function(num_cells) {
	for (let i = 1; i <= num_cells; ++i) {
		let source = './court_bits/' + i + '.png';
		let destination = './public/court_bits/' + i + '.png';

		fs.copyFile(source, destination, (err) => {
			if (err) {
				console.error(err);
				return;
			}
		})
	}
}

exports.create_chart = function(name) {
	const court_length = 500;
	const partitions = 30;
	const partition_length = court_length/partitions;
	const num_cells = partitions*partitions;
	const topY = 450;
	const leftX = -250;
	const bottomY = -50;
	const rightX = 250;

	const player = nba.findPlayer(name);
	let params = {
		PlayerID: player.playerId
	}
	let heatMap = {};
	for (let i = 1; i <= num_cells; ++i) {
		heatMap[i] = {made: 0, missed: 0};
	}

	nba.stats.shots(params).then((res) => {
		let shots = res.shot_Chart_Detail;
		let num_shots = shots.length;
	
		for (let i = 0; i < num_shots; ++i) {
			let shot = shots[i];
			let yLoc = shot.locY;
			let xLoc = shot.locX;
	
			if (yLoc > topY) {
				yLoc = topY;
			}
			else if (yLoc < bottomY) {
				yLoc = bottomY;
			}
	
			if (xLoc > rightX) {
				xLoc = rightX;
			}
			else if (xLoc < leftX) {
				xLoc = leftX;
			}
	
			// 0 is far right, 9 is far left
			let col = Math.floor(Math.abs((leftX - xLoc)/partition_length));
	
			// 0 is top, 9 is bottom
			let row = Math.floor(Math.abs((topY - yLoc)/partition_length));
	
			let region = row * partitions + col + 1;

			if (shot.shotMadeFlag == 1) {
				heatMap[region].made += 1;
			}
			else {
				heatMap[region].missed += 1;
			}
		}

		remove_current_chart(num_cells);

		add_empty_chart(num_cells);

		for (let i = 1; i <= num_cells; ++i) {
			let percent = heatMap[i].made / (heatMap[i].made + heatMap[i].missed);
			replace_color(i, color_from_percent(percent));
		}
	});
}
