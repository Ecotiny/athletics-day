const express = require('express');
const sqlite3 = require('sqlite3');
const db_manip = require('./db');
const auth = require("./auth");

let db = new sqlite3.Database('./athletics.db', (err) => {
  if (err) {
    console.error("there is an error");
    console.error(err.message);
  }
  console.log('Connected to the database.');
// For some reason the houses table wasn't being 
// created, so for now I'm assuming that the
// DB has already been created.
});

var app = express(); // initialise express app
var api = express.Router(); // create router for api

app.use(function(req, res, next) { // allow cross origin requests (from different domain, mostly for testing)
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', '*');
  // intercept OPTIONS method
  if ('OPTIONS' == req.method) {
    res.send(200);
  }
  else {
    next();
  }
});

api.use(express.json()); // for parsing body data from JS
api.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(auth.basicAuth); // middleware that checks the headers for auth

app.use("/api", api); // apply router to the /api path

app.use(function(err, req, res, next) { // global error handler
    if (typeof (err) === 'string') {
        // custom-written error
        return res.status(400).json({ message: err });
    }
    // default to 500 server error
    return res.status(500).json({ message: err.message });
});

app.get('/', (req, res) => { // placeholder to verify that it works
  res.send('Placeholder text!');
});

//   _______  __   __  _______  __    _  _______ 
//  |       ||  | |  ||       ||  |  | ||       |
//  |    ___||  |_|  ||    ___||   |_| ||_     _|
//  |   |___ |       ||   |___ |       |  |   |  
//  |    ___||       ||    ___||  _    |  |   |  
//  |   |___  |     | |   |___ | | |   |  |   |  
//  |_______|  |___|  |_______||_|  |__|  |___|  

// Create new event.
// Input:
// name: name of new event
// Output:
// success: true/false whether or not it was successful
// event_id: id of the event just created
// error: only created if success: false
api.post('/event', async (req, res) => {
  var sql = "INSERT INTO events (event_name) VALUES (?);";
  let name = req.body.name;
  console.log("adding event with name " + req.body.name);
  db.run(sql, [req.body.name], function(err) { // run sql with params from url/request body
    if (err) {
       res.json({"success": false, "error": err});
    } else {
      res.json({"success": true, "event_id": this.lastID});
    }
  });
});

// Get all events.
// No input
// Output:
// success: true/false whether or not it was successful
// rows: every row of the events table []
// error: only created if success: false
api.get('/event', async (req, res) => {
  var sql = "SELECT * FROM events";
  db.all(sql, [], function(err, rows) {
    if (err) {
      console.log("Error on GET /event");
      console.log(err.message);
       res.json({"success": false, "error": err});
    } else {
      res.json({"success": true, "rows": rows});
    }
  });
});

// Get name of specific event
// Input:
// url parameters (e.g. /event/1 would address the event with ID 1
// Output:
// success: true/false whether or not it was successful
// event_name: name of event with specific ID
// error: only created if success: false
api.get('/event/:eventId', async (req, res) => {
  const event = req.params.eventId;
  var sql = "SELECT event_name FROM events WHERE event_id = ?";
  db.get(sql, [event], function(err, row) {
    if (err) {
       res.json({"success": false, "error": err});
    } else {
      res.json({"success": true, "event_name": row.event_name});
    }
  });
});

// Delete specific event
// Input:
// url parameters (e.g. /event/1 would address the event with ID 1
// Output:
// success: true/false whether or not it was successful
// error: only created if success: false
api.delete('/event/:eventId', async (req, res) => {
  const event = req.params.eventId;
  var sql = "DELETE FROM events WHERE event_id = ?";
  db.run(sql, [event], function(err) {
    if (err) {
      res.json({"success": false, "error": err});
    } else {
      res.json({"success": true});
    }
  });
});

//   __   __  _______  __   __  _______  _______ 
//  |  | |  ||       ||  | |  ||       ||       |
//  |  |_|  ||   _   ||  | |  ||  _____||    ___|
//  |       ||  | |  ||  |_|  || |_____ |   |___ 
//  |       ||  |_|  ||       ||_____  ||    ___|
//  |   _   ||       ||       | _____| ||   |___ 
//  |__| |__||_______||_______||_______||_______|

// Create new house.
// Input:
// name: name of new house
// Output:
// success: true/false whether or not it was successful
// house_id: id of the house just created
// error: only created if success: false
api.post('/house', async (req, res) => {
  var sql = "INSERT INTO houses (house_name) VALUES (?);";
  let name = req.body.name;
  console.log("adding house with name " + req.body.name);
  db.run(sql, [req.body.name], function(err) {
    if (err) {
       res.json({"success": false, "error": err});
    } else {
      res.json({"success": true, "house_id": this.lastID});
    }
  });
});

