import { ChatWidget } from "../components/ChatWidget";

export default function DemoPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
        baki Demo
      </h1>
      <p className="mt-4 max-w-md leading-relaxed text-muted">
        Click the chat bubble in the bottom-right corner to try baki&apos;s
        AI-powered support agent.
      </p>
      <p className="mt-2 text-sm text-muted">
        Ask about shipping, returns, payments, or account issues.
      </p>

      <ChatWidget />
    </div>
  );
}
