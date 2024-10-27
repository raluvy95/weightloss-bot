import { config } from "dotenv";
config()

import { Bot, Context, session } from "grammy";
import { autoRetry } from "@grammyjs/auto-retry";
import { readdir } from "fs/promises";
import { Command, UserStorage } from "../types";
import { QuickDB } from "quick.db";
import { HydrateFlavor } from "@grammyjs/hydrate";
import { ConversationFlavor, conversations } from "@grammyjs/conversations";
import { CronJob } from "cron";
import { ForgottenReminder, WeightReminder } from "./Cron";

export type Ctx = HydrateFlavor<Context & ConversationFlavor>;


const databases = {
    weight: new QuickDB<UserStorage>({
        filePath: ".db.sqlite3",
        table: "weight"
    })
}

class FatassBot extends Bot<Ctx> {
    public commands: Command[] = [];
    public db = databases;
    public scheldules: Map<string, CronJob> = new Map();

    constructor() {
        if (!process.env.TELEGRAM_TOKEN) throw new Error("You must provide your telegram bot's token. (Missing .env file?)");
        super(process.env.TELEGRAM_TOKEN);
        this.api.config.use(autoRetry());

        this.use(session({
            initial: () => ({})
        }))

        this.use(conversations())
    }

    async initCommand() {
        await this.init()

        this.commands = [];

        console.log(`Logged as ${this.botInfo.username}`)

        const commandDir = "./src/cmd"
        const dir = await readdir(commandDir);

        const cmdsAPI = []
        for (const modules of dir) {
            if (modules == "lastfm" && !process.env.NO_LASTFM) {
                continue
            }
            const mod = await readdir(`${commandDir}/${modules}`)
            for (const cmds of mod) {

                const cmd = (await import(`${__dirname}/../../${commandDir}/${modules}/${cmds}`)).cmd as Command

                if (cmd === undefined) continue;

                this.addCommand({ ...cmd, module: modules });

                cmdsAPI.push({ command: cmd.name, description: cmd.description || "No description provided" })
                this.command(cmd.name, cmd.run)
            }
        }
        await this.api.setMyCommands(cmdsAPI);

        for (const users of await bot.db.weight.all()) {
            const cron = new WeightReminder({ ...users.value, id: Number(users.id) })
            cron.start()
            this.scheldules.set(users.id, cron)
        }

        new ForgottenReminder()
    }

    addCommand(cmd: Command) {
        if (this.commands.find(x => x.name == cmd.name)) {
            console.error("Cannot add command that has same name as existing command")
            return;
        }
        this.commands.push(cmd);
        console.info(`Added ${cmd.name} command`)
    }

    async runCommand(name: string, ctx: Ctx) {
        const command = this.commands.find(x => x.name == name);
        if (!command) {
            return;
        }
        await command.run(ctx);
    }

    removeCommand(name: string) {
        const found = this.commands.findIndex(x => x.name == name)
        if (found > -1) {
            this.commands.splice(found, 1);
        } else {
            console.error("Already removed");
        }
    }
}
export const bot = new FatassBot()