// Get all houses.
// No input
// Output:
// success: true/false whether or not it was successful
// rows: every row of the houses table []
// error: only created if success: false
api.get('/house', async (req, res) => {
  var sql = "SELECT * FROM houses";
  db.all(sql, [], function(err, rows) {
    if (err) {
      console.log("Error on GET /house");
      console.log(err.message);
       res.json({"success": false, "error": err});
    } else {
      res.json({"success": true, "rows": rows});
    }
  });
});

// Get name of specific house
// Input:
// url parameters (e.g. /house/1 would address the house with ID 1
// Output:
// success: true/false whether or not it was successful
// house_name: name of house with specific ID
// error: only created if success: false
api.get('/house/:houseId', async (req, res) => {
  const house = req.params.houseId;
  var sql = "SELECT house_name FROM houses WHERE house_id = ?";
  db.get(sql, [house], function(err, row) {
    if (err) {
       res.json({"success": false, "error": err});
    } else {
      res.json({"success": true, "house_name": row.house_name});
    }
  });
});

// Delete specific house
// Input:
// url parameters (e.g. /house/1 would address the house with ID 1
// Output:
// success: true/false whether or not it was successful
// error: only created if success: false
api.delete('/house/:houseId', async (req, res) => {
  const house = req.params.houseId;
  var sql = "DELETE FROM houses WHERE house_id = ?";
  db.run(sql, [house], function(err) {
    if (err) {
      res.json({"success": false, "error": err});
    } else {
      res.json({"success": true});
    }
  });
});

//   _______  _______  __   __  ______   _______  __    _  _______ 
//  |       ||       ||  | |  ||      | |       ||  |  | ||       |
//  |  _____||_     _||  | |  ||  _    ||    ___||   |_| ||_     _|
//  | |_____   |   |  |  |_|  || | |   ||   |___ |       |  |   |  
//  |_____  |  |   |  |       || |_|   ||    ___||  _    |  |   |  
//   _____| |  |   |  |       ||       ||   |___ | | |   |  |   |  
//  |_______|  |___|  |_______||______| |_______||_|  |__|  |___|  

// Create a student
// Input:
// name: name of student
// student_id: student ID
// house_id: ID of the house the student is in
// Output:
// success: true/false whether or not it was successful
// error: only created if success: false
api.post('/student', async (req, res) => {
  var sql = "INSERT INTO students (student_name, student_id, house_id) VALUES (?, ?, ?)";
    db.run(sql, [req.body.name, req.body.student_id, req.body.house_id], function(err) {
    if (err) {
       res.json({"success": false, "error": err});
    } else {
      res.json({"success": true});
    }
  });
});

// Get all students
// No input
// Output:
// success: true/false whether or not it was successful
// rows: every row of the students table []
// error: only created if success: false
api.get('/student', async (req, res) => {
  var sql = "SELECT * FROM students";
  db.all(sql, [], function(err, rows) {
    if (err) {
      res.json({"success": false, "error": err});
    } else {
      res.json({"success": true, "rows": rows});
    }
  });
});

// Get name and house of specific student
// Input:
// url parameters (e.g. /student/1)
// Output:
// success
// error (if not successful)
// student_name (if successful)
// house_id (if successful)
api.get('/student/:studentId', async (req, res) => {
  const student = req.params.studentId;
  console.log(student);
  var sql = "SELECT student_name FROM students WHERE student_id = ?";
  db.get(sql, [student], function(err, row) {
    if (err) {
       res.json({"success": false, "error": err});
    } else {
      res.json({
                "success": true,
                "student_name": row.student_name,
                "house_id": row.house_id,
      });
    }
  });
});

// Delete specific student
// Input:
// url parameters (e.g. /student/1)
// Output:
// success
// error (if not successful)
api.delete('/student/:studentId', async (req, res) => {
  const student = req.params.studentId;
  var sql = "DELETE FROM students WHERE student_id = ?";
  db.run(sql, [student], function(err) {
    if (err) {
      res.json({"success": false, "error": err});
    } else {
      res.json({"success": true});
    }
  });
});

