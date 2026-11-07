/** Slim notice shown only when the active data provider reports `isDemo`. */
export function DemoBar() {
  return (
    <div className="bg-red-brand text-white">
      <p className="container-site py-2 text-center text-[0.6875rem] font-bold uppercase tracking-[0.1em]">
        Design proposal · demonstration data<span className="hidden sm:inline"> · photography placeholders</span>
      </p>
    </div>
  );
}
