import type { ComponentProps } from "react";

type InputProps = ComponentProps<"input">;

const inputClassName =
	"h-12 w-full rounded-[7px] border border-[#dfe2d9] bg-[#fffefa] px-[14px] text-[13px] text-auth-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#a6aaa2] focus:border-[#758c66] focus:shadow-[0_0_0_3px_rgb(117_140_102_/_13%)]";

export function Input({ className, ...props }: InputProps) {
	return (
		<input
			className={`${inputClassName}${className ? ` ${className}` : ""}`}
			{...props}
		/>
	);
}
