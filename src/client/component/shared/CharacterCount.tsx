type CharacterCountProps = {
	current: number;
	max: number;
	className?: string;
};

export function CharacterCount({
	current,
	max,
	className,
}: CharacterCountProps) {
	const overLimit = current > max;

	return (
		<output
			aria-label={`${current} of ${max} characters`}
			aria-live="polite"
			className={`text-[11px] font-semibold tabular-nums ${overLimit ? "text-auth-error" : "text-auth-muted"}${className ? ` ${className}` : ""}`}
		>
			{current}/{max}
		</output>
	);
}
