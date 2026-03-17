import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  console.warn("STRIPE_SECRET_KEY is not set. Stripe will be disabled.");
}

export const stripe = secretKey
  ? new Stripe(secretKey, {
      apiVersion: "2024-06-20"
    })
  : null;
