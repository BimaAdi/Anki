import { createServerFn } from "@tanstack/react-start";
import { counterSchema } from "#/server/schema/counter";
import * as counterService from "#/server/service/counter";

export const getCounter = createServerFn({ method: "GET" }).handler(
	async () => {
		return counterSchema.parse(await counterService.getCounter());
	},
);

export const incrementCounter = createServerFn({ method: "POST" }).handler(
	async () => {
		return counterSchema.parse(await counterService.incrementCounter());
	},
);

export const decrementCounter = createServerFn({ method: "POST" }).handler(
	async () => {
		return counterSchema.parse(await counterService.decrementCounter());
	},
);
