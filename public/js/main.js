let chart = document.getElementById('chart');
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
    chart.appendChild(row);
}

function get_display_name(info) {
    if (info.commonPlayerInfo != undefined) {
        return info.commonPlayerInfo[0].displayFirstLast
    }
    return info.teamInfoCommon[0].teamCity + ' ' + info.teamInfoCommon[0].teamName;
}

function set_display_info(data, shots_taken, shots_made) {
    $('#load-msg').hide();

    let display_name = get_display_name(data.display_info);
    let fgpct = 100*(shots_made/shots_taken);

    $('#chart-name').html(display_name);
    $('#chart-name').css('visibility', 'visible');

    $('#headshot').attr('src', data.img_url);
    $('#name').html(display_name);
    $('#fgpct').html(Math.round(fgpct * 10)/10 + '%');

    if (data.display_info.commonPlayerInfo == undefined) {
        let conference = data.display_info.teamInfoCommon[0].teamConference;
        let division = data.display_info.teamInfoCommon[0].teamDivision;

        $('#conference').html(conference);
        $('#division').html(division);

        $('.team-info').css('display', '');
        $('.player-info').css('display', 'none');
    } else {
        let display_info = data.display_info.commonPlayerInfo[0];
        let player_stats = data.display_info.playerHeadlineStats[0];
        let player_city  = display_info.teamCity;
        let player_team = display_info.teamName;
        let position = display_info.position;
        let birthdate = new Date(display_info.birthdate);
        let age = Math.floor(Math.abs(new Date() - birthdate) / 31536000000);
        let pts = player_stats.pts;
        let ast = player_stats.ast;
        let reb = player_stats.reb;
        let pie = 100*player_stats.pie;
        let height = display_info.height;
        let weight = display_info.weight;
        let country = display_info.country;
        let school = display_info.school;
    
        $('#team').html(player_city + ' ' + player_team);
        $('#pts').html(pts);
        $('#reb').html(reb);
        $('#ast').html(ast);
        $('#pie').html(Math.round(pie * 10) / 10);
        $('#height').html(height);
        $('#weight').html(weight);
        $('#country').html(country);
        $('#position').html(position);
        $('#school').html(school);
        $('#age').html(age);
        
        $('.team-info').css('display', 'none');
        $('.player-info').css('display', '');
    }

    $('#player-info-wrapper').css('visibility', 'visible');
}

$('#chart-form').submit(function(ev) {  
    ev.preventDefault();
    $('#loader').show();
    $('#load-msg').html('Creating chart...');
    $('#load-msg').show();

    let search_name = $('#search-name').val()
    let season = $('#season').val();
    let season_type = $('#season-type').val();
    let chart_type = $('#chart-type').val();
    
    $.ajax({ 
        url: '/shotchart',
        type: 'POST',
        cache: false, 
        data: {
            name: search_name,
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
			for (let i = 7*partitions; i <= num_cells - 2*partitions; ++i) {
				shot_data.push(heat_map[i]);
            }

            let total_shots = 0;
            let regions_with_shots = 0;
            let max = shot_data[0].total;
            let min = max;

            for (let i = 0; i < shot_data.length; ++i) {
                let shot = shot_data[i];
                if (shot.total > 1) {
                    total_shots += shot.total;
                    regions_with_shots += 1;
                    if (shot.total < min) {
                        min = shot.total;
                    } else if (shot.total > max) {
                        max = shot.total;
                    }
                }
            }

            let avg_shots_per_region = total_shots/regions_with_shots;

            let shots_taken = 0;
            let shots_made = 0;

            for (let i = 0; i < chart.children.length; ++i) {
                let row = chart.children[i];
                for (let j = 0; j < row.children.length; ++j) {
                    let cell = row.children[j];
                    let shots = shot_data[i*partitions + j + 1];
                    let percent = (shots.total < 2) ? -1 : shots.made / shots.total;
                    let shot_area = shots.area;
                    let league_avg = league_averages[shot_area];

                    shots_taken += shots.total;
                    shots_made += shots.made;

                    if (chart_type == 'absolute') {
                        cell.style.backgroundColor = color_from_absolute(percent);
                    } else if (chart_type == 'frequency') {
                        cell.style.backgroundColor = color_from_frequency(avg_shots_per_region, max, min, shots.total);
                    } else {
                        cell.style.backgroundColor = color_from_relative(percent, league_avg);
                    }

                    if (percent != -1) {
                        let tooltip = document.createElement('span');
                        tooltip.classList.add('tooltiptext');
                        tooltip.innerHTML =  shots.made + '/' + (shots.made + shots.missed) + ', ' + Math.round(percent*100) + '%';
                        if (league_avg != undefined) {
                            tooltip.innerHTML += '<sbr> League Avg: ' + Math.round(100 * league_averages[shot_area].fgPct) + '%';
                        }
                        cell.appendChild(tooltip);
                    }
                }
            }

            set_display_info(data, shots_taken, shots_made);
        },
        error: function(jqXHR, textStatus, err){
            console.error("Error: ", jqXHR.status, jqXHR.responseText, textStatus, err);
            $('#loader').hide();
            $('#load-msg').html(jqXHR.responseText);
        }
    })
});  