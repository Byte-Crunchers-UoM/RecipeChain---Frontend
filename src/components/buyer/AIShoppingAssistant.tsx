"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import {
  Bot,
  Loader2,
  MessageCircle,
  Send,
  ShoppingBasket,
  Sparkles,
  X,
} from "lucide-react";

import {
  askAIShoppingAssistant,
  type AIChatMessage,
} from "@/lib/api/aiAssistant";

const INITIAL_MESSAGE: AIChatMessage = {
  role: "assistant",
  content:
    "Hi! I can create shopping lists from your unlocked cookbook recipes, scale ingredient quantities, and suggest substitutions. Ask me something like: “Generate a shopping list for my saved recipes.”",
};

const QUICK_PROMPTS = [
  "Generate a shopping list from all my unlocked recipes.",
  "Scale one of my recipes from 2 servings to 6 servings.",
  "Suggest substitutes for buttermilk.",
];

function getMessageBubbleClass(role: AIChatMessage["role"]) {
  if (role === "user") {
    return "ml-auto bg-teal-600 text-white";
  }

  return "mr-auto border border-slate-200 bg-white text-slate-700";
}

function formatAssistantText(text: string) {
  const lines = text.split("\n");

  return lines.map((line, index) => (
    <span key={`${line}-${index}`}>
      {line}
      {index < lines.length - 1 ? <br /> : null}
    </span>
  ));
}

export default function AIShoppingAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<AIChatMessage[]>([INITIAL_MESSAGE]);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const timeout = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    return () => window.clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, loading, open]);

  const sendPrompt = async (rawPrompt: string) => {
    const prompt = rawPrompt.trim();

    if (!prompt || loading) return;

    const userMessage: AIChatMessage = {
      role: "user",
      content: prompt,
    };

    const history = messages.filter((message) => message.content.trim());

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const reply = await askAIShoppingAssistant({
        prompt,
        messages: history.slice(-8),
      });

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: reply,
        },
      ]);
    } catch (error) {
      console.error("AI assistant error:", error);

      const message =
        error instanceof Error
          ? error.message
          : "AI assistant failed. Please try again.";

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: message,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendPrompt(input);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendPrompt(input);
    }
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-teal-600 text-white shadow-2xl shadow-teal-900/25 transition hover:-translate-y-1 hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-200"
          aria-label="Open AI Shopping Assistant"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {open && (
        <section className="fixed bottom-6 right-4 z-50 flex h-[min(720px,calc(100vh-3rem))] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 shadow-2xl shadow-slate-900/20 sm:right-6">
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                <Bot size={22} />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  AI Shopping Assistant
                </h2>
                <p className="text-xs text-slate-500">
                  Cookbook lists, scaling, substitutions
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Close AI Shopping Assistant"
            >
              <X size={20} />
            </button>
          </div>

          <div className="border-b border-slate-200 bg-white px-4 py-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => {
                    void sendPrompt(prompt);
                  }}
                  disabled={loading}
                  className="shrink-0 rounded-full border border-teal-100 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-700 transition hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}-${message.content.slice(
                    0,
                    20
                  )}`}
                  className={[
                    "max-w-[86%] rounded-3xl px-4 py-3 text-sm leading-6 shadow-sm",
                    getMessageBubbleClass(message.role),
                  ].join(" ")}
                >
                  {message.role === "assistant" && (
                    <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-teal-700">
                      <Sparkles size={13} />
                      RecipeChain AI
                    </div>
                  )}

                  <div className="whitespace-pre-wrap">
                    {formatAssistantText(message.content)}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="mr-auto max-w-[86%] rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Thinking about your cookbook...
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-slate-200 bg-white p-4"
          >
            <div className="flex items-end gap-3">
              <div className="flex min-w-0 flex-1 items-end gap-2 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-teal-400 focus-within:ring-4 focus-within:ring-teal-50">
                <ShoppingBasket
                  size={18}
                  className="mb-1 shrink-0 text-slate-400"
                />

                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  maxLength={1200}
                  placeholder="Ask for a shopping list, scaling, or substitutes..."
                  disabled={loading}
                  className="max-h-28 min-h-6 flex-1 resize-none bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white shadow-lg shadow-teal-900/15 transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                aria-label="Send message"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>

            <p className="mt-2 text-center text-[11px] text-slate-400">
              Premium locked recipes are suggested for unlock instead of
              revealing paid content.
            </p>
          </form>
        </section>
      )}
    </>
  );
}