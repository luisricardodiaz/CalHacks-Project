import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createTask = mutation({
  args: { unique_id: v.string(), environment: v.string(), time_of_day: v.string(), added_at: v.string(), added_by: v.any(), is_local: v.boolean(), primary_color: v.any(), track: v.any(), video_thumbnail: v.any()},
  handler: async (ctx, args) => {
    const taskId = await ctx.db.insert(args.unique_id, { environment: args.environment, time_of_day: args.time_of_day, added_at: args.added_at, added_by: args.added_by, is_local: args.is_local, primary_color: args.primary_color, track: args.track, video_thumbnail: args.video_thumbnail });
    // do something with `taskId`
    return taskId;
  },
});