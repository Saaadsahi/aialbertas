"use client";

import { FormEvent, useState } from "react";

type OrderEmailFormProps = {
  defaultName: string;
  defaultEmail: string;
};

const serviceOptions = [
  "Vibe Code Cleanup",
  "Custom Site",
  "Custom AI Workflows",
  "Integrating AI Into Business",
  "AI Architecture",
  "General Inquiry"
] as const;

const budgetOptions = [
  { value: "under-5k", label: "Under $5k" },
  { value: "5-15k", label: "$5k - $15k" },
  { value: "15-50k", label: "$15k - $50k" },
  { value: "50k-plus", label: "$50k+" }
] as const;

export function OrderEmailForm({
  defaultName,
  defaultEmail
}: OrderEmailFormProps) {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [serviceType, setServiceType] = useState<(typeof serviceOptions)[number]>("Vibe Code Cleanup");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState<(typeof budgetOptions)[number]["value"]>("under-5k");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const budgetLabel =
      budgetOptions.find((option) => option.value === budget)?.label ?? budget;
    const subject = `AIAlberta inquiry: ${serviceType}`;
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Service type: ${serviceType}`,
      `Budget range: ${budgetLabel}`,
      "",
      "Project description:",
      description || "No description provided."
    ].join("\n");

    window.location.href = `mailto:saadullahsahi@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm text-black">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs text-muted">Name</label>
          <input
            name="name"
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none ring-0 placeholder:text-muted focus:border-black/40"
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
            className="mt-1 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none ring-0 placeholder:text-muted focus:border-black/40"
            placeholder="you@company.ca"
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-muted">Service type</label>
        <select
          name="service_type"
          value={serviceType}
          onChange={(event) => setServiceType(event.target.value as (typeof serviceOptions)[number])}
          className="mt-1 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none ring-0 focus:border-black/40"
        >
          {serviceOptions.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs text-muted">Project description</label>
        <textarea
          name="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="mt-1 h-32 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none ring-0 placeholder:text-muted focus:border-black/40"
          placeholder="Where are you today, and what would 'no one left behind' look like for your team?"
        />
      </div>
      <div>
        <label className="text-xs text-muted">Budget range</label>
        <select
          name="budget"
          value={budget}
          onChange={(event) => setBudget(event.target.value as (typeof budgetOptions)[number]["value"])}
          className="mt-1 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none ring-0 focus:border-black/40"
        >
          {budgetOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="mt-4 inline-flex items-center justify-center rounded-full bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800"
      >
        Send email
      </button>
    </form>
  );
}
