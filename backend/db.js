const creation_queries = [
  ` CREATE TABLE IF NOT EXISTS "events" (
    "event_name" TEXT, 
    "event_id" INTEGER PRIMARY KEY
  );`,
  ` CREATE TABLE IF NOT EXISTS  "houses" (
    "house_name" TEXT, 
    "house_id" INTEGER PRIMARY KEY
  );`,
  ` CREATE TABLE  IF NOT EXISTS "students" (
    "student_name" TEXT,
    "student_id" INTEGER PRIMARY KEY,
    "house_id" INTEGER,
    FOREIGN KEY("house_id") REFERENCES houses("house_id")
  );`,
  ` CREATE TABLE  IF NOT EXISTS "participation" (
    "event_id" INTEGER,
    "house_id" INTEGER,
    "num_students" INTEGER,
    FOREIGN KEY("event_id") REFERENCES events("event_id"),
    FOREIGN KEY("house_id") REFERENCES houses("house_id")
  );`,
  ` CREATE TABLE  IF NOT EXISTS "placing" (
    "event_id" INTEGER,
    "house_id" INTEGER,
    "student_id" INTEGER,
    "value" DOUBLE,
    "placing" INTEGER,
    FOREIGN KEY(event_id) REFERENCES events(event_id),
    FOREIGN KEY(house_id) REFERENCES houses(house_id),
    FOREIGN KEY(student_id) REFERENCES students(student_id)
  );`,
  `DELETE FROM "events";`,
  `DELETE FROM "houses";`,
  `DELETE FROM "students";`,
  `DELETE FROM "participation";`,
  `DELETE FROM "placing";`
];

const house_query = `INSERT INTO 'houses' (house_name, house_id) VALUES
                    ("Clayton", 1),
                    ("Omimi", 2),
                    ("Aoraki", 3),
                    ("Toroa", 4);`;

const test_students = `INSERT INTO students (student_name, house_id) VALUES
                      ("Linus Molteno", 2),
                      ("Elia Hayashishita", 2),
                      ("Ben Mead", 3),
                      ("Paxton Hall", 0);`;

module.exports = {
  create_db: async function(db) {
    console.log("creating database");
    return new Promise(function(resolve, reject) {
      var any_error = false;
      db.exec(creation_queries.join('\n'), console.log)
      // creation_queries.forEach((query, index) => {
      //   db.run(query, [], function(err) {
      //     if (err) {
      //       console.log("error in executing");
      //       console.log(err);
      //       any_error = err;
      //     };
      //   });
      // });
      if (any_error) {
        reject(any_error);
      } else {
        resolve();
      }
    })
  },
  make_houses: function(db) {
    console.log("adding houses");
    db.run(house_query, [], function(err) {
      if (err) {
        console.log("error in executing");
        console.log(house_query);
        console.log(err);
        return(err);
      } else {
        return 0;
      }
    });
  },
  add_test_students: function(db) {
    console.log("adding test students");
    db.run(test_students, [], function(err) {
      if (err) {
        console.log(err);
        return(err);
      } else {
        return 0;
      }
    });
  }
};
