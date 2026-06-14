import type { EnhancedPortfolio, PortfolioStyle } from "@/types/portfolio";
import { Mail } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/SocialIcons";
import { sectionThemes } from "./theme";

interface ContactSectionProps {
  data: EnhancedPortfolio;
  style: PortfolioStyle;
}

export function ContactSection({ data, style }: ContactSectionProps) {
  const t = sectionThemes[style];
  const { contact } = data;

  return (
    <section className={`border-t px-6 py-12 md:px-12 ${t.border}`}>
      <h2 className={`mb-6 text-2xl font-semibold ${t.heading}`}>
        {style === "developer" ? (
          <>
            <span className={t.accentAlt}>##</span> contact
          </>
        ) : (
          "Contact"
        )}
      </h2>
      <p className={`mb-6 text-sm ${t.muted}`}>
        Open to opportunities and collaborations.
      </p>
      <div className="flex flex-wrap gap-4 text-sm">
        {contact.email && (
          <a
            href={`mailto:${contact.email}`}
            className={`flex items-center gap-2 ${t.accent} hover:underline`}
          >
            <Mail className="h-4 w-4" />
            {contact.email}
          </a>
        )}
        {contact.github && (
          <a
            href={contact.github}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 ${t.muted} hover:${t.accent}`}
          >
            <GitHubIcon className="h-4 w-4" />
            GitHub
          </a>
        )}
        {contact.linkedin && (
          <a
            href={contact.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 ${t.muted} hover:${t.accent}`}
          >
            <LinkedInIcon className="h-4 w-4" />
            LinkedIn
          </a>
        )}
        {contact.website && (
          <a
            href={contact.website}
            target="_blank"
            rel="noopener noreferrer"
            className={`${t.accent} hover:underline`}
          >
            Website
          </a>
        )}
      </div>
    </section>
  );
}
