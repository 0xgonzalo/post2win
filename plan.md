# Implementation Plan - Organizer-Selected Winners

Step-by-step guide to implement remaining features with the new winner selection model.

---

## 1. Schema Migration

### Goal
Remove voting, add winner selection fields.

### Steps

1. **Edit `prisma/schema.prisma`**:
   ```prisma
   model Submission {
     // ... existing fields ...
     isWinner    Boolean   @default(false)
     winnerPlace Int?      // 1, 2, 3, etc.
     prizeAmount Decimal?  @db.Decimal(10, 2)
     // Remove: votes, voteCount, rank
   }
   
   // Delete entire Vote model
   ```

2. **Remove `votes` from User model relations**

3. **Run migration**:
   ```bash
   npx prisma migrate dev --name remove-voting-add-winners
   ```

4. **Regenerate client**:
   ```bash
   npx prisma generate
   ```

---

## 2. Delete Voting API

### Goal
Remove `/api/votes` entirely.

### Steps

1. Delete `src/app/api/votes/route.ts`
2. Remove any imports referencing this route

---

## 3. Create Winners API

### Goal
New endpoint for organizers to select winners.

### File
`src/app/api/campaigns/[id]/winners/route.ts`

### Implementation

```typescript
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

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
      select: { creatorId: true, prizeBreakdown: true, prizePool: true },
    });

    if (!campaign || campaign.creatorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { winners } = winnersSchema.parse(body);

    // Clear previous winners
    await prisma.submission.updateMany({
      where: { campaignId: id },
      data: { isWinner: false, winnerPlace: null, prizeAmount: null },
    });

    // Set new winners with prize amounts
    const prizeBreakdown = campaign.prizeBreakdown as { place: number; percentage: number }[];
    
    for (const winner of winners) {
      const prizeConfig = prizeBreakdown.find(p => p.place === winner.place);
      const prizeAmount = prizeConfig 
        ? (Number(campaign.prizePool) * prizeConfig.percentage) / 100 
        : 0;

      await prisma.submission.update({
        where: { id: winner.submissionId },
        data: {
          isWinner: true,
          winnerPlace: winner.place,
          prizeAmount,
        },
      });
    }

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
```

---

## 4. Update SubmissionGallery

### Goal
Remove voting UI, add winner selection for owners.

### Changes to `src/components/submissions/SubmissionGallery.tsx`

1. **Remove props**: `onVote`, `votedIds`, `isVotingEnabled`
2. **Add props**: `isOwner`, `onSelectWinner`, `prizeBreakdown`
3. **Remove** vote button and heart icon
4. **Add** winner dropdown for owners:
   ```tsx
   {isOwner && (
     <select
       value={submission.winnerPlace || ""}
       onChange={(e) => onSelectWinner(submission.id, Number(e.target.value))}
     >
       <option value="">Not a winner</option>
       {prizeBreakdown.map((p) => (
         <option key={p.place} value={p.place}>
           {p.place === 1 ? "1st" : p.place === 2 ? "2nd" : `${p.place}th`} Place
         </option>
       ))}
     </select>
   )}
   ```
5. **Add** winner badge display:
   ```tsx
   {submission.isWinner && (
     <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-gold-500 text-black font-bold">
       🏆 {submission.winnerPlace === 1 ? "1st" : submission.winnerPlace === 2 ? "2nd" : `${submission.winnerPlace}th`}
     </div>
   )}
   ```

---

## 5. Stripe Checkout (Prize Pool)

### Goal
Collect prize pool payment when creating campaign.

### File
`src/app/api/payments/create-checkout/route.ts`

### Steps

1. Install Stripe: `npm install stripe`
2. Create `src/lib/stripe.ts`:
   ```typescript
   import Stripe from "stripe";
   export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
   ```
3. Implement checkout session creation
4. On success webhook, set `campaign.isPaid = true` and status to `ACTIVE`

---

## 6. Stripe Connect (Payouts)

### Goal
Pay winners their prize amounts.

### Steps

1. Create Connect account for winners
2. Transfer funds when campaign completes
3. Handle webhook events for transfer status

---

## 7. Dashboard Pages

### `/dashboard`
- Show user's campaigns (as creator)
- Show user's submissions (as participant)
- Show winnings history

### `/submissions`
- Grid of user's submissions across all campaigns
- Filter by campaign, winner status

---

## Priority Order

1. ✅ Schema migration (blocking)
2. ✅ Delete votes API
3. ✅ Create winners API
4. ✅ Update SubmissionGallery
5. 🔜 Stripe Checkout
6. 🔜 Stripe Connect
7. 🔜 Dashboard pages
