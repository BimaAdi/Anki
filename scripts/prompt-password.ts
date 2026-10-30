export async function promptForPassword(label: string) {
	if (!process.stdin.isTTY) {
		throw new Error(
			"Use --password when running without an interactive terminal.",
		);
	}

	return new Promise<string>((resolve, reject) => {
		let password = "";
		const input = process.stdin;
		const finish = (error?: Error) => {
			input.setRawMode(false);
			input.pause();
			input.off("data", onData);
			process.stdout.write("\n");
			if (error) reject(error);
			else resolve(password);
		};
		const onData = (chunk: Buffer | string) => {
			for (const character of chunk.toString()) {
				if (character === "\u0003") {
					finish(new Error("Password prompt cancelled."));
					return;
				}
				if (character === "\r" || character === "\n") {
					finish();
					return;
				}
				if (character === "\u007f" || character === "\b") {
					password = password.slice(0, -1);
					continue;
				}
				password += character;
			}
		};

		process.stdout.write(`${label} (input hidden): `);
		input.setRawMode(true);
		input.resume();
		input.on("data", onData);
	});
}
