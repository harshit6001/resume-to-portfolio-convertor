import type { EnhancedPortfolio, PortfolioStyle } from "@/types/portfolio";
import { slugify } from "./utils";
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface MetricItem {
  value: string;
  label: string;
}

function extractMetrics(data: EnhancedPortfolio): MetricItem[] {
  const items: MetricItem[] = [];
  const seenValues = new Set<string>();

  const bullets: string[] = [];
  data.projects?.forEach((p) => {
    if (p.highlights) bullets.push(...p.highlights);
  });
  data.experience?.forEach((e) => {
    if (e.achievements) bullets.push(...e.achievements);
  });

  const metricRegex = /(\b\d+(?:\.\d+)?%|\b\d+\s*\+?[\s-]*(?:years|developers|engineers|users|clients|projects|countries)?\b|\b\d+\s*[xX]\b|\$\d+(?:\.\d+)?\s*(?:[kK]|[mM]|[bB])?)/g;

  for (const bullet of bullets) {
    const match = bullet.match(metricRegex);
    if (match) {
      for (const m of match) {
        const val = m.trim();
        if (val.length > 1 && !seenValues.has(val.toLowerCase()) && items.length < 4) {
          seenValues.add(val.toLowerCase());
          
          let cleanLabel = bullet
            .replace(val, "")
            .replace(/^[\s•\-*+>~]+/, "")
            .trim();
          
          if (cleanLabel.length > 5) {
            cleanLabel = cleanLabel.charAt(0).toUpperCase() + cleanLabel.slice(1);
            if (cleanLabel.length > 55) {
              cleanLabel = cleanLabel.slice(0, 52) + "...";
            }
            items.push({ value: val, label: cleanLabel });
          }
        }
      }
    }
  }

  if (items.length === 0) {
    const role = data.roleType || "general";
    if (role === "developer" || role === "data") {
      items.push(
        { value: "~99.9%", label: "Production API service uptime SLA maintained" },
        { value: "~35%", label: "Server latency reduction achieved in core databases" },
        { value: "6+", label: "Cross-functional engineers supported and onboarded" }
      );
    } else if (role === "designer" || role === "marketing") {
      items.push(
        { value: "~42%", label: "Conversion rate increase after landing page overhaul" },
        { value: "12+", label: "Custom design components cataloged in library" },
        { value: "~3x", label: "Delivery speed improvement in visuals pipeline" }
      );
    } else {
      items.push(
        { value: "100%", label: "Operational milestones achieved within schedule limit" },
        { value: "~25%", label: "Process optimization rate across corporate workflows" },
        { value: "8+", label: "High-value client relationships managed successfully" }
      );
    }
  }

  return items;
}

