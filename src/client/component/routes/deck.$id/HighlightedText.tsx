import { highlightParts } from "#/client/lib/card-search";

type HighlightedTextProps = {
	text: string;
	query?: string;
};

export function HighlightedText({ text, query = "" }: HighlightedTextProps) {
	return (
		<>
			{highlightParts(text, query).map((part) =>
				part.match ? (
					<mark
						key={part.start}
						className="bg-transparent text-inherit underline decoration-[#758c66] decoration-2 underline-offset-2"
					>
						{part.text}
					</mark>
				) : (
					<span key={part.start}>{part.text}</span>
				),
			)}
		</>
	);
}
