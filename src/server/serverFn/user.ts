import { createServerFn } from "@tanstack/react-start";
import { userLimitsSchema } from "#/server/schema/user";
import { getUserLimits } from "#/server/service/user-limits";
import { requireUserId } from "#/server/session";

export const getMyLimits = createServerFn({ method: "GET" }).handler(
	async () => {
		const userId = await requireUserId();
		const limits = await getUserLimits(userId);
		if (!limits) {
			throw new Error("User not found");
		}

		return userLimitsSchema.parse(limits);
	},
);
