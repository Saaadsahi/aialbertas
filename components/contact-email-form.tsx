"use client";

import { FormEvent, useState } from "react";

type ContactEmailFormProps = {
  coffeeMessage?: string;
  errorMessage?: string;
};

const CONTACT_EMAIL_ENDPOINT =
  "https://cvzdxykvkklxgcjaqdlm.supabase.co/functions/v1/contact-email";

const serviceOptions = [
  "General Inquiry",
  "Vibe Code Cleanup",
  "Custom Site",
  "Custom AI Workflows",
  "Integrating AI Into Business",
  "AI Architecture",
  "Event Hosting"
] as const;

export function ContactEmailForm({
  coffeeMessage,
  errorMessage
}: ContactEmailFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [serviceType, setServiceType] = useState<(typeof serviceOptions)[number]>("General Inquiry");
  const [message, setMessage] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      setSubmitState("error");
      setSubmitMessage("Please fill in your name, email, and message.");
      return;
    }

    setSubmitState("sending");
    setSubmitMessage(null);

    try {
      const response = await fetch(CONTACT_EMAIL_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          serviceType,
          message
        })
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || (data && "error" in data)) {
        throw new Error("Failed to send inquiry.");
      }

      setSubmitState("sent");
      setSubmitMessage("Inquiry sent. We'll follow up shortly.");
      setName("");
      setEmail("");
      setServiceType("General Inquiry");
      setMessage("");
    } catch {
      setSubmitState("error");
      setSubmitMessage("Could not send your inquiry right now.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm text-black">
      {coffeeMessage && (
        <p className="rounded-xl border border-black/10 bg-[#f7f4ef] px-3 py-2 text-xs text-black">
          {coffeeMessage}
        </p>
      )}
      {errorMessage && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {errorMessage}
        </p>
      )}
      {submitState === "sent" && submitMessage && (
        <p className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-800">
          {submitMessage}
        </p>
      )}
      {submitState === "error" && submitMessage && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {submitMessage}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs text-muted">Name</label>
          <input
            name="name"
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-muted focus:border-black/40"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="text-xs text-muted">Email</label>
          <input
            name="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-muted focus:border-black/40"
            placeholder="you@company.ca"
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-muted">Service</label>
        <select
          name="service_type"
          value={serviceType}
          onChange={(event) => setServiceType(event.target.value as (typeof serviceOptions)[number])}
          className="mt-1 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-black/40"
        >
          {serviceOptions.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs text-muted">Message</label>
        <textarea
          name="message"
          required
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="mt-1 h-28 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-muted focus:border-black/40"
          placeholder="Tell us where you're starting from. We'll meet you there."
        />
      </div>
      <button
        type="submit"
        disabled={submitState === "sending"}
        className="inline-flex items-center justify-center rounded-full bg-black px-6 py-2 text-sm text-white hover:bg-gray-800"
      >
        {submitState === "sending" ? "Sending..." : "Send inquiry"}
      </button>
    </form>
  );
}
