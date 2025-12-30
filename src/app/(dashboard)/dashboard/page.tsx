import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    // Fetch user stats
    const [campaignsCount, submissions, payouts] = await Promise.all([
        prisma.campaign.count({
            where: { creatorId: session.user.id },
        }),
        prisma.submission.findMany({
            where: { userId: session.user.id },
            include: {
                campaign: {
                    select: {
                        title: true,
                        status: true,
                        endDate: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            take: 5,
        }),
        prisma.payout.aggregate({
            where: { userId: session.user.id, status: "COMPLETED" },
            _sum: { amount: true },
        }),
    ]);

    // Fetch user's created campaigns
    const userCampaigns = await prisma.campaign.findMany({
        where: { creatorId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: {
            _count: {
                select: { submissions: true },
            },
        },
    });

    const totalWon = payouts._sum.amount?.toNumber() || 0;

    return (
        <DashboardClient
            user={session.user}
            stats={{
                campaignsCreated: campaignsCount,
                submissionsMade: submissions.length,
                totalWon,
            }}
            recentSubmissions={submissions as any}
            myCampaigns={userCampaigns as any}
        />
    );
}
