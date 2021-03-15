// CONFIG
const baseurl = "https://athletics.liamsc.com/api/";//"https://athletics.linusmolteno.repl.co/api/";
const students_per_page = 50;

// GLOBALS
var students;
var houses;
var numpages;
var authstring = false;
var currentpage = 0;
var logindisabled = false;

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

function populate() { // populates all the dropdowns.
  var events_content = $("#events_content .card-body")[0];
  var houses_content = $("#houses_content .card-body")[0];
  var students_content = $("#student-content")[0];
  $("#events_content").collapse('hide');
  $("#houses_content").collapse('hide');
  $("#students_content").collapse('hide');

  events_content.innerHTML = "Loading...";
  houses_content.innerHTML = "Loading...";
  students_content.innerHTML = "Loading...";

  updateEvents();
  updateHouses();
  updateStudents();
  // add upload CSV button
  $("#students_heading .row")[0].innerHTML += `<div class="text-right col">
  	<button type="button" class="btn btn-primary" onClick="fileClick()" data-toggle="tooltip" data-placement="top" title="Warning: may slow down browser">Upload CSV</button>
</div>`;

  $(function () {
    $('[data-toggle="tooltip"]').tooltip()
  });
}

// EVENTS

function updateEvents() {
  // load in all the events in a list, with a delete button for each
  // plus button at the top.
  var newhtml = `<ul class='list-group'>
  <li class='list-group-item'>
  <div class="input-group mb-3">
    <input type="text" class="form-control" id="name_newevent" placeholder="New Event" aria-label="New Event" aria-describedby="submit_newevent">
    <div class="input-group-append">
      <button class="btn btn-secondary" type="button" id="submit_newevent" onClick="addEvent()">` + plus + `</button>
    </div>
  </div>
  </li>`;

  authenticated_get(baseurl + "event", function(data) {
    if (data.success) {
      data.rows.forEach(function (row) {
        newhtml += "<li class='list-group-item d-flex justify-content-between align-items-center'><div class='container-fluid'><div class='row'><div class='col-sm'>" + row.event_name + "</div><div class='col-sm-auto'><button type='button' class='btn btn-danger float-sm-right text-center' onClick='deleteEvent(" + row.event_id + ", this)'>" + trashcan + "</button></div></div></div></li>";
      });
      newhtml += "</ul>";
      $("#events_content .card-body")[0].innerHTML = newhtml;

        // enter key handling
        $("#name_newevent")[0].onkeydown = function(e){
          if(e.keyCode == 13){
            // submit
            addEvent();
            console.log("adding event");
          }
        };

    }
  });
}

function deleteEvent(event_id, e) {
  e.innerHTML = spinner;
  authenticated_delete(baseurl + "event/" + event_id, function(data) {
    console.log("deleted");
    updateEvents();
  });
}

function addEvent() {
  $("#submit_newevent")[0].innerHTML = spinner;
  var new_name = HtmlSanitizer.SanitizeHtml($('#name_newevent')[0].value);
  if (new_name != "") {
    authenticated_post(baseurl + "event", {name: new_name}, function (data) {
      if (data.success) {
        console.log("added");
        updateEvents();
      }
    });
  } else {
    alert("Invalid event name.");

  }
  $('#name_newevent')[0].value = "";
}

// HOUSES


function updateHouses() {
  // load in all the houses in a list, with a delete button for each
  // plus button at the top.
  console.log("Updating houses...")
  var newhtml = `<ul class='list-group'>
  <li class='list-group-item'>
  <div class="input-group mb-3">
    <input type="text" class="form-control" id="name_newhouse" placeholder="New House" aria-label="New House" aria-describedby="submit_newhouse">
    <div class="input-group-append">
      <button class="btn btn-secondary" type="submit" id="submit_newhouse" onClick="addHouse()">` + plus + `</button>
    </div>
  </div>
  </li>`;

  authenticated_get(baseurl + "house", function(data) {
    if (data.success) {
      houses = {};
      data.rows.forEach(function (row) {
        houses[row.house_id] = row.house_name;
        newhtml += "<li class='list-group-item d-flex justify-content-between align-items-center'><div class='container-fluid'><div class='row'><div class='col-sm'>" + row.house_name + "</div><div class='col-sm-auto'><button type='button' class='btn btn-danger float-sm-right text-center' onClick='deleteHouse(" + row.house_id + ", this)'>" + trashcan + "</button></div></div></div></li>";
      });
      newhtml += "</ul>";
      $("#houses_content .card-body")[0].innerHTML = newhtml;

      // enter key handling
      $("#name_newhouse")[0].onkeydown = function(e){
        if(e.keyCode == 13){
          // submit
          addHouse();
          console.log("adding house");
        }
      };
    }
  });
}

function deleteHouse(house_id, e) {
  e.innerHTML = spinner;
  authenticated_delete(baseurl + "house/" + house_id, function(data) {
    console.log("deleted");
    updateHouses();
  });
}

