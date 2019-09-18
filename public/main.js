let map = document.getElementById('map');
const partitions = 30;

$('#loader').hide();

for (let i = 7; i < partitions-2; ++i) {
    let row = document.createElement('tr');
    for (let j = 0; j < partitions; ++j) {
        let cell = document.createElement('td');
        let img = document.createElement('img');
        let index = i*partitions + j + 1;
        img.src = 'court_bits/' + index + '.png';
        cell.appendChild(img);
        row.appendChild(cell);
    }
    map.appendChild(row);
}

$('#nameform').submit(function(e){  
    e.preventDefault();
    $('#loader').show();
    let pname = $('#playername').val();
    
    $.ajax({ 
        url: '/newplayerchart',
        type: 'POST',
        cache: false, 
        data: {name: pname}, 
        success: function(data){
            localStorage.setItem('player_name', pname);
            $('#loader').hide();
            location = location;
        }
        , error: function(jqXHR, textStatus, err){
            console.error("Error: ", textStatus, err);
        }
    })
});  

$(window).on('load', function() {
    $('#chart-description').html(localStorage.getItem('player_name'));
})