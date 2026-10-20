//src/components/HeroBanner.jsx

// Dark banner with soft color glows and a faint grid, used at the top of key pages
export default function HeroBanner({ children, className = "" }) {
  return (
    <section
      className={`relative overflow-hidden rounded-3xl px-6 py-10 text-white sm:px-10 sm:py-12 ${className}`}
      style={{ backgroundColor: "#0B1020" }}
    >
      <div aria-hidden className="pointer-events-none absolute -left-24 -top-28 h-80 w-80 rounded-full bg-indigo-600/45 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-36 right-[-4rem] h-96 w-96 rounded-full bg-fuchsia-500/25 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute right-1/3 top-0 h-48 w-48 rounded-full bg-sky-400/20 blur-3xl" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(#FFFFFF 1px, transparent 1px), linear-gradient(90deg, #FFFFFF 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div className="relative">{children}</div>
    </section>
  );
}
