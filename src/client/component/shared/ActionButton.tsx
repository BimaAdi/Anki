import type { ComponentProps } from "react";

type ActionButtonVariant = "primary" | "secondary" | "danger";

const actionBaseClassName =
	"inline-flex cursor-pointer items-center justify-center gap-2 rounded-[7px] border px-[13px] py-[9px] text-xs font-semibold no-underline transition-[background-color,border-color] duration-150 disabled:cursor-wait disabled:opacity-70";

const variantClassNames: Record<ActionButtonVariant, string> = {
	primary: "border-auth-ink bg-auth-ink text-white hover:bg-[#293c32]",
	secondary:
		"border-auth-line bg-transparent text-auth-ink-soft hover:border-[#bdc4b9]",
	danger:
		"border-[#e3c4c4] bg-transparent text-auth-error hover:border-auth-error",
};

export function actionButtonClassName(
	variant: ActionButtonVariant = "secondary",
	className?: string,
) {
	return `${actionBaseClassName} ${variantClassNames[variant]}${className ? ` ${className}` : ""}`;
}

type ActionButtonProps = ComponentProps<"button"> & {
	variant?: ActionButtonVariant;
};

export function ActionButton({
	variant,
	className,
	...props
}: ActionButtonProps) {
	return (
		<button
			type="button"
			className={actionButtonClassName(variant, className)}
			{...props}
		/>
	);
}
