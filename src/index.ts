import { run } from "@grammyjs/runner";
import { bot, Ctx } from "./lib/Bot";
import { GrammyError, HttpError } from "grammy";
import { stdout } from "process";
import { Conversation, createConversation } from "@grammyjs/conversations";
import { withHTMLmarkdown } from "./lib/utils";
import { compareWeight } from "./lib/weightinfo";

const runner = run(bot);

(async () => {
    await bot.initCommand()
})()

const stopRunner = () => runner.isRunning() && runner.stop();

bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError) {
        console.error("Error in request:", e.description);
    } else if (e instanceof HttpError) {
        console.error("Could not contact Telegram:", e);
    } else {
        console.error("Unknown error:", e);
    }
});

type Conv = Conversation<Ctx>;

async function sendWeight(conv: Conv, ctx: Ctx) {
    const userdata = await conv.external(async () => {
        const e = await bot.db.weight.get(ctx.callbackQuery!.from.id.toString())
        if (!e) {
            await ctx.reply("You didn't configure the bot yet! Please use /start to configure!")
            return false
        } else {
            return e
        }
    })
    if (!userdata) return;

    if (userdata.didCountTheirWeightToday) {
        await ctx.reply("You already saved your weight this week!")
        return
    }
    await ctx.reply("Please input your weight in kilograms. (Eg. 80.1 or 80)")

    const weight = await conv.form.number()
    const oldWeight = userdata.weight;

    if (weight > oldWeight + 10 || weight < oldWeight - 10) {
        await ctx.reply("I can't believe you lost this much!\nIf this is actually your weight, please contact a doctor immediatelly!")
        return
    }

    if (!userdata.history) {
        userdata.history = [{ weight: userdata.weight, date: userdata.date }]
    } else {
        userdata.history.push({ weight: userdata.weight, date: userdata.date })
    }
    userdata.weight = weight
    userdata.date = await conv.now()
    userdata.didCountTheirWeightToday = true;

    await conv.external(async () => await bot.db.weight.set(ctx.callbackQuery!.from.id.toString(), userdata))
    const msg = compareWeight(oldWeight, weight, userdata.height)

    await ctx.reply(msg, withHTMLmarkdown())

    return;
}

bot.use(createConversation(sendWeight))

bot.callbackQuery("send-weight", async (ctx) => {
    await ctx.conversation.enter("sendWeight")
})

bot.on("my_chat_member", async (member) => {
    const shortern = member.update.my_chat_member
    const old_status = shortern.old_chat_member.status
    const new_status = shortern.new_chat_member.status
    if (old_status === new_status) return;

    if (new_status == "kicked") {
        const id = shortern.from.id.toString()
        await bot.db.weight.delete(id)
        console.log(`Member ID (${id}) blocked the bot, so I deleted all of their information.`)
    }
})

async function stop() {
    await stopRunner()
    stdout.write("\n\nQuitting...")
}
process.once("SIGINT", stop);
process.once("SIGTERM", stop);
