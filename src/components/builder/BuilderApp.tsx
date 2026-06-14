"use client";

import { useCallback, useState } from "react";
import {
  ArrowLeft,
  Download,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Pencil,
  Loader2,
} from "lucide-react";
import { ResumeUploader } from "@/components/upload/ResumeUploader";
import { StyleSelector } from "@/components/builder/StyleSelector";
import { PreviewPanel } from "@/components/builder/PreviewPanel";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EditSidebar } from "@/components/editor/EditSidebar";
import { ToneSelector } from "@/components/editor/ToneSelector";
import { VersionHistory } from "@/components/editor/VersionHistory";
import { usePortfolioStore } from "@/store/portfolio-store";
import { generatePortfolioHTML, downloadPortfolioZip, downloadPortfolioWebsiteZip } from "@/lib/export";
import type { EnhancedPortfolio, ToneMode, RoleType } from "@/types/portfolio";

const PROCESSING_STEPS = [
  "Extracting resume content...",
  "Structuring skills & experience...",
  "Detecting role & analyzing gaps...",
  "Enhancing with AI copywriting...",
  "Applying tone & building portfolio...",
];

const AUTO_ENHANCE_STEPS = [
  "Analyzing typography & layout structure...",
  "Quantifying project achievements & metrics...",
  "Refining work experience achievements...",
  "Optimizing SEO titles and keywords...",
];

const COPILOT_STEPS = [
  "Parsing request commands...",
  "Applying modifications to schema...",
  "Synthesizing dynamic draft...",
  "Finalizing layout compile...",
];

