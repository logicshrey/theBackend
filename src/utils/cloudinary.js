import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localPath) => {
  try {
    if (!localPath) {
      return null;
    }
    const uploadResult = await cloudinary.uploader.upload(localPath, {
      resource_type: "auto"
    });

    fs.unlinkSync(localPath);
    return uploadResult;
  } catch (error) {
    fs.unlinkSync(localPath);
    console.log("Cloudinary Upload Error: ", error);
    return null;
  }
};

const destroyOnCloudinary = async (fileUrl) => {
  try {
    return await cloudinary.uploader.destroy(fileUrl);
  } catch (error) {
    console.log("Cloudinary Destroy Error: ", error);
  }
};

export { uploadOnCloudinary, destroyOnCloudinary };
