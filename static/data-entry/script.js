// CONFIG
const baseurl = "https://athletics.liamsc.com/api/";//"https://athletics.linusmolteno.repl.co/api/";

// GLOBALS
var authstring = false;
var logindisabled = false;
var students;
var studentsObj = {};
var events;
var houses;
var housesObj = {};
var participation = {};
var placings = {};
var prevPlacingsEvent = 0;

// BOOTSTRAP SVGs

const trashcan = `<svg class="bi bi-trash" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path d="M5.5 5.5A.5.5 0 016 6v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm2.5 0a.5.5 0 01.5.5v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm3 .5a.5.5 0 00-1 0v6a.5.5 0 001 0V6z"/>
  <path fill-rule="evenodd" d="M14.5 3a1 1 0 01-1 1H13v9a2 2 0 01-2 2H5a2 2 0 01-2-2V4h-.5a1 1 0 01-1-1V2a1 1 0 011-1H6a1 1 0 011-1h2a1 1 0 011 1h3.5a1 1 0 011 1v1zM4.118 4L4 4.059V13a1 1 0 001 1h6a1 1 0 001-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" clip-rule="evenodd"/>
</svg>`;

const plus = `<svg class="bi bi-plus" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" d="M8 3.5a.5.5 0 01.5.5v4a.5.5 0 01-.5.5H4a.5.5 0 010-1h3.5V4a.5.5 0 01.5-.5z" clip-rule="evenodd"/>
  <path fill-rule="evenodd" d="M7.5 8a.5.5 0 01.5-.5h4a.5.5 0 010 1H8.5V12a.5.5 0 01-1 0V8z" clip-rule="evenodd"/>
</svg>`;

// BOOTSTRAP SPINNER
const spinner = `<div class="spinner-border spinner-border-sm" role="status">
                <span class="sr-only text-center">spinning...</span>
              </div>`;// spinner

// AUTHENTICATION SHORTCUTS

function authenticated_get(url, success) {
  if (authstring !== false) {
    $.ajax({
      url: url,
      headers: {
        "Authorization": authstring,
      },
      success: success
    });
  }
}

function authenticated_delete(url, success) {
  if (authstring !== false) {
    $.ajax({
      type: "DELETE",
      url: url,
      headers: {
        "Authorization": authstring,
      },
      success: success
    });
  }
}

function authenticated_put(url, data, success) {
  if (authstring !== false) {
    $.ajax({
      type: "PUT",
      url: url,
      data: data,
      headers: {
        "Authorization": authstring,
      },
      success: success
    });
  }
}

function authenticated_post(url, data, success) {
  if (authstring !== false) {
    $.ajax({
      type: "POST",
      url: url,
      data: data,
      headers: {
        "Authorization": authstring,
      },
      success: success
    });
  }
}

function login() {
  if (!logindisabled) {
    logindisabled = true;
    var username = $("#username")[0].value;
    var passwd = $("#password")[0].value;

    $("#loginbutton").html(spinner);

    $.post(baseurl + "auth", {
      "username": username,
      "password": passwd,
    }, function(data) {
      if (typeof(data.error) == "string") {
        // username and passwd combination failed
        alert(data.error);
        console.log("bad passwd/username");
        logindisabled = false;
      } else {
        console.log(data);
        // welcome message
        $("#loginForm")[0].innerHTML = "<span class='text-white'>Welcome, " + data.firstName + " " + data.lastName + "</span>";
        authstring = "Basic " + btoa(username + ":" + passwd);
        $("#loginModal").modal('hide');
        populate();
      }
    }).fail(function() {
      alert("Authorization failed.");
    });

    $("#loginbutton").html("Login");
  }
}

$(document).ready(function() {
  // ready all the triggers for tab buttons
  var triggerTabList = [].slice.call(document.querySelectorAll('#tabulation button'))
  triggerTabList.forEach(function (triggerEl) {
    var tabTrigger = new bootstrap.Tab(triggerEl)

    triggerEl.addEventListener('click', function (event) {
      event.preventDefault()
      tabTrigger.show()
      if (event.target.id == "participation-tab") {
        $("#participation").addClass("show active");
        $("#placings").removeClass("show active");
      } else if (event.target.id == "placings-tab") {
        $("#placings").addClass("show active");
        $("#participation").removeClass("show active");
      }
    })
  })
});

