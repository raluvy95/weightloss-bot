import { Conversation, createConversation } from "@grammyjs/conversations";
import { Command } from "../../types";
import { bot, Ctx } from "../../lib/Bot";
import { withHTMLmarkdown } from "../../lib/utils";
import { InlineKeyboard } from "grammy";

type Conv = Conversation<Ctx>;

async function confirm(conv: Conv, ctx: Ctx) {
    async function makeid(length: number) {
        let result = "";
        const characters =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
            result += characters.charAt(
                Math.floor(await conv.random() * charactersLength),
            );
            counter += 1;
        }
        return result;
    }
    const id = await makeid(6);
    const menu = new InlineKeyboard().text("Cancel", "cancel")
    await ctx.reply(`Are you sure you want to delete your information from this bot? <b>All of your information, including your weight loss history</b> will be LOST!!!!!!!\n\nPlease type <code>${id}</code> to confirm! Send anything else to cancel!`,
        { ...withHTMLmarkdown(), reply_markup: menu });
    const response = await conv.wait()

    if (response.update.message?.text === id) {
        await conv.external(async () => await bot.db.weight.delete(response.update.message?.from.id.toString() as string))
        await ctx.reply("<b>Successfully deleted!</b> It's too late to undo it now.\nStart over with /start command", withHTMLmarkdown())
    } else {
        await ctx.reply("<b>Aborted!</b>", withHTMLmarkdown())
    }
}

bot.use(createConversation(confirm))

export const cmd: Command = {
    name: "deleteme",
    description: "Delete all of your data from the database.",
    ownerOnly: true,
    async run(ctx) {
        await ctx.conversation.enter("confirm");
    },
}