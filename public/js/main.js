document.getElementsByTagName('html')[0].style.visibility = 'hidden';

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

function get_display_name(info, get_first) {
    if (info.commonPlayerInfo != undefined) {
        if (get_first) {
            return info.commonPlayerInfo[0].firstName;
        }
        return info.commonPlayerInfo[0].lastName;
    }
    return info.teamInfoCommon[0].teamCity + ' ' + info.teamInfoCommon[0].teamName;
}

function get_nba_url(info) {
    let base_url = 'https://www.nba.com/';
    if (info.commonPlayerInfo != undefined) {
        base_url += 'players/';
        return base_url + info.commonPlayerInfo[0].firstName.toLowerCase() + '/' + info.commonPlayerInfo[0].lastName.toLowerCase() + '/' + info.commonPlayerInfo[0].personId;
    } else {
        base_url += 'teams/';
        return base_url + info.teamInfoCommon[0].teamCode;
    }
}

function get_background_logo_url(abbr) {
    return 'https://www.nba.com/assets/logos/teams/primary/web/' + abbr + '.svg';
}

function set_display_info(data, fgpct) {
    $('#load-msg').hide();

    let first_name = get_display_name(data.display_info, true);
    let last_name = get_display_name(data.display_info, false);
    let nba_url = get_nba_url(data.display_info);

    $('#headshot').attr('src', data.img_url);
    $('#nba-link').attr('href', nba_url);

    $('#fgpct').html(Math.round(fgpct * 10)/10 + '%');

    if (data.display_info.commonPlayerInfo == undefined) {
        let conference = data.display_info.teamInfoCommon[0].teamConference;
        let division = data.display_info.teamInfoCommon[0].teamDivision;
        let background_logo = get_background_logo_url(data.display_info.teamInfoCommon[0].teamAbbreviation);
        let team_color = team_colors[data.display_info.teamInfoCommon[0].teamAbbreviation];


        $('#player-banner').css('background-image', 'linear-gradient(to bottom, rgb(' + team_color + ') 0%, rgb('+ team_color + ', 0.5) 50%, transparent 100%), url(' + background_logo + ')');
        $('#player-banner').css('background-color', 'rgb(' + team_color + ')');

        $('#banner-first').html('');
        $('#banner-position').html('');
        $('#jersey-num').html('');
        $('#banner-bar').html('');
        $('#banner-last').html(first_name);
        $('#conference').html(conference);
        $('#division').html(division);

        $('.team-info').css('display', '');
        $('.player-info').css('display', 'none');
    } else {
        let display_info = data.display_info.commonPlayerInfo[0];
        let player_stats = data.display_info.playerHeadlineStats[0];
        let player_city  = display_info.teamCity;
        let player_team = display_info.teamName;
        let positions = display_info.position.split('-');
        let position;
        if (positions.length == 1) {
            position = positions[0][0];
        }
        else {
            position = positions[0][0] + '-' + positions[1][0];
        }
        let pts = player_stats.pts;
        let ast = player_stats.ast;
        let reb = player_stats.reb;
        let pie = 100*player_stats.pie;
        let jersey_num = display_info.jersey;
        let background_logo = get_background_logo_url(display_info.teamAbbreviation);
        let team_color = team_colors[display_info.teamAbbreviation];
    
        $('#banner-first').html(first_name);
        $('#banner-bar').html('|');
        $('#banner-last').html(last_name);
        $('#team').html(player_city + ' ' + player_team);
        $('#pts').html(pts);
        $('#reb').html(reb);
        $('#ast').html(ast);
        $('#pie').html(Math.round(pie * 10) / 10 + '%');
        $('#banner-position').html(position);
        $('#jersey-num').html(jersey_num);
        $('#player-banner').css('background-image', 'linear-gradient(to bottom, rgb(' + team_color + ') 0%, rgb('+ team_color + ', 0.5) 50%, transparent 100%), url(' + background_logo + ')');
        $('#player-banner').css('background-color', 'rgb(' + team_color + ')');

        $('.team-info').css('display', 'none');
        $('.player-info').css('display', '');
    }

    $('#player-info-wrapper').css('visibility', 'visible');
}

function create_shot_list_from_map(heat_map) {
    let shot_data = [];
    for (let i = 7*partitions; i <= num_cells - 2*partitions; ++i) {
        shot_data.push(heat_map[i]);
    }
    return shot_data;
}

function add_tooltip(percent, shots, cell, league_avg) {
    if (percent != -1) {
        let tooltip = document.createElement('span');
        tooltip.classList.add('tooltiptext');
        tooltip.innerHTML =  shots.made + '/' + (shots.made + shots.missed) + ', ' + Math.round(percent*100) + '%';
        if (league_avg != undefined) {
            tooltip.innerHTML += '<br> League Avg: ' + Math.round(100 * league_avg.fgPct) + '%';
        }
        cell.appendChild(tooltip);
    }
}

function get_shot_chart(search_name, season, season_type, chart_type) {
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
            $('.tooltiptext').remove();

            let heat_map = data.heat_map;
            let league_averages = data.league_averages;
            let chart_type = data.chart_type;

            let shot_data = create_shot_list_from_map(heat_map);

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
                    let league_avg = league_averages[shots.area];

                    shots_taken += shots.total;
                    shots_made += shots.made;

                    cell.style.backgroundColor = set_cell_color(chart_type, percent, avg_shots_per_region, max, min, shots.total, league_avg);

                    add_tooltip(percent, shots, cell, league_avg);
                }
            }

            set_display_info(data, 100*shots_made/shots_taken);
        },
        error: function(jqXHR, textStatus, err){
            console.error("Error: ", jqXHR.status, jqXHR.responseText, textStatus, err);
            $('#loader').hide();
            $('#load-msg').html(jqXHR.responseText);
        }
    })
}

$(document).on('keypress', (ev) => {
    if (ev.which == 13) {
        ev.preventDefault();

        $('#loader').show();
        $('#load-msg').html('Creating chart...');
        $('#load-msg').show();
    
        let search_name = $('#search-name').val()
        let season = $('#season').val();
        let season_type = $('#season-type').val();
        let chart_type = $('#chart-type').val();
        
        get_shot_chart(search_name, season, season_type, chart_type);
    }
})

$(window).on('load', () => {
    get_shot_chart('durant', '2018-19', 'Regular Season', 'absolute');
    document.getElementsByTagName('html')[0].style.visibility = 'visible';
})