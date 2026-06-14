import type { EnhancedPortfolio } from "@/types/portfolio";
import { Terminal, Mail, ExternalLink } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/SocialIcons";

interface TemplateProps {
  data: EnhancedPortfolio;
}

export function DeveloperFocused({ data }: TemplateProps) {
  return (
    <div className="min-h-full bg-[#0d1117] font-mono text-[#c9d1d9]">
      <header className="border-b border-[#21262d] bg-[#161b22] px-6 py-16 md:px-12">
        <div className="mb-4 flex items-center gap-2 text-[#3fb950]">
          <Terminal className="h-4 w-4" />
          <span className="text-xs uppercase tracking-widest">~/portfolio</span>
        </div>
        <h1 className="text-4xl font-bold text-[#f0f6fc] md:text-5xl">
          <span className="text-[#3fb950]">const</span> name ={" "}
          <span className="text-[#a5d6ff]">&quot;{data.name}&quot;</span>;
        </h1>
        <p className="mt-4 max-w-xl text-base text-[#8b949e]">
          <span className="text-[#3fb950]">{"//"}</span> {data.tagline}
        </p>
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          {data.contact.email && (
            <a href={`mailto:${data.contact.email}`} className="text-[#58a6ff] hover:underline">
              {data.contact.email}
            </a>
          )}
          {data.contact.github && (
            <a href={data.contact.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#8b949e] hover:text-[#58a6ff]">
              <GitHubIcon className="h-4 w-4" /> github
            </a>
          )}
          {data.contact.linkedin && (
            <a href={data.contact.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#8b949e] hover:text-[#58a6ff]">
              <LinkedInIcon className="h-4 w-4" /> linkedin
            </a>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-12 px-6 py-12 md:px-12">
        <section>
          <h2 className="mb-4 text-[#58a6ff]">
            <span className="text-[#3fb950]">##</span> about.md
          </h2>
          <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-5 text-sm leading-relaxed text-[#8b949e]">
            {data.about}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-[#58a6ff]">
            <span className="text-[#3fb950]">##</span> skills.json
          </h2>
          <div className="space-y-4">
            {data.skills.map((g) => (
              <div key={g.category} className="rounded-lg border border-[#30363d] bg-[#161b22] p-4">
                <p className="mb-2 text-xs text-[#3fb950]">
                  &quot;{g.category.toLowerCase().replace(/\s+/g, "_")}&quot;: [
                </p>
                <div className="flex flex-wrap gap-2 pl-4">
                  {g.items.map((s) => (
                    <span
                      key={s}
                      className="rounded border border-[#30363d] bg-[#0d1117] px-2.5 py-1 text-xs text-[#79c0ff]"
                    >
                      &quot;{s}&quot;
                    </span>
                  ))}
                </div>
                <p className="text-xs text-[#3fb950]">]</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-[#58a6ff]">
            <span className="text-[#3fb950]">##</span> projects/
          </h2>
          <div className="space-y-4">
            {data.projects.map((p) => (
              <article
                key={p.name}
                className="rounded-lg border border-[#30363d] bg-[#161b22] p-5"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-[#f0f6fc]">
                    <span className="text-[#3fb950]">./</span>
                    {p.name.toLowerCase().replace(/\s+/g, "-")}
                  </h3>
                  {p.link && (
                    <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-[#58a6ff] hover:underline">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
                <p className="mb-3 text-sm text-[#8b949e]">{p.description}</p>
                <ul className="space-y-1 text-sm">
                  {p.highlights.map((h) => (
                    <li key={h} className="text-[#8b949e]">
                      <span className="text-[#3fb950]">+</span> {h}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.technologies.map((t) => (
                    <span key={t} className="text-xs text-[#3fb950]">
                      #{t.toLowerCase().replace(/\s+/g, "")}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-[#58a6ff]">
            <span className="text-[#3fb950]">##</span> experience.log
          </h2>
          <div className="space-y-4">
            {data.experience.map((e) => (
              <article
                key={`${e.company}-${e.role}`}
                className="rounded-lg border border-[#30363d] bg-[#161b22] p-5"
              >
                <div className="mb-2 flex flex-wrap justify-between gap-2">
                  <p className="text-[#f0f6fc]">
                    <span className="text-[#3fb950]">[</span>
                    {e.period}
                    <span className="text-[#3fb950]">]</span>{" "}
                    <span className="text-[#58a6ff]">{e.role}</span>
                    <span className="text-[#8b949e]"> @ </span>
                    {e.company}
                  </p>
                </div>
                <ul className="space-y-1 text-sm text-[#8b949e]">
                  {e.achievements.map((a) => (
                    <li key={a}>
                      <span className="text-[#3fb950]">&gt;</span> {a}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {data.education.length > 0 && (
          <section>
            <h2 className="mb-4 text-[#58a6ff]">
              <span className="text-[#3fb950]">##</span> education
            </h2>
            {data.education.map((e) => (
              <div key={e.institution} className="rounded-lg border border-[#30363d] bg-[#161b22] p-4 text-sm">
                <p className="text-[#f0f6fc]">{e.degree}</p>
                <p className="text-[#8b949e]">
                  {e.institution} · {e.period}
                </p>
              </div>
            ))}
          </section>
        )}

        <section className="rounded-lg border border-[#238636] bg-[#161b22] p-6 text-center">
          <p className="mb-3 text-[#3fb950]">$ contact --send</p>
          <div className="flex justify-center gap-4">
            {data.contact.email && (
              <a href={`mailto:${data.contact.email}`} className="text-[#58a6ff] hover:underline">
                <Mail className="inline h-4 w-4" /> email
              </a>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
