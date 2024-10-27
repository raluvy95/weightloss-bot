import { Command } from "../../types";

export const cmd: Command = {
    name: "privacy",
    description: "Privacy Policy",
    ownerOnly: true,
    async run(ctx) {
        const privacy = `<b>Privacy Policy</b>

We collect your user id, your age, your weight, your timezone and your biological sex explictly when you configured this bot.
We keep your historical weight, and historical date record for the weight loss reasons.

We don't sell your information to any third party advertising.

If you want to delete your information, you can block this bot or send /deleteme command. Simple as.`
        await ctx.reply(privacy);
    },
}