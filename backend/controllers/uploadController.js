import cloudinary from "cloudinary";
import fs from "fs";

// Cloudinary config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// MAIN upload function
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // upload to cloudinary
    const result = await cloudinary.v2.uploader.upload(req.file.path, {
      folder: "cafe-caffea/menu",
    });

    // delete temp file
    fs.unlinkSync(req.file.path);

    return res.json({
      success: true,
      url: result.secure_url,
    });

  } catch (err) {
    console.error("❌ Cloudinary upload error:", err);
    return res.status(500).json({ error: "Image upload failed" });
  }
};