// populate panels once logged in
function populate() {
  console.log("getting all events and students");

  authenticated_get(baseurl + "house", function(data) {
    if (data.success) {
      houses = data.rows;
      houses.forEach(function(el) {
        housesObj[el.house_id] = el.house_name;
      });
      console.log(houses);
      authenticated_get(baseurl + "event", function(data) {
        if (data.success) {
          events = data.rows;
          // for all events, get relevant participation info
          var allevents = true;
          events.forEach(function(el, idx) {
            authenticated_get(baseurl + "participation/" + el.event_id, function(data) {
              if (data.success) {
                participation[el.event_id] = data.rows;
                if (idx == events.length - 1 && allevents) {
                  console.log("Finished getting participation data!")
                  updateParticipation();
                }
              } else {
                console.log(data);
                alert("Error getting pariticipation data")
                allevents = false;
              }
            });
          });
          if (!allevents) {
            return;
          }
          prevPlacingsEvent = events[0].event_id;
          authenticated_get(baseurl + "student", function(data) {
            if (data.success) {
              students = data.rows;
              students.forEach(function(el) {
                studentsObj[el.student_id] = el;
              });
              // for all events, get relevant participation info
              var allevents = true;
              events.forEach(function(el, idx) {
                authenticated_get(baseurl + "placing/" + el.event_id, function(data) {
                  if (data.success) {
                    placings[el.event_id] = data.rows;
                    if (idx == events.length - 1 && allevents) {
                      console.log("Finished getting placings data!");
                      updatePlacings();
                    }
                  } else {
                    console.log(data);
                    alert("Error getting placings data")
                    allevents = false;
                  }
                });
              });
              if (!allevents) {
                return;
              }
            } else {
              alert("Error getting students");
            }
          });
        } else {
          alert("Error getting events");
        }
      });
    } else {
      alert("Error getting houses");
    }
  });
}

function getEventDropdown(n) {
  var newhtml = `<select class="selectpicker" id="events-picker` + n + `" data-live-search="true">`;
  events.forEach(function(element) {
    newhtml += "<option>" + element.event_name + "</option>"
  });
  newhtml += "</select>"
  return newhtml
}

function getStudentDropdown() {
  var newhtml = `<select class="selectpicker" id="students-picker" data-live-search="true">`;
  students.forEach(function(element) {
    newhtml += "<option>" + element.student_name + "</option>"
  });
  newhtml += "</select>"
  return newhtml
}

function getBootstrapForm(labels, content, submit) {
  var newhtml = `<div class="container-fluid">`;

  for (var i=0; i<labels.length; i++) {
    newhtml += `<div class="row align-items-center"><div class="col-2">
        <label class="col-form-label float-right">` + labels[i] + `</label>
      </div>
      <div class="col-md">
        ` + content[i] + `
      </div></div><hr />`;
  }

  newhtml += submit + '</div>';
  return newhtml;
}

function getHouseDropdown() {
  var newhtml = `<select class="selectpicker" id="house-picker" data-live-search="true">`;
  houses.forEach(function(element) {
    newhtml += "<option>" + element.house_name + "</option>"
  });
  newhtml += "</select>"
  return newhtml
}

function comparePlacings(a, b) {
  if ( a.placing < b.placing ){
    return -1;
  }
  if ( a.placing > b.placing ){
    return 1;
  }
  return 0;
}

function getPlacingRows(event_id) {
  var event_placings = placings[event_id];
  event_placings.sort(comparePlacings);
  var newhtml = "";
  var maxplacing = 0;
  event_placings.forEach(function(el) {
    maxplacing = Math.max(maxplacing, el.placing);
    newhtml += `<tr>
    <td>${el.placing}</td>
    <td>${studentsObj[el.student_id].student_name}</td>
    <td>${housesObj[el.house_id]}</td>
    <td>${((el.value == null) ? "<span class='text-muted'>N/A</span>" : el.value)}</td>
    <td><button class="btn btn-danger" onClick="delPlacing(${event_id}, ${el.placing}, this)">-</button></td>
    </tr>`;
  });
  newhtml += `<tr>
    <td class="align-middle"><input id="placing-placing" type="number" min="0" value="` + (maxplacing+1).toString() + `"></td>
    <td>` + getStudentDropdown() + `</td>
    <td><span id="newplacinghouse">${housesObj[students[0].house_id]}</span></td>
    <td class="align-middle"><input id="placing-value" type="number"></td>
    <td><button class="btn btn-primary" onClick="addPlacing(` + event_id + `)">+</button></td>
  </tr>`;
  return newhtml;
}

