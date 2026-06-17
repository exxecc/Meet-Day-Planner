import { useState, useMemo, useEffect } from "react";

const LIFTS = ["squat", "bench", "deadlift"];
const LIFT_LABELS = { squat: "Squat", bench: "Bench Press", deadlift: "Deadlift" };

// IPF standard competition plates (kg)
const PLATES = [25, 20, 15, 10, 5, 2.5, 2, 1.5, 1];
const BAR_WEIGHT = 20; // kg

const kg2lb = (kg) => Math.round(kg * 2.20462 * 10) / 10;
const round = (val, nearest = 2.5) => Math.round(val / nearest) * nearest;

// Calculate plates needed for a weight (side of bar, not including bar)
function calcPlates(totalKg) {
  const sideWeight = (totalKg - BAR_WEIGHT) / 2;
  if (sideWeight < 0) return [];
  
  const needed = [];
  let remaining = sideWeight;
  
  for (const plate of PLATES) {
    while (remaining >= plate - 0.01) {
      needed.push(plate);
      remaining -= plate;
      remaining = Math.round(remaining * 100) / 100;
    }
  }
  
  return needed;
}

function calcAttempts(goal) {
  // Standard powerlifting attempt selection logic
  const third = round(goal);
  const secondA = round(goal * 0.96);
  const secondB = round(goal * 0.92);
  const firstA = round(goal * 0.895);
  return {
    first: firstA,
    secondA,
    secondB,
    thirdA: third,
    thirdB: round(goal * 0.948),
  };
}

function calcWarmups(goal) {
  // Warmup percentages: 30%, 53%, 60%, 72%, 81%
  const pcts = [0.30, 0.53, 0.60, 0.72, 0.81];
  const reps = [5, 3, 1, 1, 1];
  return pcts.map((p, i) => ({
    kg: round(goal * p),
    lbs: kg2lb(round(goal * p)),
    reps: reps[i],
  }));
}

const ACCENT = "#C8102E";
const AMBER = "#F0B429";
const BG = "#0F0F0F";
const SURFACE = "#1A1A1A";
const SURFACE2 = "#242424";
const TEXT = "#F0F0F0";
const TEXT_DIM = "#D0D0D0";
const MUTED = "#999";
const MUTED_DIM = "#666";
const BORDER = "#333";

const mono = "'JetBrains Mono', 'Fira Mono', 'Courier New', monospace";
const sans = "'Inter', system-ui, sans-serif";

