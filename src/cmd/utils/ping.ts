import { Command } from "../../types";

export const cmd: Command = {
    name: "ping",
    description: "pong",
    ownerOnly: true,
    async run(ctx) {
        await ctx.reply("pong");
    },
}