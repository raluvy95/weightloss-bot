import { BMIcalculator, bodyStatus, getWeightDB, withHTMLmarkdown } from "../../lib/utils";
import { Command } from "../../types";

export const cmd: Command = {
    name: "bmi",
    description: "Show your BMI",
    async run(ctx) {
        const e = await getWeightDB(ctx);
        if (!e) return;
        const bmi = BMIcalculator(e.weight, e.height)
        await ctx.reply(`Your BMI is <b>${Math.floor(bmi)}</b>\nYou are ${bodyStatus(bmi)}`, withHTMLmarkdown())
    },
}