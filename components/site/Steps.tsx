const STEPS = [
  {
    num: "01",
    title: "Plan Select Karo",
    body: "Movies, Adult ya Combo — apna budget wala plan choose karo.",
  },
  {
    num: "02",
    title: "Payment Karo",
    body: "UPI app, Razorpay ya Universal link se instant payment.",
  },
  {
    num: "03",
    title: "Screenshot Bhejo",
    body: "Payment ke baad order ID ke saath screenshot Telegram pe bhejo.",
  },
  {
    num: "04",
    title: "Access Pao",
    body: "Verification ke turant baad channel/access details mil jayengi.",
  },
];

export function Steps() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {STEPS.map((step) => (
        <div key={step.num} className="glass rounded-2xl p-5">
          <span className="text-grad font-mono text-[11px] font-bold tracking-[1.6px]">
            STEP {step.num}
          </span>
          <b className="mt-2 block font-display text-[14px] font-extrabold">
            {step.title}
          </b>
          <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
            {step.body}
          </p>
        </div>
      ))}
    </div>
  );
}