export default function MeetDayCalc() {
  const [unit, setUnit] = useState("kg");
  const [inputs, setInputs] = useState({
    squat: { goal: "" },
    bench: { goal: "" },
    deadlift: { goal: "" },
  });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("meetDayInputs");
      if (saved) {
        setInputs(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load inputs:", e);
    }
  }, []);

  // Save to localStorage whenever inputs change
  useEffect(() => {
    localStorage.setItem("meetDayInputs", JSON.stringify(inputs));
  }, [inputs]);

  const setField = (lift, val) => {
    setInputs((prev) => ({ ...prev, [lift]: { goal: val } }));
  };

  // Convert input to kg internally regardless of selected unit
  const toKg = (val) => unit === "kg" ? val : val / 2.20462;

  const data = useMemo(() => {
    const out = {};
    for (const lift of LIFTS) {
      const raw = parseFloat(inputs[lift].goal);
      if (!raw || raw <= 0) { out[lift] = null; continue; }
      const goalKg = round(toKg(raw));
      const attempts = calcAttempts(goalKg);
      const warmups = calcWarmups(goalKg);
      out[lift] = { attempts, warmups, goalKg };
    }
    return out;
  }, [inputs, unit]);

  const totalIdeal = useMemo(() => {
    let t = 0;
    for (const lift of LIFTS) {
      if (!data[lift]) return null;
      t += data[lift].goalKg;
    }
    return t;
  }, [data]);

  const displayPrimary = (kg) => {
    if (!kg && kg !== 0) return "—";
    return unit === "kg" ? `${kg} kg` : `${kg2lb(kg)} lbs`;
  };

  const displaySecondary = (kg) => {
    if (!kg && kg !== 0) return "";
    return unit === "kg" ? `${kg2lb(kg)} lbs` : `${kg} kg`;
  };

  const displayPlates = (kg) => {
    const plates = calcPlates(kg);
    if (!plates.length) return "—";
    
    const counts = {};
    plates.forEach((p) => {
      counts[p] = (counts[p] || 0) + 1;
    });
    
    return Object.entries(counts)
      .sort(([a], [b]) => b - a)
      .map(([plate, count]) => `${count}×${plate}`)
      .join(" + ");
  };

  const anyData = LIFTS.some((l) => data[l]);

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: sans, padding: "0 0 60px" }}>
      {/* Header */}
      <div style={{ borderBottom: `2px solid ${ACCENT}`, padding: "28px 24px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontFamily: mono, fontSize: 12, letterSpacing: "0.2em", color: ACCENT, textTransform: "uppercase", marginBottom: 5, fontWeight: 600 }}>
            Calgary Barbell
          </div>
          <h1 style={{ margin: 0, fontSize: "clamp(22px, 5vw, 32px)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1, color: TEXT }}>
            Meet Day Planner
          </h1>
          <p style={{ margin: "8px 0 0", color: TEXT_DIM, fontSize: 14, fontWeight: 400 }}>
            Enter your goals to generate attempts &amp; warmups
          </p>
        </div>
        {/* Unit toggle */}
        <div style={{ display: "flex", background: SURFACE2, borderRadius: 8, padding: 3, gap: 2 }}>
          {["kg", "lbs"].map((u) => (
            <button
              key={u}
              onClick={() => setUnit(u)}
              style={{
                background: unit === u ? ACCENT : "transparent",
                color: unit === u ? "#fff" : MUTED,
                border: "none",
                borderRadius: 6,
                padding: "6px 18px",
                fontFamily: mono,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s",
                letterSpacing: "0.05em",
              }}
            >
              {u.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div style={{ padding: "28px 24px 0", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        {LIFTS.map((lift) => (
          <div key={lift} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 18px" }}>
            <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.18em", color: ACCENT, textTransform: "uppercase", marginBottom: 12 }}>
              {LIFT_LABELS[lift]}
            </div>
            <label style={{ display: "block" }}>
              <div style={{ fontSize: 12, color: MUTED, marginBottom: 6, letterSpacing: "0.05em", fontWeight: 500 }}>GOAL 3RD ATTEMPT ({unit.toUpperCase()})</div>
              <input
                type="number"
                value={inputs[lift].goal}
                onChange={(e) => setField(lift, e.target.value)}
                placeholder={unit === "kg" ? "e.g. 185" : "e.g. 407"}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  background: SURFACE2,
                  border: `1.5px solid ${inputs[lift].goal ? ACCENT : BORDER}`,
                  borderRadius: 8,
                  padding: "10px 12px",
                  color: TEXT,
                  fontFamily: mono,
                  fontSize: 20,
                  fontWeight: 700,
                  outline: "none",
                  transition: "border-color 0.15s",
                }}
              />
            </label>
            {data[lift] && (
              <div style={{ marginTop: 8, fontFamily: mono, fontSize: 13, color: TEXT_DIM }}>
                = {displaySecondary(data[lift].goalKg)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Results */}
      {anyData && (
        <div style={{ padding: "32px 24px 0" }}>
          {/* Total */}
          {totalIdeal && (
            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderLeft: `4px solid ${ACCENT}`, borderRadius: 12, padding: "18px 22px", marginBottom: 28, display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.18em", color: MUTED, textTransform: "uppercase", marginBottom: 6, fontWeight: 600 }}>Ideal Total</div>
                <div style={{ fontFamily: mono, fontSize: 36, fontWeight: 800, color: AMBER, letterSpacing: "-0.02em" }}>
                  {displayPrimary(totalIdeal)}
                </div>
                <div style={{ fontFamily: mono, fontSize: 15, color: TEXT_DIM, marginTop: 4 }}>
                  {displaySecondary(totalIdeal)}
                </div>
              </div>
              <div style={{ color: TEXT_DIM, fontSize: 14, fontWeight: 500 }}>
                {LIFTS.map((l) => data[l] ? `${LIFT_LABELS[l]}: ${displayPrimary(data[l].goalKg)}` : null).filter(Boolean).join(" · ")}
              </div>
            </div>
          )}

          {/* Lift panels */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {LIFTS.map((lift) => {
              const d = data[lift];
              if (!d) return null;
              const { attempts, warmups } = d;
              return (
                <div key={lift} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden" }}>
                  {/* Lift header */}
                  <div style={{ background: SURFACE2, padding: "16px 20px", borderBottom: `1px solid ${BORDER}` }}>
                    <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.2em", color: ACCENT, textTransform: "uppercase", marginBottom: 6, fontWeight: 600 }}>{LIFT_LABELS[lift]}</div>
                    <div style={{ fontFamily: mono, fontSize: 26, fontWeight: 800, color: TEXT }}>{displayPrimary(d.goalKg)}</div>
                    <div style={{ fontFamily: mono, fontSize: 14, color: TEXT_DIM, marginTop: 4 }}>{displaySecondary(d.goalKg)}</div>
                  </div>

                  {/* Attempts */}
                  <div style={{ padding: "20px 20px 0" }}>
                    <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.18em", color: MUTED, textTransform: "uppercase", marginBottom: 12, fontWeight: 600 }}>Attempts</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      {[
                        { label: "1st", kg: attempts.first, note: null },
                        { label: "2nd A", kg: attempts.secondA, note: "conservative" },
                        { label: "2nd B", kg: attempts.secondB, note: "alternative" },
                        { label: "3rd A", kg: attempts.thirdA, note: "goal", highlight: true },
                        { label: "3rd B", kg: attempts.thirdB, note: "backup" },
                      ].map(({ label, kg, note, highlight }) => (
                        <div
                          key={label}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "11px 14px",
                            borderRadius: 8,
                            background: highlight ? `${ACCENT}22` : "transparent",
                            border: highlight ? `1px solid ${ACCENT}55` : "1px solid transparent",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ fontFamily: mono, fontSize: 14, fontWeight: 700, color: highlight ? ACCENT : MUTED, width: 50, letterSpacing: "0.05em" }}>{label}</div>
                            {note && <div style={{ fontSize: 11, color: MUTED_DIM, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>{note}</div>}
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontFamily: mono, fontSize: 16, fontWeight: highlight ? 800 : 700, color: highlight ? ACCENT : TEXT }}>
                              {displayPrimary(kg)}
                            </div>
                            <div style={{ fontFamily: mono, fontSize: 12, color: TEXT_DIM, marginTop: 2 }}>
                              {displaySecondary(kg)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Warmups */}
                  <div style={{ padding: "18px 20px 20px" }}>
                    <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.18em", color: MUTED, textTransform: "uppercase", marginBottom: 12, fontWeight: 600 }}>Warmups</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {warmups.map((w, i) => {
                        const pct = Math.round((w.kg / d.goalKg) * 100);
                        return (
                          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between" }}>
                              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                                <div style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, color: MUTED, width: 20, textAlign: "right" }}>{w.reps}×</div>
                                <div>
                                  <div style={{ fontFamily: mono, fontSize: 16, fontWeight: 700, color: AMBER }}>
                                    {w.kg} kg
                                  </div>
                                  <div style={{ fontFamily: mono, fontSize: 12, color: TEXT_DIM, marginTop: 1 }}>
                                    {kg2lb(w.kg)} lbs
                                  </div>
                                </div>
                              </div>
                              <div style={{ fontFamily: mono, fontSize: 13, color: MUTED, fontWeight: 600 }}>{pct}%</div>
                            </div>
                            <div style={{ background: SURFACE2, borderRadius: 5, padding: "8px 10px" }}>
                              <div style={{ fontFamily: mono, fontSize: 12, color: TEXT_DIM, fontWeight: 600 }}>
                                {displayPlates(w.kg)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!anyData && (
        <div style={{ padding: "60px 24px", textAlign: "center", color: MUTED }}>
          <div style={{ fontFamily: mono, fontSize: 40, marginBottom: 12, opacity: 0.3 }}>⟶</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#555" }}>Enter a goal attempt above to generate your plan</div>
        </div>
      )}

      <div style={{ padding: "40px 24px 0", textAlign: "center", fontFamily: mono, fontSize: 11, color: "#333", letterSpacing: "0.1em" }}>
        MEET DAY PLANNER · BASED ON CALGARY BARBELL MEET PROTOCOL
      </div>
    </div>
  );
}
