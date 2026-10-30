import { LeftSection } from "./LeftSection";
import { RightSection } from "./RightSection";

export function Page() {
	return (
		<main className="grid min-h-screen grid-cols-[minmax(0,1fr)_minmax(420px,0.82fr)] max-[900px]:grid-cols-[minmax(0,0.9fr)_minmax(380px,1fr)] max-[700px]:block">
			<LeftSection />
			<RightSection />
		</main>
	);
}
