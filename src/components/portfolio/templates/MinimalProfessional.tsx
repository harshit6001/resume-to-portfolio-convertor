import type { EnhancedPortfolio } from "@/types/portfolio";
import { Mail, MapPin, ExternalLink } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/SocialIcons";

interface TemplateProps {
  data: EnhancedPortfolio;
}

function ContactLinks({ contact }: { contact: EnhancedPortfolio["contact"] }) {
  const links = [
    { href: contact.email ? `mailto:${contact.email}` : null, icon: Mail, label: contact.email },
    { href: contact.linkedin, icon: LinkedInIcon, label: "LinkedIn" },
    { href: contact.github, icon: GitHubIcon, label: "GitHub" },
    { href: contact.website, icon: ExternalLink, label: "Website" },
  ].filter((l) => l.href);

  return (
    <div className="flex flex-wrap gap-4">
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href!}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm opacity-70 transition-opacity hover:opacity-100"
        >
          <l.icon className="h-4 w-4" />
          {l.label}
        </a>
      ))}
      {contact.location && (
        <span className="flex items-center gap-2 text-sm opacity-70">
          <MapPin className="h-4 w-4" />
          {contact.location}
        </span>
      )}
    </div>
  );
}

export function MinimalProfessional({ data }: TemplateProps) {
  return (
    <div className="min-h-full bg-[#fafafa] text-zinc-900 font-[family-name:var(--font-inter)]">
      <header className="border-b border-zinc-200 bg-white px-6 py-16 md:px-12">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Portfolio
        </p>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{data.name}</h1>
        <p className="mt-3 max-w-xl text-lg text-zinc-600">{data.tagline}</p>
        <div className="mt-8">
          <ContactLinks contact={data.contact} />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12 md:px-12">
        <section className="mb-14">
          <h2 className="mb-4 border-b-2 border-zinc-900 pb-2 text-xl font-bold">About</h2>
          <p className="leading-relaxed text-zinc-700">{data.about}</p>
        </section>

        <section className="mb-14">
          <h2 className="mb-6 border-b-2 border-zinc-900 pb-2 text-xl font-bold">Skills</h2>
          <div className="space-y-5">
            {data.skills.map((g) => (
              <div key={g.category}>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  {g.category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {g.items.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-14">
          <h2 className="mb-6 border-b-2 border-zinc-900 pb-2 text-xl font-bold">Projects</h2>
          <div className="space-y-6">
            {data.projects.map((p) => (
              <article key={p.name} className="rounded-xl border border-zinc-200 bg-white p-6">
                <div className="mb-2 flex items-start justify-between gap-4">
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  {p.period && <span className="text-xs text-zinc-500">{p.period}</span>}
                </div>
                <p className="mb-3 text-sm leading-relaxed text-zinc-600">{p.description}</p>
                <ul className="mb-3 list-disc space-y-1 pl-5 text-sm text-zinc-700">
                  {p.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-1.5">
                  {p.technologies.map((t) => (
                    <span key={t} className="rounded bg-zinc-900 px-2 py-0.5 text-xs text-white">
                      {t}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-14">
          <h2 className="mb-6 border-b-2 border-zinc-900 pb-2 text-xl font-bold">Experience</h2>
          <div className="space-y-6">
            {data.experience.map((e) => (
              <article key={`${e.company}-${e.role}`} className="border-l-2 border-zinc-300 pl-6">
                <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-semibold">{e.role}</h3>
                  <span className="text-xs text-zinc-500">{e.period}</span>
                </div>
                <p className="mb-2 text-sm font-medium text-zinc-600">{e.company}</p>
                <p className="mb-2 text-sm text-zinc-600">{e.description}</p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700">
                  {e.achievements.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {data.education.length > 0 && (
          <section className="mb-14">
            <h2 className="mb-6 border-b-2 border-zinc-900 pb-2 text-xl font-bold">Education</h2>
            {data.education.map((e) => (
              <div key={e.institution} className="mb-4">
                <h3 className="font-semibold">{e.degree}</h3>
                <p className="text-sm text-zinc-600">
                  {e.institution} · {e.period}
                </p>
              </div>
            ))}
          </section>
        )}

        <section className="rounded-xl bg-zinc-900 p-8 text-center text-white">
          <h2 className="mb-2 text-xl font-bold">Get in Touch</h2>
          <p className="mb-4 text-sm text-zinc-400">
            Open to opportunities and collaborations.
          </p>
          <ContactLinks contact={data.contact} />
        </section>
      </main>
    </div>
  );
}
