import dotenv from "dotenv";
import mongoose from "mongoose";
import cloudinary from "cloudinary";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Load env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CONNECT TO MONGO
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI missing in .env");
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);
console.log("✅ Connected to MongoDB");

// CLOUDINARY AUTH
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// LOAD IMAGE FOLDER (your uploaded ZIP)
const imagesFolder = path.join(__dirname, "../Images");

if (!fs.existsSync(imagesFolder)) {
  console.error("❌ Images folder not found:", imagesFolder);
  process.exit(1);
}

console.log("📁 Using images from:", imagesFolder);

// MENU MODEL
const Menu = mongoose.model(
  "Menu",
  new mongoose.Schema({}, { strict: false }),
  "menus"
);

// FETCH ALL MENU ITEMS
const menuItems = await Menu.find({});
console.log(`📌 Found ${menuItems.length} total menu items`);

function normalize(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

// READ ALL IMAGE FILENAMES
const allImages = fs.readdirSync(imagesFolder);

for (const item of menuItems) {
  const name = item.name || "";
  const n1 = normalize(name);

  // best-match image
  let matchedFile = null;

  for (const img of allImages) {
    const n2 = normalize(img.replace(path.extname(img), ""));
    if (n1 === n2) {
      matchedFile = img;
      break;
    }
  }

  if (!matchedFile) {
    console.log(`⚠ No matching image found for "${name}" → skipping`);
    continue;
  }

  // UPLOAD NOW
  const filePath = path.join(imagesFolder, matchedFile);

  console.log(`⬆ Uploading: ${matchedFile} → ${name}`);

  const result = await cloudinary.v2.uploader.upload(filePath, {
    folder: "cafe-caffea/menu",
  });

  // UPDATE IN DB
  await Menu.updateOne(
    { _id: item._id },
    { $set: { image: result.secure_url } }
  );

  console.log(`✅ Updated: ${name}`);
}

console.log("✨ DONE! All matched images migrated.");
process.exit(0);
