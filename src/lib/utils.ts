import { Context } from "grammy";
import { ParseMode } from "grammy/types";
import { bot, Ctx } from "./Bot";
import { ActivityFactor } from "../const";

export function withReply(ctx: Context) {
    return { reply_parameters: { message_id: ctx.msg?.message_id } }
}

export function withHTMLmarkdown() {
    return { parse_mode: "HTML" as ParseMode }
}

export function capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getAuthorId(ctx: Context) {
    return (ctx.message?.from.id || ctx.msg?.from?.id)!.toString()
}


export function BMIcalculator(weight: number, height: number) {
    return weight / Math.pow(height, 2)
}

export function bodyStatus(BMI: number) {
    let bodyStatus: string = '';
    if (BMI < 20) {
        bodyStatus = "underweight"
    } else if (BMI >= 20 && BMI < 25) {
        bodyStatus = "normal"
    } else if (BMI >= 25 && BMI < 30) {
        bodyStatus = "overweight"
    } else if (BMI >= 30 && BMI < 35) {
        bodyStatus = "obese"
    } else if (BMI >= 35 && BMI < 50) {
        bodyStatus = "extremely obese"
    } else if (BMI >= 50) {
        bodyStatus = "elephant"
    }

    return bodyStatus;
}


export function caloriesMaintain(weight: number, height: number, age: number, sex: boolean, activity: keyof typeof ActivityFactor = "sedentary"): {
    maintain: number,
    loss: number,
} {
    height = height * 100;
    let calculated;
    if (sex) {
        calculated = (10 * weight) + (6.25 * height) - (5 * age) + 5
    } else {
        calculated = (10 * weight) + (6.25 * height) - (5 * age) + 5
    }

    calculated = calculated * ActivityFactor[activity]

    return {
        maintain: calculated - 200,
        loss: Math.round(calculated * 0.8)
    }
}

export async function getWeightDB(ctx: Ctx) {
    const authorid = getAuthorId(ctx)
    if (!authorid) {
        throw new Error("There is nothing sent by author. the first message is from author itself")
    }
    const e = await bot.db.weight.get(authorid)
    if (!e) {
        await ctx.reply("You didn't configure the bot to begin with! Please use /start to configure!")
        return false;
    }
    return e;
}

export function makeid(length: number) {
    let result = "";
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength),
        );
        counter += 1;
    }
    return result;
}

export function isValidTimeZone(tz: string) {
    if (!Intl || !Intl.DateTimeFormat().resolvedOptions().timeZone) {
        throw new Error('Time zones are not available in this environment');
    }

    try {
        Intl.DateTimeFormat(undefined, { timeZone: tz });
        return true;
    } catch {
        return false;
    }
}


export function emojiComparision(oldN: number, newN: number) {
    if (oldN == newN) {
        return "😐"
    } else if (oldN < newN) {
        return "🔺"
    } else {
        return "👍"
    }
}

/**
 * Check for age restriction so that people can't fill out shit. Including minimum age to prevent underage from using it
 * @param age 
 * @param ctx 
 * @returns 
 */
export async function checkAge(age: number, ctx: Ctx) {
    if (age > 120) {
        await ctx.reply("Are you still alive? I don't believe you're this old. Try again")
        return false;
    } else if (age < 16) {
        await ctx.reply("Too young to use this bot... or even use on telegram. Try again")
        return false;
    }
    return true;
}

export function formatHeight(height: number) {
    if (height.toString().length < 3) {
        height = height / 100
    }
    return height
}