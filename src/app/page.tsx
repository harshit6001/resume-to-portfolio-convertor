import { BuilderApp } from "@/components/builder/BuilderApp";
import { Sparkles, Zap, Layout, Shield } from "lucide-react";

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold tracking-tight">
              AI Resume <span className="text-indigo-400">→ Portfolio</span>
            </span>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-500 transition-colors hover:text-white"
          >
            GitHub
          </a>
        </div>
      </header>

      <main className="flex-1">
        <section className="border-b border-zinc-800/50 px-6 py-16 text-center md:py-24">
          <div className="mx-auto max-w-3xl animate-fade-in">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-300">
              <Zap className="h-3 w-3" />
              AI-Powered · Recruiter-Optimized · Deploy-Ready
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">
              Turn your resume into a{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                smart portfolio
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-400">
              AI parses your resume, enhances content, and builds an editable portfolio
              you can customize, version, and deploy in seconds.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-zinc-500">
              <span className="flex items-center gap-2">
                <Layout className="h-4 w-4 text-indigo-400" />3 templates
              </span>
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                Modular AI pipeline
              </span>
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-indigo-400" />
                Live edit + versioning
              </span>
            </div>
          </div>
        </section>

        <section className="px-6 py-12">
          <BuilderApp />
        </section>
      </main>

      <footer className="border-t border-zinc-800 px-6 py-8 text-center text-sm text-zinc-600">
        <p>AI Resume → Smart Portfolio Builder · Next.js, Tailwind CSS & OpenAI</p>
      </footer>
    </>
  );
}
