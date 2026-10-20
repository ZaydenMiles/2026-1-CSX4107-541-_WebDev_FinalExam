// scripts/seed.mjs
// Resets the database and inserts the test users and sample courses.
// Run with: npm run seed  (reads MONGODB_URI from .env.local)

import bcrypt from "bcrypt";
import { MongoClient } from "mongodb";

// Keep in sync with src/lib/constant.js
const DB_NAME = "wad_final_course";
const USER_COLLECTION = "users";
const COURSE_COLLECTION = "courses";

const TEST_PASSWORD = "password123";

const USERS = [
  { username: "teacher1", name: "Alice Johnson", email: "teacher1@example.com", role: "Teacher" },
  { username: "teacher2", name: "Bob Smith", email: "teacher2@example.com", role: "Teacher" },
  { username: "teacher3", name: "Carol Williams", email: "teacher3@example.com", role: "Teacher" },
  { username: "student1", name: "David Lee", email: "student1@example.com", role: "Student" },
  { username: "student2", name: "Emma Brown", email: "student2@example.com", role: "Student" },
  { username: "student3", name: "Frank Miller", email: "student3@example.com", role: "Student" },
];

// teacher and students refer to usernames above
const COURSES = [
  {
    teacher: "teacher1",
    courseName: "Introduction to Web Development",
    duration: 30,
    topics: ["HTML", "CSS", "JavaScript"],
    price: 1500,
    maxStudent: 30,
    status: "Open",
    students: ["student1", "student2"],
  },
  {
    teacher: "teacher1",
    courseName: "Advanced React Patterns",
    duration: 21,
    topics: ["Hooks", "Context API", "Performance"],
    price: 2500,
    maxStudent: 20,
    status: "Close",
    students: ["student1"],
  },
  {
    teacher: "teacher1",
    courseName: "jQuery Legacy Workshop",
    duration: 5,
    topics: ["jQuery", "DOM"],
    price: 500,
    maxStudent: 10,
    status: "Cancel",
    students: [],
  },
  {
    teacher: "teacher2",
    courseName: "Database Design with MongoDB",
    duration: 14,
    topics: ["Data Modeling", "Aggregation", "Indexes"],
    price: 1800,
    maxStudent: 2,
    status: "Open",
    students: ["student1", "student2"],
  },
  {
    teacher: "teacher2",
    courseName: "Node.js API Fundamentals",
    duration: 10,
    topics: ["REST", "JWT", "Middleware"],
    price: 1200,
    maxStudent: 25,
    status: "Open",
    students: [],
  },
  {
    teacher: "teacher3",
    courseName: "UX Design Basics",
    duration: 7,
    topics: ["Wireframing", "Prototyping", "Usability Testing"],
    price: 900,
    maxStudent: 15,
    status: "Open",
    students: ["student3"],
  },
  {
    teacher: "teacher3",
    courseName: "Python for Data Analysis",
    duration: 28,
    topics: ["Pandas", "NumPy", "Visualization"],
    price: 2000,
    maxStudent: 40,
    status: "Open",
    students: [],
  },
  {
    teacher: "teacher3",
    courseName: "Mobile App Prototyping",
    duration: 12,
    topics: ["Figma", "User Flows"],
    price: 1100,
    maxStudent: 20,
    status: "Cancel",
    students: ["student3"],
  },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set. Create next-backend/.env.local first.");
    process.exit(1);
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const users = db.collection(USER_COLLECTION);
    const courses = db.collection(COURSE_COLLECTION);

    await users.deleteMany({});
    await courses.deleteMany({});
    await users.createIndex({ username: 1 }, { unique: true });
    await users.createIndex({ email: 1 }, { unique: true });

    const now = Date.now();
    const userDocs = await Promise.all(
      USERS.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(TEST_PASSWORD, 10),
        createdAt: new Date(now),
        updatedAt: new Date(now),
      })),
    );
    const { insertedIds } = await users.insertMany(userDocs);
    const idByUsername = Object.fromEntries(
      USERS.map((user, index) => [user.username, insertedIds[index]]),
    );

    // Earlier entries get later timestamps so lists show them first
    const courseDocs = COURSES.map(({ teacher, students, ...course }, index) => {
      const createdAt = new Date(now - index * 60 * 1000);
      return {
        ...course,
        teacherId: idByUsername[teacher],
        students: students.map((username) => ({
          userId: idByUsername[username],
          enrolledAt: createdAt,
        })),
        createdAt: createdAt,
        updatedAt: createdAt,
      };
    });
    await courses.insertMany(courseDocs);

    console.log(`Seeded ${USERS.length} users and ${COURSES.length} courses into "${DB_NAME}".`);
    console.table(
      USERS.map((user) => ({
        username: user.username,
        email: user.email,
        password: TEST_PASSWORD,
        role: user.role,
      })),
    );
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