function addHouse() {
  $("#submit_newhouse")[0].innerHTML = spinner;
  var new_name = HtmlSanitizer.SanitizeHtml($('#name_newhouse')[0].value);
  if (new_name != "") {
    authenticated_post(baseurl + "house", {name: new_name}, function (data) {
      if (data.success) {
        console.log("added");
        $('#name_newhouse')[0].value = "";
        updateHouses();
      }
    });
  } else {
    alert("Invalid house name");
  }
}

// STUDENTS

function updateStudents() {
  // load in all the students in a paged list, with a delete button for each
  // all-delete button at the top
  // create pagination for all students
  var newpage = `<nav aria-label="Student navigation">
  <ul class="pagination justify-content-center mt-3">`;


  authenticated_get(baseurl + "student", function(data) {
    if (data.success) {
      console.log(data);
      students = data.rows;

      // calculate number of pages
      num_pages = Math.ceil(students.length / students_per_page);

      for (var p = 0; p < num_pages; p++) {
        newpage += '<li class="page-item student-pager"><a class="page-link" onClick="studentPage(' + p + ')">' + (p+1) + '</li>';
      }

      newpage += "</ul></nav>";
      $("#student-content")[0].innerHTML = htmlforpage(0);
      $("#student-pagination")[0].innerHTML = newpage;

      $(".student-pager").eq(0).addClass("active");
    }
  });
  var uploadModal = $('#uploadModal');

  uploadModal.modal('hide');

}

function htmlforpage(page) {
  var newcontent = `<ul class='list-group'>
  <li class="list-group-item">
  <button type='button' class='btn btn-danger btn-block' id="deleteAllStudents" onClick='deleteAllStudents()'>` + trashcan + "</button></li>";

  for (var i = page * students_per_page; i < Math.min(students_per_page * (page+1), students.length); i++) {
    var student = students[i];

    var housestr = houses[student.house_id]
    // check if we know the name of the house they're in, not just their ID
    if (typeof(housestr) == "undefined") {
      housestr = "Unknown (" + student.house_id + ")"
    }
    newcontent += "<li class='list-group-item'><div class='container-fluid'><div class='row'><div class='col-sm-3 text-center text-sm-left'>" + student.student_name + "</div><div class='col-sm-3 text-center text-sm-left'>" + student.student_id + "</div><div class='col-sm text-center text-sm-left'>" + housestr + "</div><div class='col-sm text-center text-sm-right'><button type='button' class='btn btn-secondary' onClick='deleteStudent(" + student.student_id + ")'>" + trashcan + "</button></div></div></div></li>";         
  }

  if (students.length == 0) {
    newcontent += `<li class="list-group-item">
<span class='text-center'>There's nothing here!</span></li>`;
  }
  newcontent += "</ul>";

  return newcontent;
}

function studentPage(page) { // activated when selecting a new page - redo the list of students.

  // set all page items to be inactive
  $(".student-pager").removeClass("active");
  $(".student-pager").eq(page).addClass("active");
  
  currentpage = page;

  $("#student-content")[0].innerHTML = htmlforpage(page);
}

function deleteStudent(student_id) {
  authenticated_delete(baseurl + "student/" + student_id, function(data) {
    console.log("deleted");
    updateStudents();
    studentPage(currentpage);
  });
}

function deleteAllStudents() {
  // confirm whether you want to delete all students
  $("#deleteModal").modal("show");
}

function actuallyDeleteAllStudents() { // send the request after confirmation
  $("#deleteAllStudents")[0].innerHTML = spinner;
  authenticated_delete(baseurl + "student", function(data) {
    console.log("deleted all students");
    updateStudents();
  });
}

function fileClick() {
  $("#fileIn")[0].click();
}

function parseCSV(evt) {
  // Retrieve the first (and only!) File from the FileList object
  console.log(evt);
  var f = evt.target.files[0]; 
  if (f){
    // loading.. modal
    var uploadModal = $('#uploadModal');
    uploadModal.modal('show');

    var r = new FileReader();
    
    // file reading finished successfully
    r.addEventListener('load', function(e) {
      // contents of file in variable     
        var text = e.target.result;

        lines = CSVToArray(text, ",");
      

        // format: "student_name", student_id, house_id
        lines.forEach((val, idx) => {
          // the last line is always empty, check if the val = "";
          if (val.length > 1) { 
            var student_name = HtmlSanitizer.SanitizeHtml(val[0]);
            var student_id = parseInt(HtmlSanitizer.SanitizeHtml(val[1]));
            var house_id = parseInt(HtmlSanitizer.SanitizeHtml(val[2]));

            authenticated_post(baseurl + "student", {
              name: student_name,
              student_id: student_id,
              house_id: house_id
            }, (result) => {
              if (!result.success) {
                if (typeof(error) == "string") {
                  alert(result.error + " \nerror on\n " + student_name);
                } else {
                  alert(result.error.code + " \nerror on\n " + student_name);
                }
                
              }
            });
          }
        });
        
        updateStudents();
    });

   	r.readAsText(f);
  }
}

$(document).ready(function() {
  $('#events_content').on('show.bs.collapse', updateEvents);
  $('#houses_content').on('show.bs.collapse', updateHouses);
  $('#students_content').on('show.bs.collapse', updateStudents);

  // csv file input 
  fileIn.addEventListener("change", parseCSV, false);
});