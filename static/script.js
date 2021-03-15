const baseurl = "https://athletics.liamsc.com/api/"

var houses;
var points = {};

function getpoints(placing) {
  switch(placing) {
    case 1: return 5;
    case 2: return 3;
    case 3: return 2;
    default: return 1;
  }
}

function update() {
  console.log("updating");
  houses.forEach((house) => {
    $.get(`${baseurl}points/${house.house_id}`, function(data) {         
      points[house.house_id] = 0;
      if (data.success) {
        data.placing.forEach((el) => {
          points[house.house_id] += Math.max(getpoints(el), 0);
        })
        data.participation.forEach((el) => {
          points[house.house_id] += el.num_students;
        });
      }
      $(`#${house.house_name} h4`).html(points[house.house_id]);
    })
  });

  setTimeout(update, 10000)
}

function updateHouses() {
  $.get(baseurl + 'house', function(data) {
    if (data.success) {
      houses = data.rows;
      update();
    }
  });
}

$(document).ready(function() {
  updateHouses();
});
