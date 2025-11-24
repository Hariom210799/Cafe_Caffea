import mongoose from "mongoose";
import dotenv from "dotenv";
import CafeTable from "../models/CafeTable.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const tables = [
  { name: "Table 1", capacity: 4 },
  { name: "Table 2", capacity: 4 },
  { name: "Table 3", capacity: 4 },
  { name: "Table 4", capacity: 4 },
  { name: "Table 5", capacity: 4 },
  { name: "Table 6", capacity: 4 },
    { name: "Table 7", capacity: 4 },
   { name: "Table 8", capacity: 4 },
    { name: "Table 9", capacity: 4 }
];

async function seedTables() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);

    console.log("🧹 Clearing existing tables...");
    await CafeTable.deleteMany();

    console.log("📥 Inserting tables...");
    const docs = await CafeTable.insertMany(tables);

    console.log("✅ Tables seeded successfully:");
    console.table(docs.map(t => ({ name: t.name, capacity: t.capacity })));

    process.exit();
  } catch (err) {
    console.error("❌ Seeding Error:", err.message);
    process.exit(1);
  }
}

seedTables();
