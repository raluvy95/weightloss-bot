import { Conversation, createConversation } from "@grammyjs/conversations";
import { Command, UserStorage } from "../../types";
import { bot, Ctx } from "../../lib/Bot";
import { InlineKeyboard, Keyboard } from "grammy";
import { BMIcalculator, bodyStatus, checkAge, getAuthorId, isValidTimeZone, withHTMLmarkdown } from "../../lib/utils";
import { infoDependingOnBMI } from "../../lib/weightinfo";
import { WeightReminder } from "../../lib/Cron";

type Conv = Conversation<Ctx>;

async function setup(conv: Conv, ctx: Ctx) {

    async function actualSetup() {
        const userdata: UserStorage = {
            weight: 0,
            height: 0,
            sex: false,
            age: 0,
            timezone: "",
            date: 0
        }

        await ctx.reply("Alright, please input your weight in kilogram (kg). E.g. 60")
        const weight = await conv.form.int(ctx => ctx.reply("Only numbers please!"))
        userdata.weight = weight

        await ctx.reply("Good. Now tell us a little bit more about you! Please provide your height in centimeter (m). E.g. 168")
        let height = await conv.form.number(ctx => ctx.reply("Only numbers please!"))
        if (height.toString().length === 3) {
            height = height / 100
        }
        userdata.height = height

        await ctx.reply("How old are you?")
        const age = await conv.form.int(ctx => ctx.reply("Only numbers please!"))

        const pass = checkAge(age, ctx);
        if (!pass) return;

        userdata.age = age

        const keyboard = new Keyboard()
            .text("♂️ Male").row()
            .text("♀️ Female").row()
            .oneTime()

        await ctx.reply("Good! Are you male or female? I'm asking for your biological sex, not your gender.", { reply_markup: { ...keyboard, remove_keyboard: true } })
        const { msg: { text: gender } } = await conv.waitFor("msg:text")
        let sex;
        switch (gender) {
            case "♀️ Female":
                sex = false;
                break;
            default:
                sex = true;
                break;
        }
        userdata.sex = sex

        await ctx.reply("What's your timezone? We want to remind to count your weight!")
        const timezone = await conv.waitUntil(c => !!c.msg?.text && isValidTimeZone(c.msg.text), { otherwise: (c) => c.reply("Invalid timezone, try again.") })
        /*
            This will occur in the most rare bug ever. Blame cosmic rays.
        */
        if (!timezone.msg?.text) {
            await ctx.reply("there was weird error, please start over.")
            return
        }

        userdata.timezone = timezone.msg.text

        userdata.date = await conv.now()
        const BMI = BMIcalculator(weight, height);
        const bodyS = bodyStatus(BMI);

        await ctx.reply(`Your BMI calculator: ${Math.floor(BMI)}\nYou are <b>${bodyS.toUpperCase()}</b>!\n\n${infoDependingOnBMI(BMI)}\nP.S. If the informattion you provided was incorrect, you can start over via /start`, withHTMLmarkdown())

        await conv.external(async () => await bot.db.weight.set(getAuthorId(ctx), userdata))
        await conv.external(() => {
            if (!bot.scheldules.has(getAuthorId(ctx))) {
                const cron = new WeightReminder({ ...userdata, id: Number(getAuthorId(ctx)) })
                cron.start()
                bot.scheldules.set(getAuthorId(ctx), cron)
            }
        })
        return;

    }

    const menu = new InlineKeyboard().text("Setup the bot now!", "inputkg").text("Quit", "exit")
    const msg = await ctx.reply("Hello! Welcome to the weight loss bot!\n" +
        "\nBefore we start, we need some information required to measure your BMI, your calories and to remind you accurately."
        + "\nWe truly respect your privacy and we don't ask for your personal information!\n\n"
        + "This bot only supports metric system for both height (cm) and weight (kg)"
        + "\n\nTo setup this bot, press 'Setup the bot now!'.", { reply_markup: menu })
    const response = await conv.waitForCallbackQuery(["inputkg", "exit"], { drop: true, maxMilliseconds: 1000 * 25 })
    switch (response.match) {
        case "inputkg":
            await actualSetup()
            break;
        case "exit":
            await bot.api.deleteMessage(msg.chat.id, msg.message_id)
            break;
    }
    return;
}

bot.use(createConversation(setup));

export const cmd: Command = {
    name: "start",
    description: "Setup the bot",
    ownerOnly: true,
    async run(ctx) {
        await ctx.conversation.enter("setup")
    },
}