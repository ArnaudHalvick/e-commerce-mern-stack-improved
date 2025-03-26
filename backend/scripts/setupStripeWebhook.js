#!/usr/bin/env node

/**
 * This script helps set up Stripe webhooks for local development
 *
 * It requires stripe-cli to be installed:
 * https://stripe.com/docs/stripe-cli
 *
 * Usage:
 * 1. First login to Stripe CLI: stripe login
 * 2. Then run this script: node setupStripeWebhook.js
 */

require("dotenv").config({ path: "../.env" });
const { spawn } = require("child_process");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("🚀 Stripe Webhook Setup Helper");
console.log("===============================");
console.log(
  "\nThis script will help you set up Stripe webhooks for local development."
);
console.log(
  "Make sure you have Stripe CLI installed and you're logged in (stripe login).\n"
);

const startWebhookListener = () => {
  console.log(
    "Starting webhook forwarding to http://localhost:4000/api/payment/webhook"
  );
  console.log("Press Ctrl+C to stop the webhook listener\n");

  const webhookProcess = spawn(
    "stripe",
    ["listen", "--forward-to", "http://localhost:4000/api/payment/webhook"],
    {
      stdio: "inherit",
      shell: true,
    }
  );

  webhookProcess.on("error", (error) => {
    console.error("Error starting Stripe webhook forwarder:", error.message);
    console.log("\nMake sure you have Stripe CLI installed:");
    console.log("https://stripe.com/docs/stripe-cli\n");
    process.exit(1);
  });

  // Show the webhook secret to add to .env
  const secretProcess = spawn("stripe", ["listen", "--print-secret"], {
    shell: true,
  });

  let secret = "";
  secretProcess.stdout.on("data", (data) => {
    secret += data.toString();
  });

  secretProcess.on("close", () => {
    console.log("\n======================================================");
    console.log("ADD THIS TO YOUR .env FILE:");
    console.log(`STRIPE_WEBHOOK_SECRET=${secret.trim()}`);
    console.log("======================================================\n");
  });

  // Keep the process running
  process.on("SIGINT", () => {
    console.log("\nStopping webhook listener...");
    webhookProcess.kill();
    process.exit(0);
  });
};

const showTriggerEvents = () => {
  console.log("\nTo trigger test events, open a new terminal and run:");
  console.log("stripe trigger payment_intent.succeeded");
  console.log("stripe trigger payment_intent.payment_failed");
  console.log("\nSee more events: stripe trigger --help\n");
};

console.log("Do you want to start the Stripe webhook listener now? (y/n)");
rl.question("> ", (answer) => {
  if (answer.toLowerCase() === "y") {
    startWebhookListener();
    showTriggerEvents();
  } else {
    console.log("\nTo manually start webhook forwarding, run:");
    console.log(
      "stripe listen --forward-to http://localhost:4000/api/payment/webhook"
    );
    console.log("\nTo get your webhook signing secret, run:");
    console.log("stripe listen --print-secret");
    process.exit(0);
  }
});