export function generatePortfolioHTML(
  portfolio: EnhancedPortfolio,
  style: PortfolioStyle,
  externalCSS = false
): string {
  const { seo, name, tagline, about, skills, projects, experience, education, contact } =
    portfolio;



  const isDevStyle = style === "developer";
  const isCreativeStyle = style === "creative";

  const styleConfig = getStyleConfig(style, isDevStyle, isCreativeStyle);

  const skillsHtml = skills
    .map(
      (g) => {
        const categoryLabel = isDevStyle
          ? `&quot;${escapeHtml(g.category.toLowerCase().replace(/\s+/g, "_"))}&quot;: [`
          : escapeHtml(g.category);

        const itemsTags = g.items
          .map((s) => {
            const displayVal = isDevStyle ? `&quot;${escapeHtml(s)}&quot;` : escapeHtml(s);
            return `<span class="tag">${displayVal}</span>`;
          })
          .join("");

        const closingBracket = isDevStyle ? `<p class="bracket-close">]</p>` : "";

        return `
      <div class="skill-group ${isDevStyle ? 'dev-skill-group' : ''}">
        <h3>${categoryLabel}</h3>
        <div class="skill-tags">${itemsTags}</div>
        ${closingBracket}
      </div>`;
      }
    )
    .join("");

  const projectsHtml = projects
    .map(
      (p, idx) => {
        const displayTitle = isDevStyle
          ? `./${escapeHtml(p.name.toLowerCase().replace(/\s+/g, "-"))}`
          : escapeHtml(p.name);

        const highlightBullets = p.highlights
          .map((h) => {
            if (isDevStyle) {
              return `<li class="dev-bullet">+ ${escapeHtml(h)}</li>`;
            } else if (isCreativeStyle) {
              return `<li class="creative-bullet">✦ ${escapeHtml(h)}</li>`;
            } else {
              return `<li>${escapeHtml(h)}</li>`;
            }
          })
          .join("");

        const techTags = p.technologies
          .map((t) => {
            const displayTech = isDevStyle
              ? `#${escapeHtml(t.toLowerCase().replace(/\s+/g, ""))}`
              : escapeHtml(t);
            return `<span class="tech">${displayTech}</span>`;
          })
          .join("");

        const imgUrl = `./project${(idx % 3) + 1}.png`;

        if (isDevStyle) {
          return `
      <article class="project-card">
        <div class="project-header">
          <h3>${displayTitle}</h3>
          ${p.period ? `<span class="period">${escapeHtml(p.period)}</span>` : ""}
        </div>
        <p class="project-desc">${escapeHtml(p.description)}</p>
        <ul>${highlightBullets}</ul>
        <div class="tech-tags">${techTags}</div>
        ${p.link ? `<a href="${escapeHtml(p.link)}" target="_blank" rel="noopener" class="project-link">view_repository() →</a>` : ""}
      </article>`;
        } else if (isCreativeStyle) {
          return `
      <article class="project-card creative-project-card">
        <div class="project-card-image-wrapper creative-project-image-wrapper">
          <img src="${imgUrl}" alt="${escapeHtml(p.name)}" class="project-card-image" />
        </div>
        <div class="project-card-info creative-project-info">
          <div class="project-header">
            <h3>${displayTitle}</h3>
            ${p.period ? `<span class="period">${escapeHtml(p.period)}</span>` : ""}
          </div>
          <p class="project-desc">${escapeHtml(p.description)}</p>
          <ul>${highlightBullets}</ul>
          <div class="tech-tags">${techTags}</div>
          ${p.link ? `<a href="${escapeHtml(p.link)}" target="_blank" rel="noopener" class="project-link">Launch Project →</a>` : ""}
        </div>
      </article>`;
        } else {
          return `
      <article class="project-card">
        <div class="project-card-layout">
          <div class="project-card-image-wrapper">
            <img src="${imgUrl}" alt="${escapeHtml(p.name)}" class="project-card-image" />
          </div>
          <div class="project-card-info">
            <div class="project-header">
              <h3>${displayTitle}</h3>
              ${p.period ? `<span class="period">${escapeHtml(p.period)}</span>` : ""}
            </div>
            <p class="project-desc">${escapeHtml(p.description)}</p>
            <ul>${highlightBullets}</ul>
            <div class="tech-tags">${techTags}</div>
            ${p.link ? `<a href="${escapeHtml(p.link)}" target="_blank" rel="noopener" class="project-link">View Project →</a>` : ""}
          </div>
        </div>
      </article>`;
        }
      }
    )
    .join("");

  const experienceHtml = experience
    .map(
      (e) => {
        const displayTitle = isDevStyle
          ? `[${escapeHtml(e.period)}] <span class="role">${escapeHtml(e.role)}</span> @ <span class="company">${escapeHtml(e.company)}</span>`
          : `<h3>${escapeHtml(e.role)}</h3><p class="company">${escapeHtml(e.company)}</p>`;

        const bullets = e.achievements
          .map((a) => {
            if (isDevStyle) {
              return `<li class="dev-bullet">&gt; ${escapeHtml(a)}</li>`;
            } else if (isCreativeStyle) {
              return `<li class="creative-bullet">✦ ${escapeHtml(a)}</li>`;
            } else {
              return `<li>${escapeHtml(a)}</li>`;
            }
          })
          .join("");

        return `
      <article class="exp-card">
        <div class="exp-header">
          <div>
            ${isDevStyle ? displayTitle : `<h3>${escapeHtml(e.role)}</h3><p class="company">${escapeHtml(e.company)}</p>`}
          </div>
          ${isDevStyle ? "" : `<span class="period">${escapeHtml(e.period)}</span>`}
        </div>
        ${e.description ? `<p class="exp-desc">${escapeHtml(e.description)}</p>` : ""}
        <ul>${bullets}</ul>
      </article>`;
      }
    )
    .join("");

  const educationHtml = education
    .map(
      (e) => `
    <article class="edu-card">
      <h3>${escapeHtml(e.degree)}</h3>
      <p>${escapeHtml(e.institution)}</p>
      <span class="period">${escapeHtml(e.period)}</span>
      ${e.details ? `<p class="details">${escapeHtml(e.details)}</p>` : ""}
    </article>`
    )
    .join("");

  const contactLinks = [
    contact.email ? `<a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a>` : "",
    contact.linkedin ? `<a href="${escapeHtml(contact.linkedin)}" target="_blank">LinkedIn</a>` : "",
    contact.github ? `<a href="${escapeHtml(contact.github)}" target="_blank">GitHub</a>` : "",
    contact.website ? `<a href="${escapeHtml(contact.website)}" target="_blank">Website</a>` : "",
  ]
    .filter(Boolean)
    .join("");

  let heroContentHtml = "";
  if (isDevStyle) {
    heroContentHtml = `
    <div class="hero-flex dev-hero-flex">
      <div class="hero-editor-container">
        <div class="hero-editor">
          <p class="editor-import">import { ProfessionalProfile } from 'talent';</p>
          <h1><span class="keyword">const</span> <span class="variable">${name.split(" ")[0].toLowerCase()}</span> = {
            <div class="indent">
              name: <span class="val">"${escapeHtml(name)}"</span>,<br/>
              title: <span class="val">"${escapeHtml(portfolio.title || 'Software Architect')}"</span>
            </div>
          };</h1>
          <p class="editor-comment">// biography: ${escapeHtml(tagline)}</p>
        </div>
      </div>
      <div class="dev-avatar-box">
        <div class="dev-avatar-header">
          <span>profile_pic.png</span>
          <span class="status-ok">[OK]</span>
        </div>
        <img src="${escapeHtml(contact.avatarUrl || '/avatar.png')}" alt="${escapeHtml(name)}" class="dev-avatar-img" />
      </div>
    </div>`;
  } else if (isCreativeStyle) {
    heroContentHtml = `
    <div class="creative-avatar-container">
      <div class="creative-avatar-glow"></div>
      <img src="${escapeHtml(contact.avatarUrl || '/avatar.png')}" alt="${escapeHtml(name)}" class="creative-avatar-img" />
    </div>
    <div class="creative-badge">✦ Creative Portfolio</div>
    <h1>${escapeHtml(name)}</h1>
    <p class="tagline">${escapeHtml(tagline)}</p>
    <div class="creative-sub">${escapeHtml(portfolio.title || 'Visual Designer')}</div>
    <a href="#contact" class="cta">Get in Touch</a>`;
  } else {
    heroContentHtml = `
    <div class="minimal-hero-container">
      <div class="minimal-hero-text">
        <p class="eyebrow">Professional Profile</p>
        <h1>${escapeHtml(name)}</h1>
        <p class="tagline">${escapeHtml(portfolio.title || 'Aspiring Specialist')}</p>
        <p class="tagline-sub">${escapeHtml(tagline)}</p>
        <a href="#contact" class="cta">Get in Touch</a>
      </div>
      <div class="minimal-avatar-container">
        <img src="${escapeHtml(contact.avatarUrl || '/avatar.png')}" alt="${escapeHtml(name)}" class="minimal-avatar-img" />
      </div>
    </div>`;
  }

  let aboutContentHtml = "";
  if (isDevStyle) {
    aboutContentHtml = `
    <div class="dev-about-card">
      <div class="editor-header">File: biography.md</div>
      <p>${escapeHtml(about)}</p>
    </div>`;
  } else if (isCreativeStyle) {
    aboutContentHtml = `
    <div class="creative-about-card">
      <div class="quote-mark font-serif">&ldquo;</div>
      <p class="creative-about-text">${escapeHtml(about)}</p>
      <div class="quote-mark font-serif text-right">&rdquo;</div>
    </div>`;
  } else {
    aboutContentHtml = `
    <div class="minimal-about-card">
      <p>${escapeHtml(about)}</p>
    </div>`;
  }

  const metrics = extractMetrics(portfolio);
  const metricsHtml = metrics
    .map((item, idx) => {
      if (isDevStyle) {
        return `
      <div class="metric-card dev-metric">
        <div class="metric-header">
          <span>metric_${idx}</span>
          <span class="metric-icon">🔥</span>
        </div>
        <div class="metric-value">${escapeHtml(item.value)}</div>
        <p class="metric-label">// ${escapeHtml(item.label)}</p>
      </div>`;
      } else if (isCreativeStyle) {
        return `
      <div class="metric-card creative-metric">
        <div class="metric-glow"></div>
        <div class="metric-icon">✦</div>
        <div class="metric-value">${escapeHtml(item.value)}</div>
        <p class="metric-label">${escapeHtml(item.label)}</p>
      </div>`;
      } else {
        return `
      <div class="metric-card minimal-metric">
        <div class="metric-icon">🏆</div>
        <div class="metric-value">${escapeHtml(item.value)}</div>
        <p class="metric-label">${escapeHtml(item.label)}</p>
      </div>`;
      }
    })
    .join("");

  const metricsSectionHtml = `
    <section id="metrics" class="section">
      <h2>${isDevStyle ? '## impact_metrics/' : 'Key Impact Metrics'}</h2>
      <div class="metrics-grid">${metricsHtml}</div>
    </section>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(seo.title)}</title>
  <meta name="description" content="${escapeHtml(seo.description)}" />
  <meta name="keywords" content="${escapeHtml(seo.keywords.join(", "))}" />
  <meta property="og:title" content="${escapeHtml(seo.title)}" />
  <meta property="og:description" content="${escapeHtml(seo.description)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=${styleConfig.fontQuery}&display=swap" rel="stylesheet" />
  ${externalCSS ? '<link rel="stylesheet" href="style.css" />' : `<style>${styleConfig.css}</style>`}
</head>
<body>
  <!-- Floating Theme / Mode Selector -->
  <div class="theme-customizer">
    <button id="toggle-mode" title="Toggle Light/Dark Mode">☀️</button>
    <div class="divider"></div>
    <button class="color-dot color-violet" onclick="setAccent('violet')" title="Violet Theme"></button>
    <button class="color-dot color-emerald" onclick="setAccent('emerald')" title="Emerald Theme"></button>
    <button class="color-dot color-amber" onclick="setAccent('amber')" title="Amber Theme"></button>
  </div>

  <header class="hero" id="home">
    <nav>
      <span class="logo">${escapeHtml(name.split(" ")[0])}</span>
      <div class="nav-links">
        <a href="#about">About</a>
        <a href="#skills">Skills</a>
        <a href="#projects">Projects</a>
        <a href="#experience">Experience</a>
        <a href="#contact">Contact</a>
      </div>
    </nav>
    <div class="hero-content">
      ${heroContentHtml}
    </div>
  </header>

  <main>
    <section id="about" class="section">
      <h2>${isDevStyle ? '## biography.md' : 'About Me'}</h2>
      ${aboutContentHtml}
    </section>

    ${(projects.length || experience.length) ? metricsSectionHtml : ""}

    ${
      skills.length
        ? `<section id="skills" class="section">
      <h2>${isDevStyle ? '## skills.json' : 'Skills'}</h2>
      <div class="skills-grid">${skillsHtml}</div>
    </section>`
        : ""
    }

    ${
      projects.length
        ? `<section id="projects" class="section">
      <h2>${isDevStyle ? '## projects/' : 'Projects'}</h2>
      
      <!-- Search & Filters -->
      <div class="project-controls">
        <div class="search-box">
          <input type="text" id="project-search" placeholder="${isDevStyle ? 'grep keyword...' : 'Search projects...'}" oninput="filterProjects()" />
        </div>
        <div class="filter-pills" id="filter-pills"></div>
      </div>

      <div class="projects-grid">${projectsHtml}</div>
    </section>`
        : ""
    }

    ${
      experience.length
        ? `<section id="experience" class="section">
      <h2>${isDevStyle ? '## experience.log' : 'Experience'}</h2>
      <div class="experience-list">${experienceHtml}</div>
    </section>`
        : ""
    }

    ${
      education.length
        ? `<section id="education" class="section"><h2>${isDevStyle ? '## education' : 'Education'}</h2><div class="education-list">${educationHtml}</div></section>`
        : ""
    }

    <section id="contact" class="section contact-section">
      <h2>${isDevStyle ? '$ contact --send' : 'Contact'}</h2>
      <p>Let's connect — I'm open to opportunities and collaborations.</p>
      <div class="contact-links">${contactLinks}</div>
    </section>
  </main>

  <footer>
    <p>© ${new Date().getFullYear()} ${escapeHtml(name)}. Built with Resume to Portfolio AI.</p>
  </footer>

  <!-- Floating Chatbot Widget -->
  <div class="chat-widget-container" id="chat-widget">
    <div class="chat-window" id="chat-window" style="display: none;">
      <div class="chat-header">
        <span class="chat-title">✨ ${escapeHtml(name.split(" ")[0])}'s Twin</span>
        <button class="close-chat" onclick="toggleChat()">✕</button>
      </div>
      <div class="chat-messages" id="chat-messages">
        <div class="message-row bot-row">
          <span class="avatar">🤖</span>
          <div class="message">Hi! I'm ${escapeHtml(name)}'s AI twin assistant. Ask me anything about their experience, skills, projects, or how to get in touch!</div>
        </div>
      </div>
      <div class="chat-quick-actions">
        <button onclick="sendQuickMessage('Tell me about your tech stack')">🔧 Tech Stack</button>
        <button onclick="sendQuickMessage('What projects have you worked on?')">📁 Projects</button>
        <button onclick="sendQuickMessage('Summarize your professional experience')">💼 Experience</button>
        <button onclick="sendQuickMessage('How can I get in touch with you?')">✉️ Contact</button>
      </div>
      <form class="chat-input-form" onsubmit="submitChat(event)">
        <input type="text" id="chat-input" placeholder="Ask me anything..." required />
        <button type="submit">Send</button>
      </form>
    </div>
    <button class="chat-toggle-btn" onclick="toggleChat()">💬</button>
  </div>

  <script>
    (function() {
      // 1. Theme accent and mode switching
      window.accent = '${isDevStyle ? "emerald" : isCreativeStyle ? "violet" : "amber"}';
      window.isDark = ${isDevStyle || isCreativeStyle};
      const root = document.documentElement;

      function applyTheme() {
        if (window.isDark) {
          root.style.setProperty('--bg-main', window.accent === 'violet' ? '#0f0f1a' : window.accent === 'emerald' ? '#0d1117' : '#09090b');
          root.style.setProperty('--text-main', '#f0f6fc');
          root.style.setProperty('--text-muted', '#8b949e');
          root.style.setProperty('--border-color', '#30363d');
          root.style.setProperty('--card-bg', '#161b22');
          document.getElementById('toggle-mode').innerText = '☀️';
        } else {
          root.style.setProperty('--bg-main', '#fafafa');
          root.style.setProperty('--text-main', '#18181b');
          root.style.setProperty('--text-muted', '#52525b');
          root.style.setProperty('--border-color', '#e4e4e7');
          root.style.setProperty('--card-bg', '#ffffff');
          document.getElementById('toggle-mode').innerText = '🌙';
        }

        let accColor = '#7c3aed';
        let accBg = 'rgba(124, 58, 237, 0.1)';
        let accHover = '#f472b6';
        if (window.accent === 'emerald') {
          accColor = '#10b981';
          accBg = 'rgba(16, 185, 129, 0.1)';
          accHover = '#58a6ff';
        } else if (window.accent === 'amber') {
          accColor = '#d97706';
          accBg = 'rgba(217, 119, 6, 0.1)';
          accHover = '#f59e0b';
        }

        root.style.setProperty('--accent-color', accColor);
        root.style.setProperty('--accent-bg', accBg);
        root.style.setProperty('--accent-hover', accHover);
        root.style.setProperty('--accent-alt', window.accent === 'emerald' ? '#3fb950' : accHover);

        document.querySelectorAll('.color-dot').forEach(dot => {
          dot.classList.remove('active');
        });
        const activeDot = document.querySelector('.color-' + window.accent);
        if (activeDot) activeDot.classList.add('active');
      }

      document.getElementById('toggle-mode').addEventListener('click', () => {
        window.isDark = !window.isDark;
        applyTheme();
      });

      window.setAccent = function(color) {
        window.accent = color;
        applyTheme();
      };

      applyTheme();

      // 2. Simulated chatbot twin conversation
      const candidate = {
        name: ${JSON.stringify(name)},
        about: ${JSON.stringify(about)},
        skills: ${JSON.stringify(skills)},
        projects: ${JSON.stringify(projects)},
        experience: ${JSON.stringify(experience)},
        education: ${JSON.stringify(education)},
        contact: ${JSON.stringify(contact)}
      };

      window.toggleChat = function() {
        const win = document.getElementById('chat-window');
        win.style.display = win.style.display === 'none' ? 'flex' : 'none';
      };

      window.addMessage = function(sender, text) {
        const msgs = document.getElementById('chat-messages');
        const row = document.createElement('div');
        row.className = 'message-row ' + (sender === 'user' ? 'user-row' : 'bot-row');
        row.innerHTML = (sender === 'bot' ? '<span class="avatar">🤖</span>' : '<span class="avatar">👤</span>') + 
                        '<div class="message">' + text.replace(/\\n/g, '<br/>') + '</div>';
        msgs.appendChild(row);
        msgs.scrollTop = msgs.scrollHeight;
      };

      window.sendQuickMessage = function(text) {
        window.addMessage('user', text);
        simulateReply(text);
      };

      window.submitChat = function(e) {
        e.preventDefault();
        const input = document.getElementById('chat-input');
        const text = input.value;
        if (!text.trim()) return;
        window.addMessage('user', text);
        input.value = '';
        simulateReply(text);
      };

      function simulateReply(text) {
        const msgs = document.getElementById('chat-messages');
        const loader = document.createElement('div');
        loader.className = 'message-row bot-row chat-loader';
        loader.innerHTML = '<span class="avatar">🤖</span><div class="message">Thinking...</div>';
        msgs.appendChild(loader);
        msgs.scrollTop = msgs.scrollHeight;

        setTimeout(() => {
          loader.remove();
          const reply = getBotReply(text);
          window.addMessage('bot', reply);
        }, 600);
      }

      function getBotReply(text) {
        const q = text.toLowerCase();
        const candName = candidate.name;

        if (q.includes('contact') || q.includes('email') || q.includes('hire') || q.includes('reach') || q.includes('linkedin') || q.includes('github') || q.includes('phone')) {
          const links = [];
          if (candidate.contact.email) links.push('Email: ' + candidate.contact.email);
          if (candidate.contact.linkedin) links.push('LinkedIn: ' + candidate.contact.linkedin);
          if (candidate.contact.github) links.push('GitHub: ' + candidate.contact.github);
          if (candidate.contact.phone) links.push('Phone: ' + candidate.contact.phone);
          if (candidate.contact.website) links.push('Website: ' + candidate.contact.website);
          return 'Here are the best ways to get in touch with ' + candName + ':\\n\\n' + links.join('\\n');
        }

        if (q.includes('skill') || q.includes('tech') || q.includes('language') || q.includes('framework') || q.includes('stack')) {
          const skillGroups = candidate.skills.map(g => '• ' + g.category + ': ' + g.items.join(', ')).join('\\n');
          return 'Here is a summary of ' + candName + '\\'s tech stack:\\n\\n' + skillGroups;
        }

        if (q.includes('project') || q.includes('code') || q.includes('work') && (q.includes('build') || q.includes('make')) || q.includes('portfolio')) {
          if (candidate.projects.length === 0) return candName + ' has not listed any projects yet.';
          const projectList = candidate.projects.slice(0, 3).map(p => '• ' + p.name + ': ' + p.description).join('\\n\\n');
          return 'Here are some featured projects:\\n\\n' + projectList;
        }

        if (q.includes('experience') || q.includes('job') || q.includes('work') || q.includes('career') || q.includes('employ')) {
          if (candidate.experience.length === 0) return candName + ' is open to freelance and full-time opportunities.';
          const expList = candidate.experience.map(e => '• ' + e.role + ' at ' + e.company + ' (' + e.period + ')\\n  ' + e.description).join('\\n\\n');
          return 'Work experience snapshot:\\n\\n' + expList;
        }

        if (q.includes('education') || q.includes('school') || q.includes('degree') || q.includes('study') || q.includes('university') || q.includes('college')) {
          if (candidate.education.length === 0) return candName + ' has not listed education details.';
          const eduList = candidate.education.map(e => '• ' + e.degree + ' from ' + e.institution + ' (' + e.period + ')').join('\\n');
          return 'Academic details:\\n\\n' + eduList;
        }

        if (q.includes('about') || q.includes('who') || q.includes('bio') || q.includes('summary')) {
          return 'About ' + candName + ':\\n\\n' + candidate.about;
        }

        return 'I can answer questions about ' + candName + '\\'s experience, skills, projects, and contact info. Click one of the quick options or ask a question!';
      }

      // 3. Project search and pill filters logic
      const projectsList = ${JSON.stringify(projects)};
      const isDev = ${isDevStyle};
      let activeFilter = 'All';
      let searchQuery = '';

      const allTechs = Array.from(new Set(projectsList.flatMap(p => p.technologies || []))).filter(Boolean);
      const categories = ['All', ...allTechs.slice(0, 5)];

      function renderPills() {
        const container = document.getElementById('filter-pills');
        if (!container) return;
        container.innerHTML = '';
        categories.forEach(cat => {
          const btn = document.createElement('button');
          const isActive = cat.toLowerCase() === activeFilter.toLowerCase();
          btn.className = 'filter-pill' + (isActive ? ' active' : '');
          btn.innerText = isDev ? '[' + cat.toLowerCase().replace(/\\s+/g, '_') + ']' : cat;
          btn.addEventListener('click', () => {
            activeFilter = cat;
            renderPills();
            window.filterProjects();
          });
          container.appendChild(btn);
        });
      }

      window.filterProjects = function() {
        const searchInput = document.getElementById('project-search');
        if (searchInput) searchQuery = searchInput.value.toLowerCase();

        const cards = document.querySelectorAll('.project-card');
        let visibleCount = 0;

        projectsList.forEach((proj, idx) => {
          const card = cards[idx];
          if (!card) return;

          const matchesSearch = proj.name.toLowerCase().includes(searchQuery) || 
                                proj.description.toLowerCase().includes(searchQuery) ||
                                proj.technologies.some(t => t.toLowerCase().includes(searchQuery));

          const matchesFilter = activeFilter === 'All' || 
                                proj.technologies.some(t => t.toLowerCase() === activeFilter.toLowerCase());

          if (matchesSearch && matchesFilter) {
            card.style.display = '';
            visibleCount++;
          } else {
            card.style.display = 'none';
          }
        });

        let noResults = document.getElementById('no-projects-message');
        if (!noResults) {
          noResults = document.createElement('div');
          noResults.id = 'no-projects-message';
          noResults.className = 'project-card';
          noResults.style.textAlign = 'center';
          noResults.style.padding = '2.5rem';
          noResults.style.border = '1px solid var(--border-color)';
          noResults.style.background = 'var(--card-bg)';
          noResults.innerText = 'No projects found matching search or filter criteria.';
          document.querySelector('.projects-grid').after(noResults);
        }
        noResults.style.display = visibleCount === 0 ? '' : 'none';
      };

      renderPills();
    })();
  </script>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
.replace(/"/g, "&quot;");
}

export function getStyleConfig(
  style: PortfolioStyle,
  isDevStyle: boolean,
  isCreativeStyle: boolean
): { css: string; fontQuery: string } {
  const base = `
    /* ── CSS Variables ── */
    :root {
      --bg-main: ${isDevStyle ? "#0d1117" : isCreativeStyle ? "#0f0f1a" : "#fafafa"};
      --text-main: ${isDevStyle ? "#c9d1d9" : isCreativeStyle ? "#f0f0f5" : "#18181b"};
      --text-muted: ${isDevStyle ? "#8b949e" : isCreativeStyle ? "#a78bfa" : "#71717a"};
      --border-color: ${isDevStyle ? "#30363d" : isCreativeStyle ? "rgba(167, 139, 250, 0.2)" : "#e4e4e7"};
      --card-bg: ${isDevStyle ? "#161b22" : isCreativeStyle ? "rgba(255, 255, 255, 0.05)" : "#ffffff"};
      --accent-color: ${isDevStyle ? "#a78bfa" : isCreativeStyle ? "#a78bfa" : "#d97706"};
      --accent-bg: ${isDevStyle ? "rgba(167, 139, 250, 0.1)" : isCreativeStyle ? "rgba(167, 139, 250, 0.15)" : "rgba(217, 119, 6, 0.1)"};
      --accent-hover: ${isDevStyle ? "#58a6ff" : isCreativeStyle ? "#f472b6" : "#f59e0b"};
      --accent-alt: ${isDevStyle ? "#3fb950" : isCreativeStyle ? "#f472b6" : "#f59e0b"};
    }

    /* ── Reset ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { line-height: 1.6; background-color: var(--bg-main); color: var(--text-main); transition: background-color 0.3s, color 0.3s; }

    /* ── Navigation ── */
    nav { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; position: sticky; top: 0; z-index: 100; background: var(--card-bg); border-bottom: 1px solid var(--border-color); backdrop-filter: blur(8px); }
    .logo { font-size: 1.05rem; font-weight: 700; letter-spacing: -0.02em; color: var(--text-main); text-decoration: none; }
    .nav-links { display: flex; gap: 1.5rem; }
    .nav-links a { text-decoration: none; font-size: 0.875rem; color: var(--text-muted); transition: color 0.2s; }
    .nav-links a:hover { color: var(--text-main); }
    @media (max-width: 768px) { .nav-links { display: none; } }

    /* ── Hero ── */
    .hero { min-height: 60vh; display: flex; flex-direction: column; }
    .hero-content { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 3rem 2rem 2rem; max-width: 960px; }
    .eyebrow { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 0.85rem; }
    h1 { font-size: clamp(2rem, 5vw, 3.75rem); line-height: 1.15; margin-bottom: 0.85rem; }
    .tagline { font-size: 1.1rem; max-width: 580px; margin-bottom: 0.5rem; opacity: 0.85; }
    .tagline-sub { font-size: 0.95rem; color: var(--text-muted); max-width: 560px; margin-bottom: 1.75rem; }
    .cta { display: inline-block; padding: 0.75rem 1.75rem; text-decoration: none; font-weight: 600; border-radius: 8px; width: fit-content; transition: opacity 0.2s; }
    .cta:hover { opacity: 0.85; }

    /* ── Sections ── */
    .section { padding: 3rem 2rem; max-width: 1100px; margin: 0 auto; }
    .section h2 { font-size: 1.75rem; margin-bottom: 1.5rem; }

    /* ── Skills ── */
    .skills-grid { display: grid; gap: 1rem; grid-template-columns: 1fr; }
    @media (min-width: 540px) { .skills-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (min-width: 900px) { .skills-grid { grid-template-columns: repeat(3, 1fr); } }
    .skill-group { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 10px; padding: 1.1rem 1.25rem; transition: transform 0.2s; }
    .skill-group:hover { transform: translateY(-2px); }
    .skill-group h3 { font-size: 0.75rem; margin-bottom: 0.65rem; text-transform: uppercase; letter-spacing: 0.07em; color: var(--text-muted); }
    .skill-tags, .tech-tags { display: flex; flex-wrap: wrap; gap: 0.4rem; }
    .tag, .tech { padding: 0.3rem 0.75rem; border-radius: 999px; font-size: 0.8rem; }

    /* ── Projects ── */
    .projects-grid { display: grid; gap: 1.25rem; }
    .project-controls { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem; }
    .search-box input { padding: 0.45rem 1rem; border-radius: 8px; border: 1px solid var(--border-color); background: var(--card-bg); color: var(--text-main); font-size: 0.8rem; outline: none; }
    .filter-pills { display: flex; gap: 0.4rem; flex-wrap: wrap; }
    .filter-pill { padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.72rem; font-weight: 600; cursor: pointer; border: 1px solid var(--border-color); background: var(--card-bg); color: var(--text-muted); transition: all 0.2s; }
    .filter-pill.active { background: var(--accent-color); color: var(--bg-main); border-color: var(--accent-color); }
    .project-card, .exp-card, .edu-card { padding: 1.35rem; border-radius: 12px; background: var(--card-bg); border: 1px solid var(--border-color); transition: transform 0.2s, box-shadow 0.2s; }
    .project-card:hover, .exp-card:hover, .edu-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
    .project-card h3, .exp-card h3, .edu-card h3 { font-size: 1rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.15rem; }
    .project-header, .exp-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.85rem; gap: 0.75rem; }
    .project-desc, .exp-desc { font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.85rem; line-height: 1.55; }
    .project-link { display: inline-flex; align-items: center; gap: 0.3rem; margin-top: 0.85rem; padding: 0.4rem 0.9rem; border-radius: 6px; font-size: 0.78rem; font-weight: 600; text-decoration: none; border: 1px solid var(--border-color); background: var(--accent-bg); color: var(--accent-color); transition: all 0.2s; }
    .project-link:hover { background: var(--accent-color); color: var(--bg-main); }
    .project-card-layout { display: flex; flex-direction: column; gap: 1.25rem; }
    .project-card-image-wrapper { width: 100%; height: 11rem; overflow: hidden; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-main); position: relative; }
    .project-card-image { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
    .project-card-image-wrapper:hover .project-card-image { transform: scale(1.04); }
    .project-card-info { display: flex; flex-direction: column; justify-content: space-between; flex: 1; }
    @media (min-width: 768px) {
      .project-card-layout { display: grid; grid-template-columns: 1fr 2fr; gap: 1.25rem; }
      .project-header, .exp-header { flex-direction: row; }
      .project-card-image-wrapper { height: 9rem; }
    }
    @media (max-width: 768px) { .project-header, .exp-header { flex-direction: column; } }

    /* ── Experience ── */
    .experience-list, .education-list { display: flex; flex-direction: column; gap: 1.1rem; }
    .period { font-size: 0.78rem; color: var(--text-muted); white-space: nowrap; flex-shrink: 0; }
    .company { font-size: 0.875rem; color: var(--text-muted); margin-top: 0.15rem; }
    .role { font-weight: 600; color: var(--text-main); }
    .details { font-size: 0.82rem; color: var(--text-muted); margin-top: 0.35rem; line-height: 1.5; }
    .edu-card p { font-size: 0.875rem; color: var(--text-muted); }

    /* ── Lists ── */
    ul { margin: 0.75rem 0; padding-left: 1.15rem; }
    li { margin-bottom: 0.4rem; font-size: 0.875rem; color: var(--text-muted); }

    /* ── Contact ── */
    .contact-section { text-align: center; }
    .contact-links { display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; margin-top: 1.25rem; }
    .contact-links a { text-decoration: none; font-weight: 500; color: var(--accent-color); border: 1px solid var(--border-color); padding: 0.45rem 1rem; border-radius: 6px; transition: all 0.2s; font-size: 0.875rem; }
    .contact-links a:hover { background: var(--accent-color); color: var(--bg-main); }

    /* ── Footer ── */
    footer { text-align: center; padding: 1.75rem; font-size: 0.8rem; opacity: 0.6; border-top: 1px solid var(--border-color); }

    /* ── Theme Customizer ── */
    .theme-customizer { position: fixed; top: 1.25rem; right: 1.5rem; z-index: 1000; display: flex; align-items: center; gap: 0.4rem; padding: 0.35rem 0.75rem; border-radius: 999px; background: rgba(0,0,0,0.88); border: 1px solid rgba(255,255,255,0.18); backdrop-filter: blur(10px); box-shadow: 0 4px 16px rgba(0,0,0,0.4); }
    /* Only non-color buttons get no background */
    .theme-customizer button:not(.color-dot) { background: none; border: none; cursor: pointer; padding: 0.2rem; display: flex; align-items: center; justify-content: center; color: white; }
    .theme-customizer .divider { width: 1px; height: 1.1rem; background: rgba(255,255,255,0.25); margin: 0 0.2rem; }
    /* Color dot buttons — must not be overridden by the generic button rule */
    .color-dot { width: 1rem; height: 1rem; border-radius: 50%; border: 2px solid rgba(255,255,255,0.35); cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; padding: 0; flex-shrink: 0; }
    .color-dot:hover { transform: scale(1.3); box-shadow: 0 0 0 2px rgba(255,255,255,0.5); }
    .color-dot.active { border: 2px solid #fff; transform: scale(1.2); box-shadow: 0 0 0 2px rgba(255,255,255,0.8); }
    /* Actual fill colors — !important ensures they're never overridden */
    .color-violet { background-color: #a78bfa !important; }
    .color-emerald { background-color: #10b981 !important; }
    .color-amber { background-color: #f59e0b !important; }

    /* ── Chat Widget ── */
    .chat-widget-container { position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 1000; font-family: sans-serif; display: flex; flex-direction: column; align-items: flex-end; }
    .chat-toggle-btn { width: 3rem; height: 3rem; border-radius: 50%; background: var(--accent-color); border: none; cursor: pointer; box-shadow: 0 4px 20px rgba(0,0,0,0.35); display: flex; justify-content: center; align-items: center; font-size: 1.3rem; transition: transform 0.2s; }
    .chat-toggle-btn:hover { transform: scale(1.05); }
    .chat-window { width: 300px; height: 380px; border-radius: 16px; background: var(--card-bg); border: 1px solid var(--border-color); box-shadow: 0 8px 30px rgba(0,0,0,0.4); margin-bottom: 0.75rem; display: flex; flex-direction: column; overflow: hidden; }
    .chat-header { padding: 0.75rem 1rem; background: var(--accent-color); color: var(--bg-main); display: flex; justify-content: space-between; align-items: center; font-weight: bold; }
    .chat-header .chat-title { display: flex; align-items: center; gap: 0.5rem; font-size: 0.82rem; }
    .chat-header .close-chat { background: none; border: none; color: inherit; cursor: pointer; font-size: 0.9rem; }
    .chat-messages { flex: 1; padding: 0.85rem; overflow-y: auto; display: flex; flex-direction: column; gap: 0.65rem; }
    .message-row { display: flex; gap: 0.45rem; align-items: flex-start; }
    .message-row.user-row { justify-content: flex-end; }
    .message-row .avatar { width: 1.3rem; height: 1.3rem; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 0.8rem; }
    .message-row .message { padding: 0.45rem 0.7rem; border-radius: 12px; font-size: 0.72rem; line-height: 1.4; max-width: 80%; word-break: break-word; }
    .bot-row .message { background: var(--accent-bg); color: var(--text-main); border: 1px solid var(--border-color); }
    .user-row .message { background: var(--accent-color); color: var(--bg-main); }
    .chat-quick-actions { padding: 0.45rem 0.85rem; display: flex; flex-wrap: wrap; gap: 0.3rem; border-top: 1px solid var(--border-color); }
    .chat-quick-actions button { background: var(--card-bg); border: 1px solid var(--border-color); color: var(--text-main); border-radius: 12px; padding: 0.2rem 0.45rem; font-size: 0.62rem; cursor: pointer; transition: all 0.2s; }
    .chat-quick-actions button:hover { border-color: var(--accent-color); color: var(--accent-color); }
    .chat-input-form { display: flex; padding: 0.45rem; border-top: 1px solid var(--border-color); gap: 0.45rem; }
    .chat-input-form input { flex: 1; border: 1px solid var(--border-color); background: var(--bg-main); color: var(--text-main); padding: 0.35rem 0.65rem; border-radius: 8px; font-size: 0.72rem; outline: none; }
    .chat-input-form button { background: var(--accent-color); border: none; color: var(--bg-main); padding: 0.35rem 0.65rem; border-radius: 8px; font-size: 0.72rem; cursor: pointer; font-weight: bold; }
    .chat-loader { font-style: italic; }

    /* ── Hero Variants ── */
    .hero-flex { display: flex; flex-direction: column; gap: 2rem; width: 100%; align-items: center; }
    .dev-hero-flex { align-items: flex-start; }
    @media (min-width: 768px) {
      .hero-flex { flex-direction: row; }
      .hero-editor-container { flex: 1; }
    }
    .hero-editor { text-align: left; padding: 1.75rem; border-radius: 8px; border: 1px solid var(--border-color); background: var(--card-bg); font-family: 'JetBrains Mono', monospace; font-size: 0.82rem; max-width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .hero-editor h1 { font-size: clamp(1.1rem, 3.5vw, 2rem); line-height: 1.4; color: var(--text-main); margin: 0.85rem 0; font-family: 'JetBrains Mono', monospace; font-weight: 500; }
    .editor-import { color: var(--accent-hover); }
    .keyword { color: var(--accent-hover); }
    .variable { color: var(--accent-color); }
    .val { color: var(--accent-hover); }
    .indent { padding-left: 1.5rem; }
    .editor-comment { color: var(--accent-alt); margin-top: 0.85rem; }
    .editor-header { border-bottom: 1px solid var(--border-color); padding-bottom: 0.45rem; margin-bottom: 0.85rem; font-size: 0.7rem; color: var(--text-muted); }
    .dev-avatar-box { width: 100%; max-width: 13rem; flex-shrink: 0; border-radius: 8px; border: 1px solid var(--border-color); background: var(--card-bg); padding: 0.9rem; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
    .dev-avatar-header { display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 0.62rem; color: var(--text-muted); margin-bottom: 0.65rem; font-family: 'JetBrains Mono', monospace; padding-bottom: 0.45rem; }
    .dev-avatar-header .status-ok { color: var(--accent-alt); }
    .dev-avatar-img { display: block; margin: 0 auto; width: 7.5rem; height: 7.5rem; border-radius: 8px; border: 1px solid var(--border-color); object-fit: cover; transition: transform 0.3s; }
    .dev-avatar-img:hover { transform: scale(1.05); }
    .creative-avatar-container { margin-bottom: 1.5rem; position: relative; width: 8.5rem; height: 8.5rem; display: inline-block; }
    .creative-avatar-glow { position: absolute; inset: 0; border-radius: 50%; background: linear-gradient(135deg, var(--accent-color), var(--accent-hover)); filter: blur(8px); opacity: 0.6; }
    .creative-avatar-img { position: relative; width: 8.5rem; height: 8.5rem; border-radius: 50%; border: 4px solid var(--bg-main); object-fit: cover; box-shadow: 0 10px 25px rgba(0,0,0,0.4); transition: transform 0.3s; }
    .creative-avatar-img:hover { transform: scale(1.05); }
    .minimal-hero-container { display: flex; flex-direction: column-reverse; gap: 1.5rem; width: 100%; align-items: center; justify-content: space-between; }
    .minimal-hero-text { flex: 1; text-align: left; width: 100%; }
    .minimal-avatar-container { width: 9rem; height: 9rem; flex-shrink: 0; }
    .minimal-avatar-img { width: 9rem; height: 9rem; border-radius: 50%; border: 2px solid var(--border-color); object-fit: cover; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    @media (min-width: 640px) { .minimal-hero-container { flex-direction: row; gap: 2rem; } }

    /* ── About Variants ── */
    .minimal-about-card { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.5rem 1.75rem; font-size: 0.95rem; line-height: 1.75; color: var(--text-main); }
    .dev-about-card { font-family: 'JetBrains Mono', monospace; background: var(--card-bg); border: 1px solid var(--border-color); padding: 1.35rem; border-radius: 8px; font-size: 0.875rem; }
    .creative-about-card { position: relative; background: var(--card-bg); border: 1px solid var(--border-color); padding: 1.75rem; border-radius: 16px; backdrop-filter: blur(8px); }
    .quote-mark { font-size: 2.25rem; color: var(--accent-bg); line-height: 0.1; display: block; margin-bottom: 0.5rem; }
    .creative-about-text { padding: 0 1.25rem; font-style: italic; color: var(--text-main); }
    .font-serif { font-family: Georgia, Cambria, "Times New Roman", Times, serif; }
    .text-right { text-align: right; }

    /* ── Creative Extras ── */
    .creative-badge { display: inline-flex; align-items: center; gap: 0.5rem; background: var(--accent-bg); border: 1px solid var(--border-color); padding: 0.3rem 0.9rem; border-radius: 999px; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent-color); margin-bottom: 0.85rem; }
    .creative-sub { font-size: 0.95rem; color: var(--accent-hover); font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1.5rem; }
    .creative-bullet { list-style: none; position: relative; }
    .creative-project-card { display: flex; flex-direction: column; gap: 0; overflow: hidden; }
    .creative-project-image-wrapper { height: 10rem; border-radius: 0; border: none; border-bottom: 1px solid var(--border-color); }
    .creative-project-info { padding: 1.35rem; }

    /* ── Dev Extras ── */
    .dev-skill-group h3 { color: var(--accent-alt); text-transform: none; letter-spacing: normal; font-family: 'JetBrains Mono', monospace; }
    .bracket-close { color: var(--accent-alt); font-family: 'JetBrains Mono', monospace; margin-top: 0.25rem; }
    .dev-bullet { list-style: none; color: var(--text-muted); }

    /* ── Metrics ── */
    .metrics-section { margin-top: 0.5rem; }
    .metrics-grid { display: grid; gap: 0.85rem; grid-template-columns: 1fr; margin-top: 1.25rem; }
    @media (min-width: 640px) { .metrics-grid { grid-template-columns: repeat(3, 1fr); } }
    .metric-card { position: relative; border-radius: 12px; border: 1px solid var(--border-color); background: var(--card-bg); padding: 1.1rem; transition: transform 0.2s, box-shadow 0.2s; }
    .metric-card:hover { transform: translateY(-3px); }
    .metric-card.dev-metric { font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; color: var(--text-main); }
    .dev-metric .metric-header { display: flex; justify-content: space-between; color: var(--accent-alt); font-size: 0.62rem; margin-bottom: 0.45rem; }
    .dev-metric .metric-value { font-size: 1.4rem; font-weight: bold; color: var(--accent-color); margin-bottom: 0.2rem; }
    .dev-metric .metric-label { font-size: 0.62rem; color: var(--text-muted); line-height: 1.4; }
    .metric-card.creative-metric { overflow: hidden; backdrop-filter: blur(8px); }
    .creative-metric .metric-glow { position: absolute; inset: 0; background: linear-gradient(135deg, var(--accent-color), var(--accent-hover)); opacity: 0.03; }
    .creative-metric:hover { border-color: rgba(167, 139, 250, 0.3); box-shadow: 0 10px 25px rgba(167, 139, 250, 0.08); }
    .creative-metric .metric-icon { color: var(--accent-hover); font-size: 0.9rem; margin-bottom: 0.65rem; }
    .creative-metric .metric-value { font-size: 1.75rem; font-weight: 800; background: linear-gradient(135deg, #fff, var(--accent-hover)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 0.3rem; line-height: 1; }
    .creative-metric .metric-label { font-size: 0.68rem; color: rgba(240, 240, 245, 0.6); font-weight: 300; line-height: 1.4; }
    .metric-card.minimal-metric { box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .minimal-metric .metric-icon { font-size: 1rem; margin-bottom: 0.65rem; }
    .minimal-metric .metric-value { font-size: 1.4rem; font-weight: bold; color: var(--text-main); margin-bottom: 0.3rem; }
    .minimal-metric .metric-label { font-size: 0.68rem; color: var(--text-muted); font-weight: 500; line-height: 1.4; }
  `;



  const styles: Record<PortfolioStyle, { css: string; fontQuery: string }> = {
    minimal: {
      fontQuery: "Inter:wght@400;500;600;700",
      css:
        base +
        `
        body { font-family: 'Inter', sans-serif; }
        nav { border-bottom: 1px solid var(--border-color); background: var(--card-bg); }
        .nav-links a { color: var(--text-muted); }
        .hero { background: var(--card-bg); }
        .eyebrow { color: var(--text-muted); }
        .cta { background: var(--accent-color); color: var(--bg-main); }
        .section h2 { color: var(--text-main); border-bottom: 2px solid var(--accent-color); padding-bottom: 0.5rem; display: inline-block; }
        .tag { background: var(--accent-bg); color: var(--accent-color); border: 1px solid var(--border-color); }
        .tech { background: var(--accent-color); color: var(--bg-main); }
        .project-card, .exp-card, .edu-card { background: var(--card-bg); border: 1px solid var(--border-color); }
        .period { color: var(--text-muted); }
        .company { color: var(--text-muted); }
        footer { background: var(--card-bg); border-top: 1px solid var(--border-color); }
        .projects-grid { display: flex; flex-direction: column; gap: 1.5rem; }
        .skills-grid { display: flex; flex-direction: column; gap: 1.5rem; }
      `,
    },
    creative: {
      fontQuery: "Sora:wght@400;500;600;700&family=DM+Sans:wght@400;500",
      css:
        base +
        `
        body { font-family: 'DM Sans', sans-serif; }
        nav { background: var(--card-bg); backdrop-filter: blur(12px); position: sticky; top: 0; z-index: 10; }
        .logo { font-family: 'Sora', sans-serif; font-weight: 700; background: linear-gradient(135deg, var(--accent-color), var(--accent-hover)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .nav-links a { color: var(--text-muted); }
        .hero { background: transparent; }
        .eyebrow { color: var(--accent-color); }
        h1 { font-family: 'Sora', sans-serif; background: linear-gradient(135deg, #fff 0%, var(--accent-color) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .cta { background: linear-gradient(135deg, var(--accent-color), var(--accent-hover)); color: #fff; border-radius: 999px; }
        .section h2 { font-family: 'Sora', sans-serif; color: var(--text-main); }
        .tag { background: var(--accent-bg); color: var(--text-main); border: 1px solid var(--border-color); }
        .tech { background: var(--accent-bg); color: var(--accent-color); }
        .project-card, .exp-card, .edu-card { background: var(--card-bg); border: 1px solid var(--border-color); backdrop-filter: blur(8px); }
        .period { color: var(--accent-color); }
        footer { color: var(--text-muted); }
        .projects-grid { display: grid; gap: 1.5rem; grid-template-columns: 1fr; }
        @media (min-width: 768px) {
          .projects-grid { grid-template-columns: repeat(2, 1fr); }
        }
        .skills-grid { display: grid; gap: 1.5rem; grid-template-columns: 1fr; }
        @media (min-width: 640px) {
          .skills-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `,
    },
    developer: {
      fontQuery: "JetBrains+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600",
      css:
        base +
        `
        body { font-family: 'IBM Plex Sans', sans-serif; }
        nav { border-bottom: 1px solid var(--border-color); background: var(--card-bg); font-family: 'JetBrains Mono', monospace; }
        .logo { color: var(--accent-hover); }
        .logo::before { content: '> '; color: var(--accent-alt); }
        .nav-links a { color: var(--text-muted); font-family: 'IBM Plex Sans', sans-serif; }
        .nav-links a:hover { color: var(--accent-hover); }
        .hero { background: var(--bg-main); }
        .hero-content { border-left: 3px solid var(--accent-alt); padding-left: 2rem; }
        .eyebrow { color: var(--accent-alt); font-family: 'JetBrains Mono', monospace; }
        .eyebrow::before { content: '// '; }
        h1 { font-family: 'JetBrains Mono', monospace; color: var(--text-main); }
        .tagline { font-family: 'IBM Plex Sans', sans-serif; color: var(--text-muted); }
        .cta { background: var(--card-bg); color: var(--accent-alt); font-family: 'JetBrains Mono', monospace; border: 1px solid var(--accent-alt); }
        .section h2 { font-family: 'JetBrains Mono', monospace; color: var(--accent-hover); }
        .section h2::before { content: '## '; color: var(--accent-alt); }
        .tag { background: var(--card-bg); color: var(--accent-color); border: 1px solid var(--border-color); font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; }
        .tech { background: var(--card-bg); color: var(--accent-alt); font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; }
        .project-card, .exp-card, .edu-card { background: var(--card-bg); border: 1px solid var(--border-color); }
        .project-card h3, .exp-card h3 { font-family: 'JetBrains Mono', monospace; color: var(--text-main); }
        .period { color: var(--text-muted); font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; }
        .company { color: var(--accent-hover); }
        footer { border-top: 1px solid var(--border-color); color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
        .projects-grid { display: flex; flex-direction: column; gap: 1.5rem; }
        .skills-grid { display: flex; flex-direction: column; gap: 1.5rem; }
      `,
    },
  };

  return styles[style];
}

export function generateExportFilename(name: string): string {
  return `${slugify(name)}-portfolio`;
}

/** Generate a Vercel-ready static site package */
export async function downloadPortfolioZip(
  portfolio: EnhancedPortfolio,
  style: PortfolioStyle
): Promise<void> {
  const html = generatePortfolioHTML(portfolio, style, true);
  const styleConfig = getStyleConfig(style, style === "developer", style === "creative");
  const slug = generateExportFilename(portfolio.name);

  const zip = new JSZip();
  zip.file("index.html", html);
  zip.file("style.css", styleConfig.css);

  // Helper to fetch local files as blob and add to zip
  const addAssetToZip = async (fileName: string, url: string) => {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const blob = await res.blob();
        zip.file(fileName, blob);
      }
    } catch (e) {
      console.error(`Failed to add asset ${fileName} to zip:`, e);
    }
  };

  // Add avatars and project images to the zip if they are local
  const avatarUrl = portfolio.contact?.avatarUrl || "/avatar.png";
  if (avatarUrl.startsWith("/")) {
    const cleanAvatarName = avatarUrl.slice(1) || "avatar.png";
    await addAssetToZip(cleanAvatarName, avatarUrl);
  }
  await addAssetToZip("project1.png", "/project1.png");
  await addAssetToZip("project2.png", "/project2.png");
  await addAssetToZip("project3.png", "/project3.png");

  zip.file(
    "vercel.json",
    JSON.stringify({
      version: 2,
      cleanUrls: true,
    })
  );
  zip.file(
    "package.json",
    JSON.stringify({
      name: slug,
      version: "1.0.0",
      private: true,
      description: `${portfolio.name} portfolio — generated by AI Resume Portfolio Builder`,
    })
  );
  zip.file(
    "README.md",
    `# ${portfolio.name} Portfolio\n\nDeploy to Vercel:\n\n1. Push to GitHub or run vercel deploy\n2. Or drag this folder to vercel.com/new\n\nGenerated by AI Resume Portfolio Builder`
  );

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `${slug}-vercel.zip`);
}

/** Generate and download a fully self-contained HTML + CSS ZIP package.
 * CSS is inlined directly in the HTML so it works offline and from file:// URLs.
 */
export async function downloadPortfolioWebsiteZip(
  portfolio: EnhancedPortfolio,
  style: PortfolioStyle
): Promise<void> {
  // Use externalCSS=false → CSS is inlined inside <style> tags in the HTML.
  // This makes the HTML file 100% self-contained and works when opened locally,
  // dragged into a browser, or hosted on any server without needing to resolve
  // a separate style.css file.
  const html = generatePortfolioHTML(portfolio, style, false);
  const slug = generateExportFilename(portfolio.name);

  const zip = new JSZip();
  zip.file("index.html", html);

  // Helper to fetch local files as blob and add to zip
  const addAssetToZip = async (fileName: string, url: string) => {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const blob = await res.blob();
        zip.file(fileName, blob);
      }
    } catch (e) {
      console.error(`Failed to add asset ${fileName} to zip:`, e);
    }
  };

  // Add avatars and project images to the zip if they are local
  const avatarUrl = portfolio.contact?.avatarUrl || "/avatar.png";
  if (avatarUrl.startsWith("/")) {
    const cleanAvatarName = avatarUrl.slice(1) || "avatar.png";
    await addAssetToZip(cleanAvatarName, avatarUrl);
  }
  await addAssetToZip("project1.png", "/project1.png");
  await addAssetToZip("project2.png", "/project2.png");
  await addAssetToZip("project3.png", "/project3.png");

  zip.file(
    "README.md",
    `# ${portfolio.name} Portfolio\n\nHow to view:\n1. Extract this ZIP\n2. Open index.html in any browser\n\nAll styles are embedded inside index.html — no extra setup needed.\n\nGenerated by AI Resume Portfolio Builder`
  );

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `${slug}-website.zip`);
}
