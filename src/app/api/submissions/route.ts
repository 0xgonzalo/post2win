import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const submissionSchema = z.object({
    mediaUrl: z.string().url(),
    mediaType: z.enum(["IMAGE", "VIDEO"]),
    thumbnail: z.string().url().optional(),
    title: z.string().max(100).optional(),
    description: z.string().max(500).optional(),
    campaignId: z.string(),
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const data = submissionSchema.parse(body);

        // Check if campaign exists and is active
        const campaign = await prisma.campaign.findUnique({
            where: { id: data.campaignId },
        });

        if (!campaign) {
            return new NextResponse("Campaign not found", { status: 404 });
        }

        if (campaign.status !== "ACTIVE") {
            return new NextResponse("Campaign is not accepting submissions", { status: 400 });
        }

        // Check submission limit
        const existingSubmissions = await prisma.submission.count({
            where: {
                campaignId: data.campaignId,
                userId: session.user.id,
            },
        });

        if (existingSubmissions >= campaign.maxSubmissions) {
            return new NextResponse(
                `Maximum ${campaign.maxSubmissions} submissions allowed`,
                { status: 400 }
            );
        }

        // Create submission
        const submission = await prisma.submission.create({
            data: {
                mediaUrl: data.mediaUrl,
                mediaType: data.mediaType,
                thumbnail: data.thumbnail,
                title: data.title,
                description: data.description,
                campaignId: data.campaignId,
                userId: session.user.id,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        avatar: true,
                    },
                },
            },
        });

        return NextResponse.json(submission);
    } catch (error) {
        console.error("[SUBMISSIONS_POST]", error);
        if (error instanceof z.ZodError) {
            return new NextResponse(error.message, { status: 400 });
        }
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const campaignId = searchParams.get("campaignId");
        const userId = searchParams.get("userId");

        const submissions = await prisma.submission.findMany({
            where: {
                ...(campaignId && { campaignId }),
                ...(userId && { userId }),
            },
            orderBy: [
                { createdAt: "desc" },
            ],
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });

        return NextResponse.json(submissions);
    } catch (error) {
        console.error("[SUBMISSIONS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
