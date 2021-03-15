const baseurl = "https://athletics.liamsc.com/api/"

var houses;
var points = {};

function update() {
  console.log("updating");
  houses.forEach((house) => {
    $.get(`${baseurl}points/${house.house_id}`, function(data) {         points[house.house_id] = 0;
      if (data.success) {
        data.placing.forEach((el) => {
          points[house.house_id] += Math.max(4 - el.placing, 0);
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