// Delete all students
// Input:
// url parameters (e.g. /student/1)
// Output:
// success
// error (if not successful)
api.delete('/student', async (req, res) => {
  const student = req.params.studentId;
  var sql = "DELETE FROM students";
  db.run(sql, [student], function(err) {
    if (err) {
      res.json({"success": false, "error": err});
    } else {
      res.json({"success": true});
    }
  });
});


//   _______  _______  ______    _______  ___   _______  ___   _______ 
//  |       ||   _   ||    _ |  |       ||   | |       ||   | |       |
//  |    _  ||  |_|  ||   | ||  |_     _||   | |       ||   | |    _  |
//  |   |_| ||       ||   |_||_   |   |  |   | |       ||   | |   |_| |
//  |    ___||       ||    __  |  |   |  |   | |      _||   | |    ___|
//  |   |    |   _   ||   |  | |  |   |  |   | |     |_ |   | |   |    
//  |___|    |__| |__||___|  |_|  |___|  |___| |_______||___| |___|    

// Create new participation entry
// Input:
// event_id
// house_id
// num_students (from this house)
// Output:
// success
// error (if not successful)
api.post('/participation', async (req, res) => {
  var sql = "INSERT INTO participation (event_id, house_id, num_students) VALUES (?, ?, ?)";
  db.run(sql, [req.body.event_id, req.body.house_id, req.body.num_students], function(err) {
    if (err) {
       res.json({"success": false, "error": err});
    } else {
      res.json({"success": true});
    }
  });
});

// Update participation entry
// Will return error if there is not an existing entry with the same house and event id
// Input:
// event_id
// house_id
// num_students (new, from this house)
// Output:
// success
// error (if not successful)
api.put('/participation', async (req, res) => {
  var sql = "UPDATE participation SET num_students = ? WHERE event_id = ? AND house_id = ?";
  db.run(sql, [req.body.num_students, req.body.event_id, req.body.house_id], function(err) {
    if (err) {
       res.json({"success": false, "error": err});
    } else {
      res.json({"success": true});
    }
  });
});

// Get all participation from one event
// Input:
// url parameters (e.g. /participation/1 will get participation from event_id 1)
// Output:
// success
// error (if not successful)
// rows (if successful)
api.get('/participation/:eventId', async (req, res) => {
  const event_id = req.params.eventId;
  var sql = "SELECT house_id, num_students FROM participation WHERE event_id = ?";
  db.all(sql, [event_id], function(err, rows) {
    if (err) {
       res.json({"success": false, "error": err});
    } else {
      res.json({"success": true, "rows": rows});
    }
  });
});

// Delete all the participation stuff from an event
// Input:
// url parameters (e.g. /participation/1)
// Output:
// success
// error (if not successful)
api.delete('/participation/:eventId', async (req, res) => {
  const event = req.params.eventId;
  var sql = "DELETE FROM participation WHERE event_id = ?";
  db.run(sql, [event], function(err) {
    if (err) {
      res.json({"success": false, "error": err});
    } else {
      res.json({"success": true});
    }
  });
});

// Delete participation entry for specific house and event
// Input:
// url parameters (e.g. /participation/1/2 will delete entry for event 1, house 2)
// Output:
// success
// error (if not successful)
api.delete('/participation/:eventId/:houseId', async (req, res) => {
  const event = req.params.eventId;
  const house = req.params.houseId;
  var sql = "DELETE FROM participation WHERE event_id = ? AND house_id = ?";
  db.run(sql, [event, house], function(err) {
    if (err) {
      res.json({"success": false, "error": err});
    } else {
      res.json({"success": true});
    }
  });
});



//   _______  ___      _______  _______  ___   __    _  _______  _______ 
//  |       ||   |    |   _   ||       ||   | |  |  | ||       ||       |
//  |    _  ||   |    |  |_|  ||       ||   | |   |_| ||    ___||  _____|
//  |   |_| ||   |    |       ||       ||   | |       ||   | __ | |_____ 
//  |    ___||   |___ |       ||      _||   | |  _    ||   ||  ||_____  |
//  |   |    |       ||   _   ||     |_ |   | | | |   ||   |_| | _____| |
//  |___|    |_______||__| |__||_______||___| |_|  |__||_______||_______|

