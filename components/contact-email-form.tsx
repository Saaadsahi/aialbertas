"use client";

import { FormEvent, useState } from "react";

type ContactEmailFormProps = {
  coffeeMessage?: string;
  errorMessage?: string;
};

const serviceOptions = [
  "General Inquiry",
  "Automation Workflow",
  "Custom AI App",
  "AI Architecture",
  "Vibe Code Cleanup"
] as const;

export function ContactEmailForm({
  coffeeMessage,
  errorMessage
}: ContactEmailFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [serviceType, setServiceType] = useState<(typeof serviceOptions)[number]>("General Inquiry");
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      return;
    }

    const subject = `AIAlberta inquiry: ${serviceType}`;
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Service: ${serviceType}`,
      "",
      "Message:",
      message
    ].join("\n");

    window.location.href = `mailto:saadullahsahi@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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
        className="inline-flex items-center justify-center rounded-full bg-black px-6 py-2 text-sm text-white hover:bg-gray-800"
      >
        Send email
      </button>
    </form>
  );
}
