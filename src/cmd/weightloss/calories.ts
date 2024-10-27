import { ActivityFactor } from "../../const";
import { bot } from "../../lib/Bot";
import { caloriesMaintain, capitalizeFirstLetter, getWeightDB, withHTMLmarkdown } from "../../lib/utils";
import { Command } from "../../types";
import { Menu, MenuRange } from "@grammyjs/menu";


const menu = new Menu("activity-options");
bot.use(menu)

export const cmd: Command = {
    name: "calories",
    description: "Measure your calories",
    ownerOnly: true,
    async run(ctx) {
        const e = await getWeightDB(ctx);
        if (!e) return;
        const calor = caloriesMaintain(e.weight, e.height, e.age, e.sex)
        let currentActivity: keyof typeof ActivityFactor = "sedentary";

        menu.dynamic(() => {
            const range = new MenuRange()
            for (const i of Object.keys(ActivityFactor)) {
                range.text(() => `${currentActivity == i ? '✅ ' : ''}${capitalizeFirstLetter(i)}`, async ctx => {
                    currentActivity = i as keyof typeof ActivityFactor;

                    const updatedCalor = caloriesMaintain(e.weight, e.height, e.age, e.sex, i as keyof typeof ActivityFactor)
                    await ctx.editMessageText("Here's an updated amount of calories according to your amount of activity!\n" +
                        `Maintain weight: <b>${updatedCalor.maintain}</b> cal\n` +
                        `Weight loss: <b>${updatedCalor.loss}</b> cal\n`,
                        withHTMLmarkdown()
                    )
                })
            }
            range.row()
            range.text("Close", c => c.menu.close())
            return range
        })

        await ctx.reply("Here's how many calories you need to:\n" +
            `Maintain weight: <b>${calor.maintain}</b> cal\n` +
            `Weight loss: <b>${calor.loss}</b> cal\n`, { ...withHTMLmarkdown(), reply_markup: menu }
        )
    },
}