function delPlacing(event_id, placing, button) {
  button.innerHTML = spinner;
  authenticated_delete(`${baseurl}placing/${event_id}/${placing}`, function(success) {
    if (!success.success) {
      alert("Error deleting thingy");
    } else {
      updateLocalPlacings();
    }
  });
}

function addPlacing(event_id) {
  $("#placingbutton").html(spinner);
  let cur_placing = parseInt($("#placing-placing").val());
  let searched_student = students.find(o => o.student_name === $("#students-picker").val());
  let searched_house = searched_student.house_id;//houses.find(o => o.house_name === $("#house-picker").val());
  let value = $("#placing-value").val();
  var data = {
    event_id: event_id,
    house_id: searched_house,
    student_id: searched_student.student_id,
    placing: cur_placing,
  };
  if (value !== "") {
    data["value"] = value;
  }
  authenticated_post(baseurl + "placing", data, function(data) {
    if (data.success) {
      console.log("Success!");
      updateLocalPlacings();
    } else {
      console.log(data);
      alert("Error sending away placing, maybe reload and try again?")
    }
  });
}

function updatePlacings() {
  var newhtml = `
  <div class="container-fluid">
    <div class="row pb-1 align-items-center">
      <div class="col-2">
        <h4>
          Event:
        </h4>
      </div>
      <div class="col-md">
    ` + getEventDropdown("2") + `
      </div>
    </div>
    <div class="row">
      <table class="table table-striped">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Student</th>
            <th scope="col">House</th>
            <th scope="col">Value <small class="text-muted">(optional)</small></th>
            <th scope="col">+/-</th>
          </tr>
        </thead>
        <tbody>
          ` + getPlacingRows(prevPlacingsEvent) + `
        </tbody>
      </table>
    </div>
  </div>`;
  $("#placings")[0].innerHTML = newhtml;
  $("#events-picker2").selectpicker();
  $("#students-picker").selectpicker();
  // $("#house-picker").selectpicker();

  // you still need to add the onchange for the event, and student dropdown.
  $("#students-picker").on('change', function() {
    let searched_student = students.find(o => o.student_name === $("#students-picker").val());
    $("#newplacinghouse").html(housesObj[searched_student.house_id]);
  });

  $("#events-picker2").on('change', function() {
    let searchedEvent = events.find(o => o.event_name === $("#events-picker2").val());
    $("tbody")[0].innerHTML = getPlacingRows(searchedEvent.event_id);
    prevPlacingsEvent = searchedEvent.event_id;
    $("#students-picker").selectpicker();
    $("#students-picker").on('change', function() {
      let searched_student = students.find(o => o.student_name === $("#students-picker").val());
      $("#newplacinghouse").html(housesObj[searched_student.house_id]);
    });
  });

}

function updateParticipation() {
  console.log("updating participation");
  var labels = ["<h4>Event:</h4>"];
  var content = [getEventDropdown("1")];
  var submit = `<button type="submit" id="participationSubmit" class="btn btn-primary" onClick="sendParticipation();">Submit</button>`;
  houses.forEach(function(el) {
    labels.push(el.house_name);
    content.push(`<input type="number" min="0" id="` + el.house_name + `" class="form-control">`)
  });
  var newhtml = getBootstrapForm(labels, content, submit);//'<div class="container-fluid"><div class="row"><div class="col-sm-3"><h4>Event:</h4></div><div class="col-sm">' + getEventDropdown() + '</div></div><hr /><div class="row"><div class="col">THIS IS WHERE THE DIFFERENT HOUSES WILL GO</div></div></div>';
  $("#participation")[0].innerHTML = newhtml;
  $("#events-picker1").selectpicker();

  $('#events-picker1').on('change', fillParticipation);

  fillParticipation();
}

