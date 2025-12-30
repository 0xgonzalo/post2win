import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;
        const folder = formData.get("folder") as string || "submissions";

        if (!file) {
            return new NextResponse("No file provided", { status: 400 });
        }

        // Convert file to base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

        // Determine resource type
        const resourceType = file.type.startsWith("video/") ? "video" : "image";

        const result = await uploadToCloudinary(base64, {
            folder,
            resourceType,
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("[UPLOAD_POST]", error);
        return new NextResponse("Upload failed", { status: 500 });
    }
}
