import { PrismaClient, Role, CampaignStatus, MediaType, PayoutStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

const DAY = 86400000;

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * DAY);
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * DAY);
}

// Cloudinary demo/sample images for mock data
const sampleImages = [
  "https://res.cloudinary.com/demo/image/upload/v1/samples/people/smiling-man",
  "https://res.cloudinary.com/demo/image/upload/v1/samples/people/jazz",
  "https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/nature-mountains",
  "https://res.cloudinary.com/demo/image/upload/v1/samples/food/spices",
  "https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/beach-boat",
  "https://res.cloudinary.com/demo/image/upload/v1/samples/animals/three-dogs",
  "https://res.cloudinary.com/demo/image/upload/v1/samples/people/bicycle",
  "https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/architecture-signs",
  "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/shoes",
  "https://res.cloudinary.com/demo/image/upload/v1/samples/food/pot-mussels",
  "https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/girl-urban-view",
  "https://res.cloudinary.com/demo/image/upload/v1/samples/people/kitchen-bar",
];

const coverImages = [
  "https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/nature-mountains",
  "https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/beach-boat",
  "https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/architecture-signs",
  "https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/girl-urban-view",
  "https://res.cloudinary.com/demo/image/upload/v1/samples/food/spices",
];

// Deterministic IDs for idempotent seeding
const IDS = {
  creator: "seed_user_creator_001",
  participant1: "seed_user_participant_001",
  participant2: "seed_user_participant_002",
  campaign1: "seed_campaign_rolling_loud",
  campaign2: "seed_campaign_nba_allstar",
  campaign3: "seed_campaign_coachella",
  campaign4: "seed_campaign_artbasel",
  campaign5: "seed_campaign_techcrunch",
};