function fillParticipation() {
  houses.forEach(function(el) {
    $("#" + el.house_name).val(0);
  });
  $("#participationSubmit")[0].onclick = sendParticipation;
  $("#participationSubmit")[0].innerHTML = "Submit";
  let searchedEvent = events.find(o => o.event_name === $("#events-picker1").val());
  // check if event already has participation data
  event_particip = participation[searchedEvent.event_id]
  if (event_particip.length > 0) {
    if (event_particip.length == houses.length) {
      // there must be participation data
      // this is good, fill it in
      event_particip.forEach(function(el) {
        if (el.num_students == null) {
          deleteParticipation(searchedEvent.event_id);
          updateLocalParticipation();
        }
        var housename = housesObj[el.house_id];
        $("#" + housename).val(el.num_students);
      });
      $("#participationSubmit")[0].onclick = putParticipation;
      $("#participationSubmit")[0].innerHTML = "Update";
    } else {
      deleteParticipation(searchedEvent.event_id);
      updateLocalParticipation();
    }
  } else {
    console.log("No participation data found, setting all to 0")
    event_particip.forEach(function(el) {
      var housename = housesObj[el.house_id];
      $("#" + housename).val(0);
    });
  }
}

function deleteParticipation(event_id) {
  console.log("Encountered error in participation data, deleting it for event " + event_id);
  authenticated_delete(baseurl + "participation/" + event_id, function(data) {
    if (!data.success) {
      console.log("Error deleting participation data!");
      alert("Error correcting errors in participation data");
    }
  });
}

function putParticipation() {
  $("#participationSubmit")[0].innerHTML = spinner;
  var selectedEvent = $("#events-picker1").val();
  let searchedEvent = events.find(o => o.event_name === selectedEvent);
  var dataToSend = [];
  houses.forEach(function(el) {
    var num_students = parseInt($("#" + el.house_name).val());
    if (num_students == "NaN") {
      alert("You have entered a word where there should be a number!");
      $("#participationSubmit").innerHTML = "Submit";
      return;
    }
    var dat = {house_id: el.house_id,
               event_id: searchedEvent.event_id,
               num_students: num_students};
    dataToSend.push(dat);
  });
  console.log(dataToSend);
  dataToSend.forEach(function(el) {
    authenticated_put(baseurl + "participation", el, function(data) {
      $("#participationSubmit")[0].innerHTML = "Update";
      if (!data.success) {
        alert("Error while sending data for house " + el.house_id);
        console.log(data);
        return;
      }
    })
  });
  console.log("Success!");
  updateLocalParticipation();
}

function sendParticipation() {
  $("#participationSubmit")[0].innerHTML = spinner;
  var selectedEvent = $("#events-picker1").val();
  let searchedEvent = events.find(o => o.event_name === selectedEvent);
  // addresses issue #1
  event_particip = participation[searchedEvent.event_id]
  if (event_particip.length > 0) {
    alert("there is already data present for this event - i'm going to reload which should fix the problem");
    location.reload()
  }
  var dataToSend = [];
  houses.forEach(function(el) {
    var num_students = parseInt($("#" + el.house_name).val());
    if (num_students == "NaN") {
      alert("You have entered a word where there should be a number!");
      $("#participationSubmit").innerHTML = "Submit";
      return;
    }
    var dat = {house_id: el.house_id,
               event_id: searchedEvent.event_id,
               num_students: num_students};
    dataToSend.push(dat);
  });
  dataToSend.forEach(function(el) {
    authenticated_post(baseurl + "participation", el, function(data) {
        $("#participationSubmit")[0].innerHTML = "Submit";
      if (!data.success) {
        alert("Error while sending data for house " + el.house_id);
        console.log(data);
        return;
      }
    })
  });
  console.log("Success!");
  updateLocalParticipation();
}

function updateLocalParticipation() {
  events.forEach(function(el) {
    authenticated_get(baseurl + "participation/" + el.event_id, function(data) {
      if (data.success) {
        participation[el.event_id] = data.rows;
	fillParticipation();
      } else {
        alert("Error getting pariticipation data!")
      }
    })
  });
}

function updateLocalPlacings() {
  events.forEach(function(el, idx) {
    authenticated_get(baseurl + "placing/" + el.event_id, function(data) {
      if (data.success) {
        placings[el.event_id] = data.rows;
        updatePlacings();
      } else {
        console.log(data);
        alert("Error getting placings data")
      }
    });
  });
}
