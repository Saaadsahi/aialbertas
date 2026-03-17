import { stripe } from "@/lib/stripe";

export async function refundOrderPayment(stripePaymentId?: string | null) {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  if (!stripePaymentId) {
    throw new Error("This order does not have a Stripe payment to refund");
  }

  let paymentIntentId = stripePaymentId;

  if (stripePaymentId.startsWith("cs_")) {
    const session = await stripe.checkout.sessions.retrieve(stripePaymentId);
    const sessionPaymentIntent = session.payment_intent;

    if (!sessionPaymentIntent) {
      throw new Error("This Checkout Session does not have a payment intent yet");
    }

    paymentIntentId =
      typeof sessionPaymentIntent === "string"
        ? sessionPaymentIntent
        : sessionPaymentIntent.id;
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== "succeeded") {
    throw new Error("Only succeeded payments can be refunded");
  }

  const existingRefunds = await stripe.refunds.list({
    payment_intent: paymentIntentId,
    limit: 1
  });

  if (existingRefunds.data.length > 0) {
    return existingRefunds.data[0];
  }

  return stripe.refunds.create({
    payment_intent: paymentIntentId
  });
}