async function main() {
  console.log("🌱 Seeding database...\n");

  // --- USERS ---
  const creator = await prisma.user.upsert({
    where: { email: "alex.rivera@demo.com" },
    update: {},
    create: {
      id: IDS.creator,
      email: "alex.rivera@demo.com",
      name: "Alex Rivera",
      avatar: "https://res.cloudinary.com/demo/image/upload/v1/samples/people/smiling-man",
      role: Role.CREATOR,
      stripeAccountId: "acct_demo_creator_001",
    },
  });
  console.log(`✅ Creator: ${creator.name} (${creator.email})`);

  const participant1 = await prisma.user.upsert({
    where: { email: "jordan.chen@demo.com" },
    update: {},
    create: {
      id: IDS.participant1,
      email: "jordan.chen@demo.com",
      name: "Jordan Chen",
      avatar: "https://res.cloudinary.com/demo/image/upload/v1/samples/people/jazz",
      role: Role.USER,
    },
  });
  console.log(`✅ Participant: ${participant1.name} (${participant1.email})`);

  const participant2 = await prisma.user.upsert({
    where: { email: "sam.williams@demo.com" },
    update: {},
    create: {
      id: IDS.participant2,
      email: "sam.williams@demo.com",
      name: "Sam Williams",
      avatar: "https://res.cloudinary.com/demo/image/upload/v1/samples/people/bicycle",
      role: Role.USER,
      stripeAccountId: "acct_demo_participant_002",
    },
  });
  console.log(`✅ Participant: ${participant2.name} (${participant2.email})`);

  // --- CAMPAIGN 1: ACTIVE (Music, started 5 days ago, ends in 10 days) ---
  const campaign1 = await prisma.campaign.upsert({
    where: { slug: "rolling-loud-miami-2026-best-crowd-shots" },
    update: {},
    create: {
      id: IDS.campaign1,
      title: "Rolling Loud Miami 2026 - Best Crowd Shots",
      slug: "rolling-loud-miami-2026-best-crowd-shots",
      description:
        "Capture the energy of Rolling Loud Miami! We're looking for the most electrifying crowd shots that show what it's like to be in the pit. Best photos win big.",
      coverImage: coverImages[0],
      eventName: "Rolling Loud Miami 2026",
      eventDate: daysAgo(3),
      eventLocation: "Hard Rock Stadium, Miami Gardens, FL",
      category: "Music",
      prizePool: new Decimal("5000.00"),
      prizeBreakdown: [{ place: 1, percentage: 100 }],
      currency: "USD",
      maxSubmissions: 5,
      allowedTypes: ["image", "video"],
      maxFileSize: 50,
      startDate: daysAgo(5),
      endDate: daysFromNow(10),
      votingEndDate: daysFromNow(13),
      isPaid: true,
      stripePaymentId: "pi_demo_rolling_loud",
      status: CampaignStatus.ACTIVE,
      creatorId: IDS.creator,
    },
  });
  console.log(`✅ Campaign 1: ${campaign1.title} [${campaign1.status}]`);

  // --- CAMPAIGN 2: ACTIVE (Sports, near deadline) ---
  const campaign2 = await prisma.campaign.upsert({
    where: { slug: "nba-all-star-weekend-fan-cam" },
    update: {},
    create: {
      id: IDS.campaign2,
      title: "NBA All-Star Weekend Fan Cam",
      slug: "nba-all-star-weekend-fan-cam",
      description:
        "The NBA All-Star Weekend is here! Show us your best fan moments - courtside reactions, halftime show captures, or celebrity sightings. Top content wins $10,000!",
      coverImage: coverImages[1],
      eventName: "NBA All-Star Weekend 2026",
      eventDate: daysAgo(1),
      eventLocation: "Chase Center, San Francisco, CA",
      category: "Sports",
      prizePool: new Decimal("10000.00"),
      prizeBreakdown: [{ place: 1, percentage: 100 }],
      currency: "USD",
      maxSubmissions: 3,
      allowedTypes: ["image", "video"],
      maxFileSize: 100,
      startDate: daysAgo(7),
      endDate: daysFromNow(2),
      votingEndDate: daysFromNow(5),
      isPaid: true,
      stripePaymentId: "pi_demo_nba_allstar",
      status: CampaignStatus.ACTIVE,
      creatorId: IDS.creator,
    },
  });
  console.log(`✅ Campaign 2: ${campaign2.title} [${campaign2.status}]`);

  // --- CAMPAIGN 3: COMPLETED (Festival, winners selected) ---
  const campaign3 = await prisma.campaign.upsert({
    where: { slug: "coachella-golden-hour-gallery" },
    update: {},
    create: {
      id: IDS.campaign3,
      title: "Coachella Golden Hour Gallery",
      slug: "coachella-golden-hour-gallery",
      description:
        "Golden hour at Coachella hits different. Submit your best sunset-lit festival photos from this year's event. Artistic shots, silhouettes, and light play encouraged.",
      coverImage: coverImages[2],
      eventName: "Coachella 2026",
      eventDate: daysAgo(20),
      eventLocation: "Empire Polo Club, Indio, CA",
      category: "Festival",
      prizePool: new Decimal("7500.00"),
      prizeBreakdown: [
        { place: 1, percentage: 50 },
        { place: 2, percentage: 30 },
        { place: 3, percentage: 20 },
      ],
      currency: "USD",
      maxSubmissions: 5,
      allowedTypes: ["image"],
      maxFileSize: 50,
      startDate: daysAgo(25),
      endDate: daysAgo(10),
      votingEndDate: daysAgo(5),
      isPaid: true,
      stripePaymentId: "pi_demo_coachella",
      status: CampaignStatus.COMPLETED,
      creatorId: IDS.creator,
    },
  });
  console.log(`✅ Campaign 3: ${campaign3.title} [${campaign3.status}]`);

  // --- CAMPAIGN 4: DRAFT (Art, future dates, unpaid) ---
  const campaign4 = await prisma.campaign.upsert({
    where: { slug: "artbasel-digital-perspectives" },
    update: {},
    create: {
      id: IDS.campaign4,
      title: "ArtBasel Digital Perspectives",
      slug: "artbasel-digital-perspectives",
      description:
        "Document the intersection of digital art and physical space at Art Basel Miami. We want your unique takes on installations, interactive exhibits, and the people experiencing them.",
      coverImage: coverImages[3],
      eventName: "Art Basel Miami Beach 2026",
      eventDate: daysFromNow(45),
      eventLocation: "Miami Beach Convention Center, Miami, FL",
      category: "Art & Culture",
      prizePool: new Decimal("3000.00"),
      prizeBreakdown: [
        { place: 1, percentage: 60 },
        { place: 2, percentage: 40 },
      ],
      currency: "USD",
      maxSubmissions: 3,
      allowedTypes: ["image", "video"],
      maxFileSize: 50,
      startDate: daysFromNow(40),
      endDate: daysFromNow(55),
      votingEndDate: daysFromNow(60),
      isPaid: false,
      status: CampaignStatus.DRAFT,
      creatorId: IDS.creator,
    },
  });
  console.log(`✅ Campaign 4: ${campaign4.title} [${campaign4.status}]`);

  // --- CAMPAIGN 5: PENDING_PAYMENT (Tech, waiting for Stripe) ---
  const campaign5 = await prisma.campaign.upsert({
    where: { slug: "techcrunch-disrupt-hallway-moments" },
    update: {},
    create: {
      id: IDS.campaign5,
      title: "TechCrunch Disrupt Hallway Moments",
      slug: "techcrunch-disrupt-hallway-moments",
      description:
        "The best stories at TechCrunch happen in the hallways. Capture candid moments, surprise meetings, impromptu pitches, and the energy between sessions.",
      coverImage: coverImages[4],
      eventName: "TechCrunch Disrupt 2026",
      eventDate: daysFromNow(20),
      eventLocation: "Moscone Center, San Francisco, CA",
      category: "Art & Culture",
      prizePool: new Decimal("2500.00"),
      prizeBreakdown: [{ place: 1, percentage: 100 }],
      currency: "USD",
      maxSubmissions: 5,
      allowedTypes: ["image", "video"],
      maxFileSize: 25,
      startDate: daysFromNow(18),
      endDate: daysFromNow(30),
      votingEndDate: daysFromNow(35),
      isPaid: false,
      status: CampaignStatus.PENDING_PAYMENT,
      creatorId: IDS.creator,
    },
  });
  console.log(`✅ Campaign 5: ${campaign5.title} [${campaign5.status}]`);

  // --- SUBMISSIONS for Campaign 1 (Rolling Loud - 4 submissions) ---
  const campaign1Submissions = [
    {
      id: "seed_sub_rl_001",
      mediaUrl: sampleImages[0],
      mediaType: MediaType.IMAGE,
      title: "Mosh pit energy",
      description: "The crowd went absolutely wild during Travis Scott's set",
      userId: IDS.participant1,
      campaignId: IDS.campaign1,
      createdAt: daysAgo(4),
    },
    {
      id: "seed_sub_rl_002",
      mediaUrl: sampleImages[1],
      mediaType: MediaType.IMAGE,
      title: "Hands in the air",
      description: "Everyone's hands up during the drop",
      userId: IDS.participant1,
      campaignId: IDS.campaign1,
      createdAt: daysAgo(3),
    },
    {
      id: "seed_sub_rl_003",
      mediaUrl: sampleImages[2],
      mediaType: MediaType.IMAGE,
      title: "Stage lights panorama",
      description: "The light show was insane from the back of the crowd",
      userId: IDS.participant2,
      campaignId: IDS.campaign1,
      createdAt: daysAgo(3),
    },
    {
      id: "seed_sub_rl_004",
      mediaUrl: sampleImages[3],
      mediaType: MediaType.IMAGE,
      title: "VIP section vibes",
      description: "Caught this shot from the elevated platform",
      userId: IDS.participant2,
      campaignId: IDS.campaign1,
      createdAt: daysAgo(2),
    },
  ];

  for (const sub of campaign1Submissions) {
    await prisma.submission.upsert({
      where: { id: sub.id },
      update: {},
      create: sub,
    });
  }
  console.log(`  📸 Campaign 1: ${campaign1Submissions.length} submissions`);

  // --- SUBMISSIONS for Campaign 2 (NBA All-Star - 8 submissions) ---
  const campaign2Submissions = [
    {
      id: "seed_sub_nba_001",
      mediaUrl: sampleImages[4],
      mediaType: MediaType.IMAGE,
      title: "Courtside reactions",
      description: "The reactions when Steph hit that 3-pointer",
      userId: IDS.participant1,
      campaignId: IDS.campaign2,
      createdAt: daysAgo(5),
    },
    {
      id: "seed_sub_nba_002",
      mediaUrl: sampleImages[5],
      mediaType: MediaType.IMAGE,
      title: "Halftime show moment",
      description: "Kendrick brought the house down",
      userId: IDS.participant1,
      campaignId: IDS.campaign2,
      createdAt: daysAgo(4),
    },
    {
      id: "seed_sub_nba_003",
      mediaUrl: sampleImages[6],
      mediaType: MediaType.IMAGE,
      title: "Celebrity row",
      description: "Spotted some A-listers in the front row",
      userId: IDS.participant2,
      campaignId: IDS.campaign2,
      createdAt: daysAgo(4),
    },
    {
      id: "seed_sub_nba_004",
      mediaUrl: sampleImages[7],
      mediaType: MediaType.IMAGE,
      title: "Dunk contest winner",
      description: "The winning dunk from above",
      userId: IDS.participant2,
      campaignId: IDS.campaign2,
      createdAt: daysAgo(3),
    },
    {
      id: "seed_sub_nba_005",
      mediaUrl: sampleImages[8],
      mediaType: MediaType.IMAGE,
      title: "Fan tunnel entrance",
      description: "The energy walking in was electric",
      userId: IDS.participant1,
      campaignId: IDS.campaign2,
      createdAt: daysAgo(3),
    },
    {
      id: "seed_sub_nba_006",
      mediaUrl: sampleImages[9],
      mediaType: MediaType.IMAGE,
      title: "Skills challenge behind the scenes",
      description: "Got backstage access for this one",
      userId: IDS.participant2,
      campaignId: IDS.campaign2,
      createdAt: daysAgo(2),
    },
    {
      id: "seed_sub_nba_007",
      mediaUrl: sampleImages[10],
      mediaType: MediaType.IMAGE,
      title: "Final buzzer celebration",
      description: "The moment Team LeBron won",
      userId: IDS.participant1,
      campaignId: IDS.campaign2,
      createdAt: daysAgo(1),
    },
    {
      id: "seed_sub_nba_008",
      mediaUrl: sampleImages[11],
      mediaType: MediaType.IMAGE,
      title: "Post-game confetti",
      description: "Confetti raining down on the court",
      userId: IDS.participant2,
      campaignId: IDS.campaign2,
      createdAt: daysAgo(1),
    },
  ];

  for (const sub of campaign2Submissions) {
    await prisma.submission.upsert({
      where: { id: sub.id },
      update: {},
      create: sub,
    });
  }
  console.log(`  📸 Campaign 2: ${campaign2Submissions.length} submissions`);

  // --- SUBMISSIONS for Campaign 3 (Coachella - 6 submissions, 3 winners) ---
  const campaign3Submissions = [
    {
      id: "seed_sub_coach_001",
      mediaUrl: sampleImages[2],
      mediaType: MediaType.IMAGE,
      title: "Desert sunset silhouette",
      description: "The Ferris wheel at golden hour",
      userId: IDS.participant1,
      campaignId: IDS.campaign3,
      isWinner: true,
      winnerPlace: 1,
      prizeAmount: new Decimal("3750.00"),
      createdAt: daysAgo(22),
    },
    {
      id: "seed_sub_coach_002",
      mediaUrl: sampleImages[10],
      mediaType: MediaType.IMAGE,
      title: "Art installation glow",
      description: "The Spectra tower during the magic hour",
      userId: IDS.participant2,
      campaignId: IDS.campaign3,
      isWinner: true,
      winnerPlace: 2,
      prizeAmount: new Decimal("2250.00"),
      createdAt: daysAgo(21),
    },
    {
      id: "seed_sub_coach_003",
      mediaUrl: sampleImages[4],
      mediaType: MediaType.IMAGE,
      title: "Main stage light beams",
      description: "The stage lights cutting through the dust at sunset",
      userId: IDS.participant1,
      campaignId: IDS.campaign3,
      isWinner: true,
      winnerPlace: 3,
      prizeAmount: new Decimal("1500.00"),
      createdAt: daysAgo(20),
    },
    {
      id: "seed_sub_coach_004",
      mediaUrl: sampleImages[7],
      mediaType: MediaType.IMAGE,
      title: "Crowd from above",
      description: "Drone shot of the crowd at dusk",
      userId: IDS.participant2,
      campaignId: IDS.campaign3,
      createdAt: daysAgo(19),
    },
    {
      id: "seed_sub_coach_005",
      mediaUrl: sampleImages[0],
      mediaType: MediaType.IMAGE,
      title: "Dancing in the dust",
      description: "The dust clouds made everything look magical",
      userId: IDS.participant1,
      campaignId: IDS.campaign3,
      createdAt: daysAgo(18),
    },
    {
      id: "seed_sub_coach_006",
      mediaUrl: sampleImages[5],
      mediaType: MediaType.IMAGE,
      title: "Sahara tent rays",
      description: "Sun rays breaking into the Sahara tent",
      userId: IDS.participant2,
      campaignId: IDS.campaign3,
      createdAt: daysAgo(17),
    },
  ];

  for (const sub of campaign3Submissions) {
    await prisma.submission.upsert({
      where: { id: sub.id },
      update: {},
      create: sub,
    });
  }
  console.log(`  📸 Campaign 3: ${campaign3Submissions.length} submissions (3 winners)`);

  // --- PAYOUTS for Campaign 3 winners ---
  const payouts = [
    {
      id: "seed_payout_001",
      amount: new Decimal("3750.00"),
      currency: "USD",
      status: PayoutStatus.COMPLETED,
      stripeTransferId: "tr_demo_coachella_1st",
      userId: IDS.participant1,
      processedAt: daysAgo(4),
    },
    {
      id: "seed_payout_002",
      amount: new Decimal("2250.00"),
      currency: "USD",
      status: PayoutStatus.COMPLETED,
      stripeTransferId: "tr_demo_coachella_2nd",
      userId: IDS.participant2,
      processedAt: daysAgo(4),
    },
    {
      id: "seed_payout_003",
      amount: new Decimal("1500.00"),
      currency: "USD",
      status: PayoutStatus.PENDING,
      userId: IDS.participant1,
    },
  ];

  for (const payout of payouts) {
    await prisma.payout.upsert({
      where: { id: payout.id },
      update: {},
      create: payout,
    });
  }
  console.log(`  💰 ${payouts.length} payouts created for Campaign 3`);

  console.log("\n✨ Seeding complete!");
  console.log(`
Summary:
  - 3 users (1 creator, 2 participants)
  - 5 campaigns (2 ACTIVE, 1 COMPLETED, 1 DRAFT, 1 PENDING_PAYMENT)
  - 18 submissions total
  - 3 payouts (2 completed, 1 pending)
  `);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
