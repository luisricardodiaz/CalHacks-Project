import { query } from "./_generated/server"
import { v } from "convex/values";

export const get = query({
    args: {tableName: v.string(), environment: v.string(), timeOfDay: v.string()},
    handler: async (ctx, args) => {
        return await ctx.db.query(args.tableName)
        .filter((q) => q.eq(q.field("time_of_day"), args.timeOfDay))
        .filter((q) => q.eq(q.field("environment"), args.environment))
        .collect()
    }
})