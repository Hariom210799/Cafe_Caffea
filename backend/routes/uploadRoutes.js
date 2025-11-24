import express from "express";
import multer from "multer";
import { uploadImage } from "../controllers/uploadController.js";

const router = express.Router();

// Using temporary storage (Cloudinary will upload)
const upload = multer({ dest: "temp/" });

router.post("/image", upload.single("image"), uploadImage);

export default router;