// Create new placings entry
// Input:
// event_id
// house_id
// student_id
// placing
// value (optional)
// Output:
// success
// error (if not successful)
api.post('/placing', async (req, res) => {
  // check if there's already an entry with that house_id, student_id, and event_id
  var sql = "SELECT * FROM placing WHERE event_id = ? AND house_id = ? AND placing = ?;";
  db.run(sql, [req.body.event_id, req.body.house_id, req.body.placing], function(err, rows) {
    if (err) {
      res.json({"success": false, "error": err});
    } else if (typeof rows !== "undefined") {
      res.json({"success": false, "error": "there is already an entry with this house, event, and placing"});
      return;
    }
    var val = req.body.value;
    if (typeof req.body.value === 'undefined') { // logic for when value is undefined, replacing it with a -1
      val = "-1";
    }
    sql = "INSERT INTO placing (event_id, house_id, student_id, placing, value) VALUES (?,?,?,?,?);";
    db.run(sql, [req.body.event_id, req.body.house_id, req.body.student_id, req.body.placing, val], function(err) {
      if (err) {
        res.json({"success": false, "error": err});
      } else {
        res.json({"success": true});
      }
    });
  });
});

// Get all placings from one event
// Input:
// url parameters (e.g. /placing/1 will get placings from event_id 1)
// Output:
// success
// error (if not successful)
// rows (if successful)
api.get('/placing/:eventId', async (req, res) => {
  const event_id = req.params.eventId;
  var sql = "SELECT house_id, student_id, placing, value FROM placing WHERE event_id = ?";
  db.all(sql, [event_id], function(err, rows) {
    if (err) {
      res.json({"success": false, "error": err});
    } else {
      res.json({"success": true, "rows": rows});
    }
  });
});

// Delete all the placings stuff from an event
// Input:
// url parameters (e.g. /placing/1)
// Output:
// success
// error (if not successful)
api.delete('/placing/:eventId', async (req, res) => {
  const event = req.params.eventId;
  var sql = "DELETE FROM placing WHERE event_id = ?";
  db.run(sql, [event], function(err) {
    if (err) {
      res.json({"success": false, "error": err});
    } else {
      res.json({"success": true});
    }
  });
});

// Delete placing entry for specific event and placing
// Input:
// url parameters (e.g. /placing/1/2 will delete entry for event 1, 2nd place)
// Output:
// success
// error (if not successful)
api.delete('/placing/:eventId/:placing', async (req, res) => {
  const event = req.params.eventId;
  const placing = req.params.placing;
  var sql = "DELETE FROM placing WHERE event_id = ? AND placing = ?";
  db.run(sql, [event, placing], function(err) {
    if (err) {
      res.json({"success": false, "error": err});
    } else {
      res.json({"success": true});
    }
  });
});


// Get all relevant rows for point calculation from a specific house
// Input:
// url parameters (e.g. /points/1 will get points from house 1)
// Output:
// success
// error (if not successful)
// placings (if successful): rows (event_id, student_id, placing, value) from placings table
// participation (if successful): rows (event_id, num_students) from participation table
api.get('/points/:houseId', async (req, res) => {
  const house = req.params.houseId;
  var sql1 = "SELECT event_id, num_students FROM participation WHERE house_id = ?";
  var sql2 = "SELECT event_id, student_id, placing, value FROM placing WHERE house_id = ?";
  db.all(sql1, [house], function(err, rows) {
	  console.log(`particip for house ${house}`);
	  console.log(rows);
    if (err) {
      res.json({"success": false, "error": err});
    }
    db.all(sql2, [house], function(err, placings) {
      if (err) {
        res.json({"success": false, "error": err});
      } else {
	console.log("I got things");
	console.log(placings);
        res.json({"success": true,
                  "placing": placings,
                  "participation": rows});
      }
    });
  });
});

//   _______  __   __  _______  __   __ 
//  |   _   ||  | |  ||       ||  | |  |
//  |  |_|  ||  | |  ||_     _||  |_|  |
//  |       ||  |_|  |  |   |  |       |
//  |       ||       |  |   |  |       |
//  |   _   ||       |  |   |  |   _   |
//  |__| |__||_______|  |___|  |__| |__|

// check a username/password combination
// Input:
// username
// password
// Output:
// if auth success:
// user without password (object including id, username, firstName, lastName)
// else returns error : "username or password is incorrect"
api.post('/auth', (req, res, next) => {
    console.log("Someone is trying to log in");
    auth.authenticate(req.body)
        .then(user => user ? res.json(user) : res.status(400).json({ success: false, error: 'Username or password is incorrect' }))
        .catch(err => next(err));
});

// get all user's names and first and last names
// Output:
// user without password (id, username, firstName, lastName)
api.get('/auth', (req, res, next) => {
    auth.getAll()
        .then(users => res.json(users))
        .catch(err => next(err));
});

app.listen(3000, () => {
  console.log('server started');
});