function getOfflineTonedPortfolio(data: EnhancedPortfolio, tone: ToneMode): EnhancedPortfolio {
  const updated = { ...data };
  const role = data.roleType || "general";

  // Templates for Taglines based on roleType and tone
  const taglines: Record<RoleType, Record<ToneMode, string>> = {
    developer: {
      professional: `${data.title || "Software Engineer"} focused on building scalable, high-performance web applications and systems.`,
      creative: `Code architect shaping the future of tech with elegant algorithms and interactive systems.`,
      startup: `Full-stack engineer shipping fast, scaling systems, and driving product engineering from 0 to 1.`,
    },
    designer: {
      professional: `${data.title || "UX/UI Designer"} specialized in crafting intuitive, accessible, and elegant user interfaces.`,
      creative: `Visual storyteller designing immersive experiences that blend art, technology, and psychology.`,
      startup: `Product designer building high-growth interfaces, fast prototypes, and converting landing pages.`,
    },
    product: {
      professional: `${data.title || "Product Manager"} dedicated to bridging user needs and technical feasibility.`,
      creative: `Visionary product strategist transforming complex problems into simple, delighting user journeys.`,
      startup: `Growth PM shipping MVP experiments, iterating on feedback loops, and driving retention metrics.`,
    },
    data: {
      professional: `${data.title || "Data Scientist"} specialized in predictive modeling, stats analysis, and business intelligence.`,
      creative: `Data whisperer translating complex numeric telemetry into beautiful, visual stories.`,
      startup: `Analytics lead building data pipelines, tracking core North Star metrics, and optimizing conversions.`,
    },
    marketing: {
      professional: `${data.title || "Marketing Strategist"} focused on brand positioning, user acquisition, and organic growth.`,
      creative: `Campaign copywriter building engaging brand identities and viral multimedia content.`,
      startup: `Growth hacker scaling loops, managing performance budgets, and optimizing conversion funnels.`,
    },
    student: {
      professional: `Aspiring specialist eager to contribute academic knowledge and problem-solving skills to real projects.`,
      creative: `Enthusiastic explorer crafting unique side projects at the intersection of design and tech.`,
      startup: `Hungry builder shipping MVPs, learning in public, and building products from scratch.`,
    },
    general: {
      professional: `Dedicated specialist focused on operational excellence, quality assurance, and execution.`,
      creative: `Multi-disciplinary thinker exploring creative avenues and narrative storytelling.`,
      startup: `Action-oriented generalist driving results and shipping impact in high-velocity teams.`,
    },
  };

  // Templates for About sections based on roleType and tone
  const abouts: Record<RoleType, Record<ToneMode, string>> = {
    developer: {
      professional: `I am a structured and results-driven ${data.title || "Software Engineer"} with a proven track record of designing, developing, and deploying robust applications. I focus on software engineering best practices, writing clean and maintainable code, and optimizing system architectures to deliver business value.`,
      creative: `I view programming as a creative craft where code meets canvas. By building interactive frontends, smooth animations, and clean database structures, I design experiences that are as beautiful as they are technically sound. I love exploring new frameworks and learning in public.`,
      startup: `I am a high-velocity product engineer who loves shipping code and solving hard scaling problems. I thrive in fast-paced environments, managing database queries, full-stack pipelines, and deployment automation. I focus on shipping MVPs, iterating on feedback, and driving metric improvements.`,
    },
    designer: {
      professional: `I am a professional ${data.title || "UX/UI Designer"} dedicated to crafting structured design systems and user-centric interfaces. By conducting user research, wireframing, and running usability tests, I ensure all products are visually cohesive, accessible, and strategically aligned with business goals.`,
      creative: `I design at the intersection of aesthetic expression and human behavior. I love crafting immersive visual styles, dark mode flows, and micro-interactions that make interfaces feel alive and responsive. I specialize in creative typography, harmonic palettes, and custom illustrations.`,
      startup: `I am a growth-focused product designer who builds fast and validates early. I create clickable Figma prototypes, ship landing pages, and analyze user session replays to optimize onboarding conversion. I work in high-speed sprints to scale interfaces from concept to launch.`,
    },
    product: {
      professional: `I am a structured ${data.title || "Product Manager"} specialized in roadmapping, requirement gathering, and stakeholder management. I focus on bringing data-backed prioritization to backlog items, tracking sprint metrics, and ensuring development teams deliver features on time.`,
      creative: `I am a customer-obsessed product strategist who loves designing visual roadmaps and narrative product visions. I believe product management is about understanding the user's emotional needs and translating them into delightful features that feel simple and intuitive.`,
      startup: `I am an execution-first product lead. I write lean specs, manage rapid product launch sprints, and track growth metrics (LTV, CAC, activation). I focus on maximizing speed of learning and shipping experiments to reach product-market fit.`,
    },
    data: {
      professional: `I am a ${data.title || "Data Analyst"} specialized in statistical modeling, database warehousing, and dashboard reporting. I translate raw corporate telemetry into clean structured datasets to support executive leadership decision-making and operational strategy.`,
      creative: `I am a data communicator who believes charts tell stories. I synthesize complex mathematical analytics and machine learning predictions into interactive visual data dashboards and slide decks that make metrics understandable and engaging.`,
      startup: `I am a performance data engineer focused on setting up event tracking, building analytics funnels, and uncovering growth opportunities. I design and analyze A/B tests to optimize conversion loops and drive data-driven product iterations.`,
    },
    marketing: {
      professional: `I am a marketing strategist with experience managing multi-channel acquisition budgets, organic search engine optimization, and brand metrics. I focus on structured performance reports and customer acquisition cost optimization.`,
      creative: `I am a brand storyteller who loves writing copy, designing social content, and crafting viral campaigns. I believe marketing is about building community, driving narratives, and creating experiences that resonate with audience emotions.`,
      startup: `I am a performance marketing hacker. I set up low-cost lead generation loops, manage paid ad campaigns, design high-converting landing page variants, and optimize email onboarding flows to acquire users at high velocity.`,
    },
    student: {
      professional: `I am a dedicated student pursuing my degree, with academic training in industry standards and core technologies. I am seeking to apply my research skills, structured training, and analytical focus to a professional team.`,
      creative: `I am a curious learner who loves building side projects, joining hackathons, and exploring design trends. I am looking for a creative team where I can experiment, learn in public, and grow my skills.`,
      startup: `I am a proactive student builder. I have shipped small apps, written online content, and taught myself coding and marketing. I am looking to bring my energy, fast learning pace, and builder mindset to a high-growth team.`,
    },
    general: {
      professional: `I am a dedicated specialist focused on operational execution, clear communication, and process management. I bring structure and focus to collaborative team projects and maintain high standards of delivery.`,
      creative: `I am a multi-disciplinary generalist who loves connecting different domains and perspectives to solve problems. I bring narrative insight and creative thinking to projects.`,
      startup: `I am a hands-on generalist ready to wear multiple hats. I focus on rapid execution, taking ownership of tasks, and helping early-stage projects launch and scale.`,
    },
  };

  updated.tagline = taglines[role]?.[tone] || data.tagline;
  updated.about = abouts[role]?.[tone] || data.about;

  return updated;
}

