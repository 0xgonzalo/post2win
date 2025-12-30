import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SubmissionGallery } from "@/components/submissions/SubmissionGallery";

export default async function SubmissionsPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    const submissions = await prisma.submission.findMany({
        where: { userId: session.user.id },
        include: {
            campaign: {
                select: {
                    title: true,
                    status: true,
                },
            },
            user: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <header className="mb-12">
                <h1 className="text-4xl font-black mb-2 tracking-tight">My Submissions</h1>
                <p className="text-foreground/60">
                    Track all your captures across active and completed campaigns.
                </p>
            </header>

            {submissions.length > 0 ? (
                <SubmissionGallery
                    submissions={submissions as any}
                    isSelectionEnabled={false}
                />
            ) : (
                <div className="glass-dark p-24 rounded-[3rem] border-dashed border-white/10 text-center">
                    <p className="text-foreground/40 text-xl font-bold">You haven't submitted anything yet.</p>
                </div>
            )}
        </div>
    );
}
