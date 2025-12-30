import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { campaignSchema } from "@/validations/campaign";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        // Parse dates correctly
        const parsedBody = {
            ...body,
            eventDate: new Date(body.eventDate),
            startDate: new Date(body.startDate),
            endDate: new Date(body.endDate),
            votingEndDate: new Date(body.votingEndDate),
        };

        const validatedData = campaignSchema.parse(parsedBody);

        const slug = validatedData.title
            .toLowerCase()
            .replace(/ /g, "-")
            .replace(/[^\w-]+/g, "");

        const campaign = await prisma.campaign.create({
            data: {
                ...validatedData,
                slug: `${slug}-${Math.random().toString(36).substring(2, 7)}`,
                creatorId: session.user.id,
                status: "DRAFT",
                prizePool: validatedData.prizePool,
                prizeBreakdown: validatedData.prizeBreakdown as any,
            },
        });

        return NextResponse.json(campaign);
    } catch (error: any) {
        console.error("[CAMPAIGNS_POST]", error);
        return NextResponse.json(
            { error: "Internal Error", details: error.message },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category");
        const status = searchParams.get("status");

        const campaigns = await prisma.campaign.findMany({
            where: {
                ...(category && { category }),
                ...(status && { status: status as any }),
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                creator: {
                    select: {
                        name: true,
                        avatar: true,
                    },
                },
            },
        });

        return NextResponse.json(campaigns);
    } catch (error: any) {
        console.error("[CAMPAIGNS_GET]", error);
        return NextResponse.json(
            { error: "Internal Error", details: error.message },
            { status: 500 }
        );
    }
}
