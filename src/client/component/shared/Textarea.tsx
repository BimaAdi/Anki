import type { ComponentProps } from "react";

type TextareaProps = ComponentProps<"textarea">;

const textareaClassName =
	"min-h-[96px] w-full resize-y rounded-[7px] border border-[#dfe2d9] bg-[#fffefa] px-[14px] py-3 text-[13px] leading-[1.6] text-auth-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#a6aaa2] focus:border-[#758c66] focus:shadow-[0_0_0_3px_rgb(117_140_102_/_13%)]";

export function Textarea({ className, ...props }: TextareaProps) {
	return (
		<textarea
			className={`${textareaClassName}${className ? ` ${className}` : ""}`}
			{...props}
		/>
	);
}
