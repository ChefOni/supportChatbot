import Image from "next/image";
import { ChatWidget } from "./components/ChatWidget";
import Link from "next/link";

export default function Home() {
  return (
    <div className="border-l border-foreground/10">
      <nav className="flex w-full items-center justify-between px-6 py-5 md:px-12">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight">
          baki
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/feedback"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            Feedback
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Dashboard
          </Link>
        </div>
      </nav>

      <header className="flex min-h-dvh flex-col px-6 pb-12 md:px-12">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between py-6">
            <div>
              <span className="flex flex-col gap-3">
                <span className="max-w-fit rounded-full border border-brand/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand">
                  Experimental
                </span>
                <span className="font-display text-7xl font-bold leading-[0.85] tracking-tight text-brand">
                  baki
                </span>
              </span>
              <p className="mt-4 max-w-lg font-display text-base leading-snug text-muted md:text-2xl">
                AI-powered support that meets your customers where they are.
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <a
                href="#cta"
                className="rounded-full bg-foreground px-7 py-3 text-sm font-medium text-background transition-all hover:opacity-90"
              >
                Start free trial
              </a>
              <Link
                href="/demo"
                className="rounded-full border border-foreground/15 px-7 py-3 text-sm font-medium transition-all hover:border-foreground/30"
              >
                See how it works
              </Link>
            </div>
          </div>

          <div className="mt-16 md:mt-20">
            <div className="relative h-[500px] w-full overflow-hidden rounded-2xl">
              <Image
                src="/hero2.png"
                alt="baki AI support visualization"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1152px"
              />
            </div>
          </div>
        </div>
      </header>

      <section
        id="features"
        className="border-t border-foreground/10 px-6 py-24 md:px-12"
      >
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-16 md:grid-cols-2">
          <div>
            <span className="font-display text-xs font-semibold uppercase tracking-widest text-brand">
              Core Capabilities
            </span>
            <h2 className="mt-4 font-display text-4xl leading-tight font-semibold tracking-tight md:text-5xl">
              Support that
              <br />
              thinks with you.
            </h2>
            <p className="mt-6 max-w-sm leading-relaxed text-muted">
              Baki combines natural language understanding with contextual
              awareness, so every response feels informed, personal, and
              human — even when it&apos;s automated.
            </p>
          </div>

          <div className="flex flex-col gap-12">
            <div className="pt-6">
              <h3 className="font-display text-lg font-semibold">
                Understand instantly
              </h3>
              <p className="mt-2 max-w-sm leading-relaxed text-muted">
                NLP that grasps nuance, intent, and sentiment behind every
                query. No rigid keywords — just real understanding.
              </p>
            </div>
            <div className="border-t border-foreground/10 pt-6">
              <h3 className="font-display text-lg font-semibold">
                Respond intelligently
              </h3>
              <p className="mt-2 max-w-sm leading-relaxed text-muted">
                Context-aware workflows adapt to your business rules and
                customer history. Every reply is on-brand and on-point.
              </p>
            </div>
            <div className="border-t border-foreground/10 pt-6">
              <h3 className="font-display text-lg font-semibold">
                Learn continuously
              </h3>
              <p className="mt-2 max-w-sm leading-relaxed text-muted">
                Every interaction makes your support smarter. Zero manual
                tuning — baki improves with each conversation.
              </p>
            </div>
            <div className="border-t border-foreground/10 pt-6">
              <h3 className="font-display text-lg font-semibold">
                Integrate seamlessly
              </h3>
              <p className="mt-2 max-w-sm leading-relaxed text-muted">
                Plug into your existing stack in minutes. Slack, Zendesk,
                Discord, Intercom — you name it.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-foreground/10 bg-surface-elevated px-6 py-24 md:px-12">
        <div className="mx-auto w-full max-w-6xl">
          <span className="font-display text-xs font-semibold uppercase tracking-widest text-brand">
            How it works
          </span>
          <h2 className="mt-4 font-display text-4xl leading-tight font-semibold tracking-tight md:text-5xl">
            Three steps to
            <br />
            better support.
          </h2>

          <div className="mt-20 grid grid-cols-1 gap-12 md:grid-cols-3">
            <div className="flex flex-col">
              <span className="font-display text-7xl font-bold leading-none text-brand/20">
                01
              </span>
              <h3 className="mt-6 font-display text-xl font-semibold">
                Connect
              </h3>
              <p className="mt-3 leading-relaxed text-muted">
                Link your support channels — email, chat, social, or
                helpdesk — in under five minutes.
              </p>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-7xl font-bold leading-none text-brand/20">
                02
              </span>
              <h3 className="mt-6 font-display text-xl font-semibold">
                Train
              </h3>
              <p className="mt-3 leading-relaxed text-muted">
                Point baki at your knowledge base, docs, and history. One
                click ingests everything.
              </p>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-7xl font-bold leading-none text-brand/20">
                03
              </span>
              <h3 className="mt-6 font-display text-xl font-semibold">
                Go live
              </h3>
              <p className="mt-3 leading-relaxed text-muted">
                Flip the switch and watch your support transform. Baki
                handles the volume; your team handles the nuance.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="cta"
        className="border-t border-foreground/10 px-6 py-24 md:px-12"
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center text-center">
          <h2 className="max-w-xl font-display text-4xl leading-tight font-semibold tracking-tight md:text-5xl">
            Ready to rethink
            <br />
            your support?
          </h2>
          <p className="mt-4 max-w-md leading-relaxed text-muted">
            Start your free trial today. No credit card required. No
            commitment. Just better conversations.
          </p>
          <a
            href="#"
            className="mt-10 rounded-full bg-brand px-10 py-4 font-display text-sm font-semibold text-white transition-all hover:bg-brand-light"
          >
            Start free trial
          </a>
        </div>
      </section>

      <footer className="border-t border-foreground/10 px-6 py-8 md:px-12">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-display text-sm font-semibold tracking-tight">
              baki
            </span>
            <Link href="/demo" className="text-sm text-muted transition-colors hover:text-foreground">
              Demo
            </Link>
            <Link href="/feedback" className="text-sm text-muted transition-colors hover:text-foreground">
              Feedback
            </Link>
          </div>
          <span className="text-sm text-muted">
            &copy; {new Date().getFullYear()} baki. All rights reserved.
          </span>
        </div>
      </footer>
      <ChatWidget />
    </div>
  );
}
