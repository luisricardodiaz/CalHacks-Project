import { query } from "./_generated/server"
import { v } from "convex/values";

export const get = query({
    args: {tableName: v.string()},
    handler: async (ctx, args) => {
        return await ctx.db.query(args.tableName)
        .take(5)
    }
})