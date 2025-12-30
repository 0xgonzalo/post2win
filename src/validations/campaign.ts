import { z } from "zod";

export const campaignSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters").max(100),
    description: z.string().min(20, "Description must be at least 20 characters").max(2000),
    coverImage: z.string().url("Please upload a cover image"),
    eventName: z.string().min(3, "Event name is required"),
    eventDate: z.date({
        required_error: "Event date is required",
    }),
    eventLocation: z.string().min(3, "Event location is required"),
    category: z.string().min(1, "Please select a category"),

    // Prize Pool
    prizePool: z.coerce.number().min(10, "Minimum prize pool is $10"),
    prizeBreakdown: z.array(z.object({
        place: z.number(),
        percentage: z.number().min(1).max(100),
    })).min(1, "At least one prize is required"),

    // Timeline
    startDate: z.date(),
    endDate: z.date(),
    votingEndDate: z.date(),

    // Rules
    maxSubmissions: z.coerce.number().min(1).max(10),
    allowedTypes: z.array(z.string()).min(1, "Select at least one allowed media type"),
    maxFileSize: z.coerce.number().min(1).max(100),
}).refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
}).refine((data) => data.votingEndDate > data.endDate, {
    message: "Voting end date must be after submission end date",
    path: ["votingEndDate"],
});

export type CampaignSchema = z.infer<typeof campaignSchema>;
