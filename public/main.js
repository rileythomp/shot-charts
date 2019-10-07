$('#loader').hide();

let map = document.getElementById('map');
const partitions = 50;
const num_cells = partitions*partitions;

for (let i = 7; i < partitions-2; ++i) {
    let row = document.createElement('tr');
    for (let j = 0; j < partitions; ++j) {
        let cell = document.createElement('td');
        cell.classList.add('tooltip')
        cell.style.backgroundColor = 'burlywood';
        cell.style.opacity = '0.5';
        row.appendChild(cell);
    }
    map.appendChild(row);
}

String.prototype.capitalize = function(lower) {
    return (lower ? this.toLowerCase() : this).replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

function color_from_absolute(percent) {
    if (percent < 0) {
		return 'rgb(222, 184, 135)'; // burlywood
    }
    else if (percent >= 0.6) {
		return 'rgb(0, 255, 0)';
    }
    else if (percent >= 0.5 && percent <= 0.6) {
		return 'rgb(71, 255, 0)';
    }
    else if (percent >= 0.4 && percent <= 0.5) {
		return 'rgb(159, 255, 86)';
    }
    else if (percent >= 0.3 && percent <= 0.4) {
		return 'rgb(255, 255, 0)';
    }
    else if (percent >= 0.2 && percent <= 0.3) {
		return 'rgb(255, 175, 0)';
    }
    else if (percent >= 0.1 && percent <= 0.2) {
		return 'rgb(255, 87, 0)';
	}
    else if (percent >= 0 && percent <= 0.1) {
		return 'rgb(255, 0, 0)';
    }
}

function color_from_relative(percent, league_avg) {
    if (league_avg == undefined) {
		return 'rgb(222, 184, 135)'; // burlywood
    }
    
    let diff = percent - league_avg.fgPct;

    if (diff >= 0.15) {
		return 'rgb(0, 255, 0)';
    }
    else if (diff >= 0.1) {
		return 'rgb(71, 255, 0)';
    }
    else if (diff >= 0.05) {
		return 'rgb(159, 255, 86)';
    }
    else if (Math.abs(diff) < 0.05) {
		return 'rgb(255, 255, 0)';
    }
    else if (diff >= -0.1) {
		return 'rgb(255, 175, 0)';
    }
    else if (diff >= -0.15) {
		return 'rgb(255, 87, 0)';
	}
    else if (diff >= -0.2) {
		return 'rgb(255, 0, 0)';
    }
}

function color_from_frequency(avg_num_shots, max, min, total_shots) {
    let upper_third_len = Math.floor((max - avg_num_shots)/3);
    let lower_third_len = Math.floor((avg_num_shots - min)/3);
    
    if (total_shots == 0) {
		return 'rgb(222, 184, 135)'; // burlywood
    }
    else if (total_shots >= avg_num_shots + 2*upper_third_len) {
		return 'rgb(0, 255, 0)';
    }
    else if (total_shots >= avg_num_shots + upper_third_len) {
		return 'rgb(71, 255, 0)';
    }
    else if (total_shots >= avg_num_shots) {
		return 'rgb(159, 255, 86)';
    }
    else if (total_shots == Math.floor(avg_num_shots)) {
		return 'rgb(255, 255, 0)';
    }
    else if (total_shots >= avg_num_shots - lower_third_len) {
		return 'rgb(255, 175, 0)';
    }
    else if (total_shots >= avg_num_shots - 2*lower_third_len) {
		return 'rgb(255, 87, 0)';
	}
    else if (total_shots >= avg_num_shots - 3*lower_third_len) {
		return 'rgb(255, 0, 0)';
    }
}

function percent_from_map(shots) {
	if (shots.made + shots.missed < 2) {
		return -1;
	}
	return shots.made / (shots.made + shots.missed);
}

$('#nameform').submit(function(ev) {  
    ev.preventDefault();
    $('#loader').show();
    $('#load-msg').html('Creating chart...');
    $('#load-msg').show();

    let pname = $('#playername').val().capitalize(true);
    let season = $('#season').val();
    let season_type = $('#season-type').val();
    let chart_type = $('#chart-type').val();
    
    $.ajax({ 
        url: '/newshotchart',
        type: 'POST',
        cache: false, 
        data: {
            name: pname,
            season: season,
            season_type: season_type,
            chart_type: chart_type
        }, 
        success: function(data){
            $('#loader').hide();
            $('#load-msg').show();

            let heat_map = data.heat_map;
            let league_averages = data.league_averages;
            let chart_type = data.chart_type;

            let shot_data = [];
	
			for (let i = 7*partitions; i <= num_cells-2*partitions; ++i) {
				shot_data.push(heat_map[i]);
            }

            let shot_sum = 0;
            let regions_with_shots = 0;
            let max = 0;
            let min = 10000;
            // let histogram = {};

            for (let i = 0; i < shot_data.length; ++i) {
                let shot = shot_data[i];
                if (shot.total > 1) {
                    shot_sum += shot.total;
                    regions_with_shots += 1;
                    if (shot.total < min) {
                        min = shot.total;
                    }
                    if (shot.total > max) {
                        max = shot.total;
                    }
                    // if (histogram[shot.total] == undefined) {
                    //     histogram[shot.total] = 1;
                    // }
                    // else {
                    //     histogram[shot.total] += 1;
                    // }
                }
            }

            let avg_num_shots = shot_sum/regions_with_shots;

            console.log(avg_num_shots);
            
            for (let i = 0; i < map.children.length; ++i) {
                let row = map.children[i];
                for (let j = 0; j < row.children.length; ++j) {
                    let cell = row.children[j];
                    let shots = shot_data[i*partitions + j + 1];
                    let percent = percent_from_map(shots);
                    let shot_area = shots.area;
                    let league_avg = league_averages[shot_area];

                    if (chart_type == 'absolute') {
                        cell.style.backgroundColor = color_from_absolute(percent);
                    }
                    else if (chart_type == 'frequency') {
                        cell.style.backgroundColor = color_from_frequency(avg_num_shots, max, min, shots.total);
                    }
                    else if (league_avg != undefined) {
                        cell.style.backgroundColor = color_from_relative(percent, league_avg);
                    }
                    else {
                        cell.style.backgroundColor = 'burlywood';
                    }

                    if (percent != -1) {
                        let tooltip = document.createElement('span');
                        tooltip.classList.add('tooltiptext');
                        tooltip.innerHTML =  shots.made + '/' + (shots.made + shots.missed) + ', ' + Math.round(percent*100) + '%';
                        if (league_avg != undefined) {
                            tooltip.innerHTML += '<br> League Avg: ' + Math.round(100 * league_averages[shot_area].fgPct) + '%';
                        }
                        cell.appendChild(tooltip);
                    }
                }
            }

            $('#load-msg').hide();
            $('#chart-description').html(pname);
        }
        , error: function(jqXHR, textStatus, err){
            console.error("Error: ", jqXHR.status, jqXHR.responseText, textStatus, err);
            $('#loader').hide();
            $('#load-msg').html(jqXHR.responseText);
        }
    })
});  

function save_chart(uri, file_name) {
    let link = $('<a>')
    .attr('href', uri)
    .attr('download', file_name)
    .appendTo("body");

    link.get(0).click();
    link.remove();

    $('#loader').hide();
    $('#load-msg').hide();
};

$('#save-button').on('click', function(e) {
    e.preventDefault();

    let pname = $('#chart-description').text();

    if (pname == '') {
        $('#load-msg').html('No player selected');
        $('#load-msg').show();
        return;
    }

    $('#load-msg').html('Saving chart...');
    $('#load-msg').show();
    $('#loader').show();

    html2canvas($('#map').get(0))
    .then(function(canvas) {
        let img = canvas.toDataURL("image/png")
        let uri = img.replace(/^data:image\/[^;]/, 'data:application/octet-stream');

        save_chart(uri, $('#chart-description').text() + ' shot chart.png');
    });
}); 