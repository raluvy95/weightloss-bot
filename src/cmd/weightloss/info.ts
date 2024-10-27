import { DateTime } from "luxon";
import { emojiComparision, getWeightDB, withHTMLmarkdown } from "../../lib/utils";
import { Command } from "../../types";
import { Menu } from "@grammyjs/menu";
import { bot } from "../../lib/Bot";

const menu = new Menu("info");

bot.use(menu)

export const cmd: Command = {
    name: "info",
    description: "Information about you",
    ownerOnly: true,
    async run(ctx) {
        const db = await getWeightDB(ctx)
        if (!db) return;

        const time = DateTime.fromJSDate(new Date(db.date)).setZone(db.timezone);
        const history = db.history || []
        let msg = "Your weight loss journey\n\n" +
            `Your weight: <b>${db.weight} kg</b>\n` +
            `Last time you saved your weight: <b>${time.toLocaleString()}</b> (${time.toRelative()})\n\n`


        if (history.length < 1) {
            msg += "No history recorded."
        } else {
            if (db.weight > history[0].weight) {
                msg += `You gained <b>${db.weight - history[0].weight}</b> kg, more than you first recorded for your weight`
            } else if (db.weight < history[0].weight) {
                msg += `You lost <b>${history[0].weight - db.weight}</b> kg, less than you first recorded for your weight`
            } else {
                msg += `Your weight remainds the same as when you first recorded.`
            }
            let temphistory = 0;
            msg += "\n\nHistory:\n"
            for (const h of history.sort((a, b) => b.date - a.date).slice(0, 5)) {
                const date = DateTime.fromJSDate(new Date(h.date)).setZone(db.timezone);
                msg += `${emojiComparision(h.weight, temphistory)}: ${date.toLocaleString(DateTime.DATETIME_SHORT)} - <b>${h.weight}</b>kg\n`
                temphistory = h.weight;
            }
        }

        await ctx.reply(msg, withHTMLmarkdown())
    },
}