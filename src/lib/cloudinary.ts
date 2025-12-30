import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

export async function uploadToCloudinary(
    file: string, // Base64 or file URL
    options: {
        folder?: string;
        resourceType?: "image" | "video" | "auto";
    } = {}
) {
    const { folder = "submissions", resourceType = "auto" } = options;

    const result = await cloudinary.uploader.upload(file, {
        folder,
        resource_type: resourceType,
        transformation: [
            { quality: "auto" },
            { fetch_format: "auto" },
        ],
    });

    return {
        url: result.secure_url,
        publicId: result.public_id,
        type: result.resource_type as "image" | "video",
        width: result.width,
        height: result.height,
        thumbnail: result.resource_type === "video"
            ? result.secure_url.replace(/\.[^/.]+$/, ".jpg")
            : result.secure_url,
    };
}

export function generateThumbnail(publicId: string, type: "image" | "video") {
    if (type === "video") {
        return cloudinary.url(publicId, {
            resource_type: "video",
            format: "jpg",
            transformation: [
                { width: 400, height: 300, crop: "fill" },
                { quality: "auto" },
            ],
        });
    }
    return cloudinary.url(publicId, {
        transformation: [
            { width: 400, height: 300, crop: "fill" },
            { quality: "auto" },
        ],
    });
}
