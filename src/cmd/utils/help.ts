import { commandDir } from "../../const";
import { capitalizeFirstLetter, withHTMLmarkdown } from "../../lib/utils";
import { bot } from "../../lib/Bot";
import { Command } from "../../types";
import { readdir } from "fs/promises";

export const cmd: Command = {
    name: "help",
    description: "Help command",
    ownerOnly: true,
    async run(ctx) {
        const mod = await readdir(commandDir)
        const commands = bot.commands
        let reply = `${commands.length} commands listed\n`

        for (const m of mod) {
            reply += `\n<b>${capitalizeFirstLetter(m)}</b>\n`
            for (const c of commands.filter(a => a.module == m)) {
                reply += `/${c.name} - ${!c.description ? '<i>No description</i>' : c.description}\n`
            }
        }

        await ctx.reply(reply, withHTMLmarkdown());
    },
}