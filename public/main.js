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

function color_from_percent(percent) {
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
    
    $.ajax({ 
        url: '/newshotchart',
        type: 'POST',
        cache: false, 
        data: {
            name: pname,
            season: season,
            season_type: season_type,
        }, 
        success: function(heat_map){
            $('#loader').hide();
            $('#load-msg').show();

            let shot_data = [];
	
			for (let i = 7*partitions; i <= num_cells-2*partitions; ++i) {
				shot_data.push(heat_map[i]);
            }
            
            for (let i = 0; i < map.children.length; ++i) {
                let row = map.children[i];
                for (let j = 0; j < row.children.length; ++j) {
                    let cell = row.children[j];
                    let shots = shot_data[i*partitions + j + 1];
                    let percent = percent_from_map(shots);

                    cell.style.backgroundColor =  color_from_percent(percent)

                    if (percent != -1) {
                        let tooltip = document.createElement('span');
                        tooltip.classList.add('tooltiptext');
                        tooltip.innerHTML =  shots.made + '/' + (shots.made + shots.missed) + ', ' + Math.round(percent*100) + '%';
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