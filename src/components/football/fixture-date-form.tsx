"use client";

export function FixtureDateForm({ date }: { date: string }) {
  return (
    <form action="/fixtures" className="flex flex-wrap items-center gap-2">
      <label className="sr-only" htmlFor="fixture-date">
        Fixture date
      </label>
      <input
        className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm text-white [color-scheme:dark]"
        defaultValue={date}
        id="fixture-date"
        name="date"
        type="date"
      />
      <button
        className="rounded-full bg-emerald-300 px-5 py-2.5 text-sm font-bold text-emerald-950 transition hover:bg-emerald-200"
        type="submit"
      >
        View day
      </button>
    </form>
  );
}
