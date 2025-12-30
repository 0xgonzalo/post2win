import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { campaignId } = await req.json();

        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
        });

        if (!campaign) {
            return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
        }

        if (campaign.creatorId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        if (campaign.isPaid) {
            return NextResponse.json({ error: "Campaign already paid" }, { status: 400 });
        }

        const checkoutSession = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: `Prize Pool for: ${campaign.title}`,
                            description: `Event: ${campaign.eventName}`,
                        },
                        unit_amount: Math.round(Number(campaign.prizePool) * 100), // Stripe expects cents
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${process.env.NEXTAUTH_URL}/campaigns/${campaignId}?success=true`,
            cancel_url: `${process.env.NEXTAUTH_URL}/campaigns/${campaignId}?canceled=true`,
            metadata: {
                campaignId: campaign.id,
                userId: session.user.id,
            },
        });

        return NextResponse.json({ url: checkoutSession.url });
    } catch (error: any) {
        console.error("[STRIPE_CHECKOUT_POST]", error);
        return NextResponse.json(
            { error: "Internal Error", details: error.message },
            { status: 500 }
        );
    }
}
