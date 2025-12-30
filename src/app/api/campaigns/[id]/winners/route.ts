import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

const winnersSchema = z.object({
    winners: z.array(z.object({
        submissionId: z.string(),
        place: z.number().min(1),
    })),
});

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify ownership
        const campaign = await prisma.campaign.findUnique({
            where: { id },
            select: { creatorId: true, prizeBreakdown: true, prizePool: true, status: true, title: true },
        });

        if (!campaign || campaign.creatorId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const { winners } = winnersSchema.parse(body);

        // Clear previous winners for this campaign
        await prisma.submission.updateMany({
            where: { campaignId: id },
            data: { isWinner: false, winnerPlace: null, prizeAmount: null },
        });

        // Set new winners with prize amounts
        const prizeBreakdown = campaign.prizeBreakdown as any[];

        for (const winner of winners) {
            const prizeConfig = prizeBreakdown.find((p: any) => p.place === winner.place);
            const prizeAmount = prizeConfig
                ? (Number(campaign.prizePool) * (prizeConfig.percentage || 0)) / 100
                : 0;

            const updatedSubmission = await prisma.submission.update({
                where: { id: winner.submissionId },
                data: {
                    isWinner: true,
                    winnerPlace: winner.place,
                    prizeAmount,
                },
                include: { user: true },
            });

            // Create Payout record
            if (prizeAmount > 0) {
                const payout = await prisma.payout.create({
                    data: {
                        amount: prizeAmount,
                        userId: updatedSubmission.userId,
                        status: "PENDING",
                    },
                });

                // Trigger Stripe Transfer if user has an account connected
                if (updatedSubmission.user.stripeAccountId) {
                    try {
                        const transfer = await stripe.transfers.create({
                            amount: Math.round(prizeAmount * 100),
                            currency: "usd",
                            destination: updatedSubmission.user.stripeAccountId,
                            description: `Winnings for campaign: ${campaign.title}`,
                            metadata: { payoutId: payout.id, submissionId: updatedSubmission.id },
                        });

                        await prisma.payout.update({
                            where: { id: payout.id },
                            data: {
                                status: "COMPLETED",
                                stripeTransferId: transfer.id,
                                processedAt: new Date(),
                            },
                        });
                    } catch (stripeError: any) {
                        console.error("[STRIPE_TRANSFER_ERROR]", stripeError);
                        // We keep it as PENDING and retry via a worker or manual intervention
                    }
                }
            }
        }

        // Mark campaign as COMPLETED
        await prisma.campaign.update({
            where: { id },
            data: { status: "COMPLETED" },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[WINNERS_POST]", error);
        return NextResponse.json(
            { error: "Internal Error", details: error.message },
            { status: 500 }
        );
    }
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const winners = await prisma.submission.findMany({
            where: { campaignId: id, isWinner: true },
            orderBy: { winnerPlace: "asc" },
            include: {
                user: { select: { id: true, name: true, avatar: true } },
            },
        });

        return NextResponse.json(winners);
    } catch (error: any) {
        console.error("[WINNERS_GET]", error);
        return NextResponse.json(
            { error: "Internal Error", details: error.message },
            { status: 500 }
        );
    }
}
