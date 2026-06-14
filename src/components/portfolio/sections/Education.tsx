import type { EnhancedPortfolio, PortfolioStyle } from "@/types/portfolio";
import { sectionThemes } from "./theme";

interface EducationSectionProps {
  data: EnhancedPortfolio;
  style: PortfolioStyle;
}

export function EducationSection({ data, style }: EducationSectionProps) {
  const t = sectionThemes[style];

  if (!data.education.length) return null;

  return (
    <section className="px-6 py-12 md:px-12">
      <h2 className={`mb-6 text-2xl font-semibold ${t.heading}`}>
        {style === "developer" ? (
          <>
            <span className={t.accentAlt}>##</span> education
          </>
        ) : (
          "Education"
        )}
      </h2>
      <div className="space-y-4">
        {data.education.map((e) => (
          <article key={`${e.institution}-${e.degree}`} className={`rounded-xl p-5 ${t.card}`}>
            <h3 className={`font-semibold ${t.text}`}>{e.degree}</h3>
            <p className={`text-sm ${t.muted}`}>{e.institution}</p>
            {e.period && <p className={`mt-1 text-xs ${t.muted}`}>{e.period}</p>}
            {e.details && <p className={`mt-2 text-sm ${t.muted}`}>{e.details}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}