export function BuilderApp() {
  const {
    step,
    error,
    editedData,
    selectedTemplate,
    tone,
    aiEnabled,
    contentGaps,
    setProcessing,
    setError,
    setPipelineResult,
    setTemplate,
    setTone,
    applyEditedData,
    versions,
    saveVersion,
    reset,
  } = usePortfolioStore();

  const [processingMsg, setProcessingMsg] = useState(PROCESSING_STEPS[0]);
  const [editMode, setEditMode] = useState(true);
  const [toneApplying, setToneApplying] = useState(false);
  const [autoEnhancing, setAutoEnhancing] = useState(false);
  const [enhanceStepIndex, setEnhanceStepIndex] = useState(0);

  const [copilotPrompt, setCopilotPrompt] = useState("");
  const [copilotApplying, setCopilotApplying] = useState(false);
  const [copilotStepIndex, setCopilotStepIndex] = useState(0);

  const handleAutoEnhance = async () => {
    if (!editedData || !aiEnabled) return;
    setAutoEnhancing(true);
    setEnhanceStepIndex(0);

    const stepTimer = setInterval(() => {
      setEnhanceStepIndex((prev) => (prev < 3 ? prev + 1 : prev));
    }, 1200);

    try {
      const res = await fetch("/api/ai/enhance-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editedData, tone }),
      });
      const json = await res.json();
      if (res.ok && json.enhanced) {
        applyEditedData(json.enhanced);
        saveVersion(`v${versions.length + 1} - AI Enhanced`);
      } else {
        throw new Error(json.error || "Enhancement failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI Enhancement failed");
    } finally {
      clearInterval(stepTimer);
      setAutoEnhancing(false);
    }
  };

  const handleCopilotEdit = async (customPrompt?: string) => {
    const activePrompt = customPrompt || copilotPrompt;
    if (!editedData || !activePrompt.trim() || !aiEnabled) return;

    setCopilotApplying(true);
    setCopilotStepIndex(0);

    const stepTimer = setInterval(() => {
      setCopilotStepIndex((prev) => (prev < 3 ? prev + 1 : prev));
    }, 1100);

    try {
      const res = await fetch("/api/ai/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editedData, instruction: activePrompt }),
      });
      const json = await res.json();
      if (res.ok && json.edited) {
        applyEditedData(json.edited);
        const shortPrompt = activePrompt.length > 25 ? activePrompt.slice(0, 25) + "..." : activePrompt;
        saveVersion(`v${versions.length + 1} - AI Prompt: "${shortPrompt}"`);
        setCopilotPrompt("");
      } else {
        throw new Error(json.error || "Copilot edit failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI Copilot edit failed");
    } finally {
      clearInterval(stepTimer);
      setCopilotApplying(false);
    }
  };

  const processResume = useCallback(
    async (formData: FormData) => {
      setProcessing();
      setProcessingMsg(PROCESSING_STEPS[0]);

      for (let i = 0; i < PROCESSING_STEPS.length; i++) {
        setProcessingMsg(PROCESSING_STEPS[i]);
        await new Promise((r) => setTimeout(r, 500));
      }

      try {
        formData.append("style", selectedTemplate);
        formData.append("tone", tone);

        const res = await fetch("/api/generate", {
          method: "POST",
          body: formData,
        });

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || "Failed to generate portfolio");
        }

        setPipelineResult({
          userData: json.userData,
          aiEnhancedData: json.portfolio,
          aiEnabled: json.aiEnabled,
          contentGaps: json.contentGaps,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    },
    [selectedTemplate, tone, setProcessing, setError, setPipelineResult]
  );

  const handleTextSubmit = (text: string) => {
    const formData = new FormData();
    formData.append("text", text);
    processResume(formData);
  };

  const handleFileSubmit = (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    processResume(formData);
  };

  const handleDownloadHtml = async () => {
    if (!editedData) return;
    await downloadPortfolioWebsiteZip(editedData, selectedTemplate);
  };

  const handleDownloadZip = async () => {
    if (!editedData) return;
    await downloadPortfolioZip(editedData, selectedTemplate);
  };

  const handleOpenPreview = () => {
    if (!editedData) return;
    const html = generatePortfolioHTML(editedData, selectedTemplate);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const handleToneApply = async (newTone: typeof tone) => {
    if (!editedData) return;
    setTone(newTone);

    if (!aiEnabled) {
      const fallbackData = getOfflineTonedPortfolio(editedData, newTone);
      applyEditedData(fallbackData);
      saveVersion(`v${versions.length + 1} - Tone: ${newTone} (Offline)`);
      return;
    }

    setToneApplying(true);
    try {
      const res = await fetch("/api/ai/tone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editedData, tone: newTone }),
      });
      const json = await res.json();
      if (res.ok && json.adjusted) {
        applyEditedData({ ...editedData, ...json.adjusted });
        saveVersion(`v${versions.length + 1} - Tone: ${newTone}`);
      }
    } finally {
      setToneApplying(false);
    }
  };


  if (step === "processing") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <LoadingSpinner message={processingMsg} />
        <div className="mt-8 flex gap-2">
          {PROCESSING_STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-1.5 w-12 rounded-full transition-colors sm:w-16 ${PROCESSING_STEPS.indexOf(processingMsg) >= i
                ? "bg-indigo-500"
                : "bg-zinc-800"
                }`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (step === "preview" && editedData) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col lg:flex-row">
        <aside className="w-full shrink-0 overflow-y-auto border-b border-zinc-800 bg-zinc-950 p-6 lg:w-[420px] lg:border-b-0 lg:border-r">
          <button
            onClick={() => {
              reset();
            }}
            className="mb-6 flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Start Over
          </button>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">{editedData.name}</h2>
            <p className="text-sm text-zinc-400">{editedData.tagline}</p>
            <span className="mt-2 inline-block rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs text-indigo-300">
              {editedData.roleType}
            </span>
          </div>

          {/* AI Auto-Enhance Button Card */}
          <Card className="mb-6 border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-zinc-900 to-indigo-950/20 p-5 shadow-[0_0_15px_rgba(99,102,241,0.1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 -mr-6 -mt-6 rounded-full bg-indigo-500/10 blur-xl pointer-events-none" />
            <div className="relative z-10">
              <h3 className="mb-1.5 flex items-center gap-2 text-sm font-bold text-white">
                <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
                AI Website Optimizer
              </h3>
              <p className="mb-4 text-xs text-zinc-400 leading-relaxed">
                Elevate your resume content. Rewrite biographies, add quantified metrics (~X%), structure projects as case studies, and generate optimized meta tags.
              </p>
              <Button
                onClick={handleAutoEnhance}
                disabled={!aiEnabled || autoEnhancing}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white border-0 shadow-lg shadow-indigo-650/20 py-2.5 font-semibold text-xs relative overflow-hidden group cursor-pointer"
              >
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  Auto-Enhance Entire Site
                </span>
              </Button>
              {!aiEnabled && (
                <p className="mt-2.5 text-[10px] text-amber-300/95 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  OpenAI API Key required to run auto-enhancement.
                </p>
              )}
            </div>
          </Card>

          {/* AI Copilot Assistant Command Card */}
          <Card className="mb-6 border border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-zinc-900 to-purple-950/20 p-5 shadow-[0_0_15px_rgba(167,139,250,0.1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 -mr-6 -mt-6 rounded-full bg-purple-500/10 blur-xl pointer-events-none" />
            <div className="relative z-10">
              <h3 className="mb-1.5 flex items-center gap-2 text-sm font-bold text-white">
                <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
                AI Copilot Editor
              </h3>
              <p className="mb-3.5 text-xs text-zinc-400 leading-relaxed">
                Add, remove, or modify elements on your site using natural language.
              </p>

              <div className="space-y-3">
                <textarea
                  placeholder="e.g. 'Add a React project named E-Commerce App', 'Remove the first experience bullet', 'Translate my whole biography into French'..."
                  value={copilotPrompt}
                  onChange={(e) => setCopilotPrompt(e.target.value)}
                  className="w-full h-20 rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
                  disabled={!aiEnabled || copilotApplying}
                />

                {/* Suggestions quick tags */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  <button
                    onClick={() => handleCopilotEdit("Add a featured project in React and TypeScript")}
                    disabled={!aiEnabled || copilotApplying}
                    className="text-[10px] bg-purple-950/30 hover:bg-purple-950/60 text-purple-300 border border-purple-800/40 rounded-full px-2.5 py-0.5 transition-colors cursor-pointer"
                  >
                    ➕ Add Project
                  </button>
                  <button
                    onClick={() => handleCopilotEdit("Remove the first project from my list")}
                    disabled={!aiEnabled || copilotApplying}
                    className="text-[10px] bg-purple-950/30 hover:bg-purple-950/60 text-purple-300 border border-purple-800/40 rounded-full px-2.5 py-0.5 transition-colors cursor-pointer"
                  >
                    ➖ Remove Project
                  </button>
                  <button
                    onClick={() => handleCopilotEdit("Rewrite my biography to sound like a startup founder")}
                    disabled={!aiEnabled || copilotApplying}
                    className="text-[10px] bg-purple-950/30 hover:bg-purple-950/60 text-purple-300 border border-purple-800/40 rounded-full px-2.5 py-0.5 transition-colors cursor-pointer"
                  >
                    ✍️ Rewrite Bio
                  </button>
                </div>

                <Button
                  onClick={() => handleCopilotEdit()}
                  disabled={!aiEnabled || !copilotPrompt.trim() || copilotApplying}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0 shadow-lg py-2 text-xs font-semibold cursor-pointer"
                >
                  Apply AI Edit
                </Button>
              </div>
            </div>
          </Card>

          {aiEnabled === false && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              Running in smart fallback mode. Add OPENAI_API_KEY for full AI enhancement.
            </div>
          )}

          {(contentGaps?.suggestions?.length || editedData.improvements.length) > 0 && (
            <Card className="mb-6 p-4">
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
                <Sparkles className="h-3 w-3" />
                AI Suggestions
                {contentGaps?.score && (
                  <span className="ml-auto text-zinc-500">Score: {contentGaps.score}/100</span>
                )}
              </p>
              <ul className="space-y-2">
                {(contentGaps?.suggestions || editedData.improvements).map((imp) => (
                  <li key={imp} className="flex gap-2 text-xs text-zinc-400">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-indigo-400" />
                    {imp}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <div className="mb-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Template
            </p>
            <StyleSelector selected={selectedTemplate} onSelect={setTemplate} />
          </div>

          <div className="mb-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Tone
            </p>
            <ToneSelector
              selected={tone}
              onSelect={setTone}
              onApply={handleToneApply}
              applying={toneApplying}
            />
            {toneApplying && (
              <p className="mt-2 flex items-center gap-2 text-xs text-indigo-400">
                <Loader2 className="h-3 w-3 animate-spin" />
                Applying tone...
              </p>
            )}
          </div>

          <div className="mb-6">
            <button
              onClick={() => setEditMode(!editMode)}
              className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-300 font-mono"
            >
              <Pencil className="h-3 w-3" />
              Live Editor {editMode ? "(on)" : "(off)"}
            </button>
            {editMode && (
              <div className="space-y-3">
                <EditSidebar />
              </div>
            )}
          </div>

          <VersionHistory />

          <div className="mt-6 space-y-3">
            <Button onClick={handleDownloadHtml} className="w-full" size="lg">
              <Download className="h-4 w-4" />
              Download HTML + CSS (ZIP)
            </Button>
            <Button onClick={handleDownloadZip} variant="outline" className="w-full" size="lg">
              <Download className="h-4 w-4" />
              Export Vercel Package
            </Button>
            <Button
              onClick={handleOpenPreview}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <ExternalLink className="h-4 w-4" />
              Open Full Preview
            </Button>
          </div>
        </aside>

        <div className="flex-1 overflow-hidden">
          <PreviewPanel data={editedData} style={selectedTemplate} />
        </div>

        {autoEnhancing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/85 backdrop-blur-md transition-all duration-300 animate-fade-in">
            <div className="w-full max-w-sm p-6 text-center bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
              <div className="mx-auto mb-6 relative flex h-16 w-16 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-lg animate-pulse" />
                <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" style={{ animationDuration: "1.2s" }} />
                <Sparkles className="h-6 w-6 text-indigo-400" />
              </div>

              <h3 className="mb-1 text-lg font-bold text-white">AI Portfolio Optimizer</h3>
              <p className="mb-6 text-xs text-zinc-400">
                Rewriting your copy and injecting quantified metrics...
              </p>

              <div className="space-y-3 text-left">
                {AUTO_ENHANCE_STEPS.map((stepMsg, idx) => {
                  const isCompleted = idx < enhanceStepIndex;
                  const isActive = idx === enhanceStepIndex;
                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-2.5 rounded-lg border p-3 transition-all duration-300 ${isCompleted
                        ? "border-emerald-500/25 bg-emerald-500/5 text-emerald-300"
                        : isActive
                          ? "border-indigo-500/35 bg-indigo-500/10 text-white shadow-[0_0_10px_rgba(99,102,241,0.05)]"
                          : "border-zinc-800 bg-zinc-950/40 text-zinc-500"
                        }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                      ) : isActive ? (
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-indigo-400 mt-0.5" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-zinc-700 shrink-0 mt-0.5" />
                      )}
                      <span className="text-[11px] font-medium leading-tight">{stepMsg}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {copilotApplying && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/85 backdrop-blur-md transition-all duration-300 animate-fade-in">
            <div className="w-full max-w-sm p-6 text-center bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
              <div className="mx-auto mb-6 relative flex h-16 w-16 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-lg animate-pulse" />
                <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" style={{ animationDuration: "1.2s" }} />
                <Sparkles className="h-6 w-6 text-purple-400" />
              </div>

              <h3 className="mb-1 text-lg font-bold text-white">AI Copilot Editor</h3>
              <p className="mb-6 text-xs text-zinc-400">
                Applying custom modifications to your website draft...
              </p>

              <div className="space-y-3 text-left">
                {COPILOT_STEPS.map((stepMsg, idx) => {
                  const isCompleted = idx < copilotStepIndex;
                  const isActive = idx === copilotStepIndex;
                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-2.5 rounded-lg border p-3 transition-all duration-300 ${isCompleted
                        ? "border-emerald-500/25 bg-emerald-500/5 text-emerald-300"
                        : isActive
                          ? "border-purple-500/35 bg-purple-500/10 text-white shadow-[0_0_10px_rgba(167,139,250,0.05)]"
                          : "border-zinc-800 bg-zinc-950/40 text-zinc-500"
                        }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                      ) : isActive ? (
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-purple-400 mt-0.5" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-zinc-700 shrink-0 mt-0.5" />
                      )}
                      <span className="text-[11px] font-medium leading-tight">{stepMsg}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      <div className="mb-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Step 1 — Choose a template
        </p>
        <StyleSelector selected={selectedTemplate} onSelect={setTemplate} />
      </div>

      <div className="mb-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Step 2 — Choose tone
        </p>
        <ToneSelector selected={tone} onSelect={setTone} />
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Step 3 — Upload your resume
        </p>
        <ResumeUploader
          onTextSubmit={handleTextSubmit}
          onFileSubmit={handleFileSubmit}
        />
      </div>
    </div>
  );
}
