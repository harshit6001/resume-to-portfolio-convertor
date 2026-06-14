import type { EnhancedPortfolio } from "@/types/portfolio";
import { Mail, ExternalLink, Sparkles } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/SocialIcons";

interface TemplateProps {
  data: EnhancedPortfolio;
}

export function CreativeModern({ data }: TemplateProps) {
  return (
    <div className="min-h-full bg-gradient-to-br from-[#0f0f1a] via-[#1a1033] to-[#0d1f2d] text-[#f0f0f5]">
      <header className="relative overflow-hidden px-6 py-20 md:px-12">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-pink-600/20 blur-3xl" />
        <div className="relative">
          <div className="mb-4 flex items-center gap-2 text-purple-400">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em]">Portfolio</span>
          </div>
          <h1 className="bg-gradient-to-r from-white to-purple-300 bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-6xl">
            {data.name}
          </h1>
          <p className="mt-4 max-w-lg text-lg text-purple-200/80">{data.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {data.contact.email && (
              <a
                href={`mailto:${data.contact.email}`}
                className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105"
              >
                Get in Touch
              </a>
            )}
            {data.contact.linkedin && (
              <a
                href={data.contact.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-purple-500/30 px-6 py-2.5 text-sm text-purple-300 transition-colors hover:border-purple-400"
              >
                LinkedIn
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-16 px-6 py-12 md:px-12">
        <section>
          <h2 className="mb-4 font-bold text-purple-300">About Me</h2>
          <p className="leading-relaxed text-purple-100/80">{data.about}</p>
        </section>

        <section>
          <h2 className="mb-6 font-bold text-purple-300">Skills</h2>
          <div className="space-y-4">
            {data.skills.map((g) => (
              <div key={g.category}>
                <h3 className="mb-2 text-xs uppercase tracking-wider text-pink-400">
                  {g.category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {g.items.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-sm text-purple-200"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-6 font-bold text-purple-300">Projects</h2>
          <div className="space-y-5">
            {data.projects.map((p) => (
              <article
                key={p.name}
                className="rounded-2xl border border-purple-500/20 bg-white/5 p-6 backdrop-blur-sm"
              >
                <h3 className="text-lg font-semibold text-white">{p.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-purple-200/70">{p.description}</p>
                <ul className="mt-3 space-y-1 text-sm text-purple-100/80">
                  {p.highlights.map((h) => (
                    <li key={h} className="flex gap-2">
                      <span className="text-pink-400">→</span>
                      {h}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.technologies.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-pink-500/20 px-2.5 py-0.5 text-xs text-pink-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-6 font-bold text-purple-300">Experience</h2>
          <div className="space-y-5">
            {data.experience.map((e) => (
              <article
                key={`${e.company}-${e.role}`}
                className="rounded-2xl border border-purple-500/20 bg-white/5 p-6 backdrop-blur-sm"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-semibold text-white">{e.role}</h3>
                  <span className="text-xs text-purple-400">{e.period}</span>
                </div>
                <p className="text-sm text-purple-300">{e.company}</p>
                <ul className="mt-3 space-y-1 text-sm text-purple-100/80">
                  {e.achievements.map((a) => (
                    <li key={a} className="flex gap-2">
                      <span className="text-pink-400">→</span>
                      {a}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-900/40 to-pink-900/40 p-8 text-center">
          <h2 className="mb-4 text-xl font-bold">Let&apos;s Connect</h2>
          <div className="flex justify-center gap-6">
            {data.contact.email && (
              <a href={`mailto:${data.contact.email}`} className="text-purple-300 hover:text-white">
                <Mail className="h-5 w-5" />
              </a>
            )}
            {data.contact.github && (
              <a href={data.contact.github} target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-white">
                <GitHubIcon className="h-5 w-5" />
              </a>
            )}
            {data.contact.linkedin && (
              <a href={data.contact.linkedin} target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-white">
                <LinkedInIcon className="h-5 w-5" />
              </a>
            )}
            {data.contact.website && (
              <a href={data.contact.website} target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-white">
                <ExternalLink className="h-5 w-5" />
              </a>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
