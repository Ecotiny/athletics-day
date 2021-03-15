DROP TABLE IF EXISTS "events";
DROP TABLE IF EXISTS "houses";
DROP TABLE IF EXISTS "students";
DROP TABLE IF EXISTS "participation";
DROP TABLE IF EXISTS "placing";
CREATE TABLE IF NOT EXISTS "events" (
 "event_name" TEXT, 
 "event_id" INTEGER PRIMARY KEY
);
CREATE TABLE IF NOT EXISTS "houses" (
 "house_name" TEXT, 
 "house_id" INTEGER PRIMARY KEY
);
CREATE TABLE IF NOT EXISTS "students" (
 "student_name" TEXT,
 "student_id" INTEGER PRIMARY KEY,
 "house_id" INTEGER,
 FOREIGN KEY("house_id") REFERENCES houses("house_id")
);
CREATE TABLE IF NOT EXISTS "participation" (
 "event_id" INTEGER,
 "house_id" INTEGER,
 "num_students" INTEGER,
 FOREIGN KEY("event_id") REFERENCES events("event_id"),
 FOREIGN KEY("house_id") REFERENCES houses("house_id")
);
CREATE TABLE IF NOT EXISTS "placing" (
 "event_id" INTEGER,
 "house_id" INTEGER,
 "student_id" INTEGER,
 "value" TEXT,
 "placing" INTEGER,
 FOREIGN KEY(event_id) REFERENCES events(event_id),
 FOREIGN KEY(house_id) REFERENCES houses(house_id),
 FOREIGN KEY(student_id) REFERENCES students(student_id)
);

INSERT INTO 'houses' (house_name, house_id) VALUES
                     ("Clayton", 1),
                     ("Omimi", 2),
                     ("Aoraki", 3),
                     ("Toroa", 4);
