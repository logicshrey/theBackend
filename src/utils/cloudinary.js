import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./apiError.js";

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
    if(!fileUrl){
      return;
    }
    const regex = /\/upload\/(?:v\d+\/)?([^/.]+)/;
    const match = fileUrl.match(regex);
    const publicId = match ? match[1] : null;

    await cloudinary.uploader.destroy(publicId);

  } catch (error) {
    // console.log("Cloudinary Destroy Error: ", error);
    throw new ApiError(501,"Something went wrong when destroying the file on cloudinary!")
  }
};

export { uploadOnCloudinary, destroyOnCloudinary };
