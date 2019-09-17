let map = document.getElementById('map');
const partitions = 30;


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