import { cac } from "cac";
import { config } from "dotenv";
import {
	type ChangePasswordOptions,
	changePassword,
} from "./change-password.ts";
import { type CreateUserOptions, createUser } from "./create-user.ts";
import { type SetLimitsOptions, setLimits } from "./set-limits.ts";

config({ path: [".env.local", ".env"] });

const cli = cac("auth");
let action: Promise<void> | undefined;

cli
	.command("create-user", "Create an email sign-in user")
	.option("--email <email>", "Email address for the new user")
	.option("--name <name>", "Name for the new user")
	.option("--password <password>", "Password (prompted for when omitted)")
	.example(
		'pnpm auth:create-user -- --email "user@example.com" --name "User Name"',
	)
	.action((options: CreateUserOptions) => {
		action = createUser(options);
	});

cli
	.command("change-password", "Change an account password")
	.option("--email <email>", "Email address for the account")
	.option("--password <password>", "New password (prompted for when omitted)")
	.example('pnpm auth:change-password -- --email "user@example.com"')
	.action((options: ChangePasswordOptions) => {
		action = changePassword(options);
	});

cli
	.command("set-limits", "Set a user's deck and card limits")
	.option("--email <email>", "Email address for the account")
	.option("--deck-limit <number>", "Maximum number of decks the user can own")
	.option("--card-limit <number>", "Maximum number of cards per deck")
	.example(
		'pnpm auth:set-limits -- --email "user@example.com" --deck-limit 10 --card-limit 100',
	)
	.action((options: SetLimitsOptions) => {
		action = setLimits(options);
	});

cli.help();

cli.addEventListener("command:*", (event) => {
	const command = (event as CustomEvent<string>).detail;
	console.error(`Unknown auth command: ${command}`);
	process.exitCode = 1;
});

const argv = process.argv.slice();
if (argv[3] === "--") {
	argv.splice(3, 1);
}
const args = argv.slice(2);
cli.parse(argv);

if (args.length === 0) {
	cli.outputHelp();
} else if (action) {
	await action;
}
