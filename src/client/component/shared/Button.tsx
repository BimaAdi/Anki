import type { ComponentProps } from "react";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = ComponentProps<"button"> & {
	variant?: ButtonVariant;
};

const buttonClassName =
	"flex min-h-[52px] w-full cursor-pointer items-center rounded-lg text-[13px] font-[650] transition-[background-color,border-color,transform] duration-150 hover:-translate-y-px disabled:cursor-wait disabled:opacity-70";

const variantClassNames: Record<ButtonVariant, string> = {
	primary:
		"justify-between border border-auth-ink bg-auth-ink px-[17px] text-white hover:bg-[#293c32]",
	secondary:
		"justify-center gap-3 border border-auth-line bg-auth-white text-auth-ink hover:border-[#b9c0b6]",
};

export function Button({
	variant = "primary",
	className,
	...props
}: ButtonProps) {
	return (
		<button
			className={`${buttonClassName} ${variantClassNames[variant]}${className ? ` ${className}` : ""}`}
			{...props}
		/>
	);
}
