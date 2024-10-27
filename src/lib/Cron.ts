import { CronJob } from "cron";
import { bot } from "./Bot";
import { UserStorage } from "../types";
import { InlineKeyboard } from "grammy";
import { withHTMLmarkdown } from "./utils";
import { DateTime } from "luxon";

export class WeightReminder extends CronJob {
    constructor(user: UserStorage & { id: number }) {
        const dayofweek = DateTime.fromJSDate(new Date(user.date)).setZone(user.timezone).weekday
        const scheldules = `0 0 6 * * ${isNaN(dayofweek) ? '1' : dayofweek}`
        super(scheldules, async () => {
            if (user.disableNotify) return;
            const btn = new InlineKeyboard()
                .text("Send your weight", "send-weight")
            try {
                await bot.api.sendMessage(user.id, "<b>It's time to count your weight!</b>\nClick on this button and send your weight right NOW!\n", { ...withHTMLmarkdown(), reply_markup: btn })
            } catch { /* empty */ }

            await bot.db.weight.set(`${user.id}.didCountTheirWeightToday`, false)
        },
            null,
            false,
            user.timezone)
    }
}

export class ForgottenReminder extends CronJob {
    constructor() {
        const scheldule = "0 0 */2 * * *"
        super(scheldule, async () => {
            for (const users of await bot.db.weight.all()) {
                if (users.value.disableNotify) continue;
                if (!users.value.didCountTheirWeightToday) {
                    const btn = new InlineKeyboard()
                        .text("Send your weight count", "send-weight")
                    await bot.api.sendMessage(users.id, "<b>Reminder!</b> Please count your weight by pressing this button!", { ...withHTMLmarkdown(), reply_markup: btn })
                }
            }
        },
            null,
            true,
        )
    }
}