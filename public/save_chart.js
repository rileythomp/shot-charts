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