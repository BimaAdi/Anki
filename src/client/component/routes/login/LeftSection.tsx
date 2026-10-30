export function LeftSection() {
	return (
		<section
			className="relative flex min-h-screen flex-col overflow-hidden bg-auth-ink p-[clamp(32px,5.3vw,76px)] text-auth-white max-[900px]:p-9 max-[700px]:hidden"
			aria-label="About Anki"
		>
			<a
				className="inline-flex w-fit items-center gap-[11px] text-inherit text-xl font-bold tracking-[-0.06em] no-underline"
				href="/"
				aria-label="Anki home"
			>
				<span
					className="grid size-8 place-items-center rounded-[10px] bg-auth-lime text-base font-extrabold tracking-[-0.08em] text-auth-ink"
					aria-hidden="true"
				>
					A
				</span>
				<span>Anki</span>
			</a>
			<div className="my-auto max-w-[570px] py-[74px] pb-[58px]">
				<h1
					className="my-[22px] mb-[18px] text-[clamp(56px,7vw,100px)] font-[550] leading-[0.98] tracking-[-0.085em]"
					aria-label="Make Learning Stick"
				>
					Make Learning
					<br />
					<span className="text-auth-lime">Stick</span>
				</h1>
			</div>
		</section>
	);
}
