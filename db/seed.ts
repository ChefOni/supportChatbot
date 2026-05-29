import "dotenv/config";
import { db } from "./index";
import { conversations, feedback, kbDocuments } from "./schema";

async function seed() {
  const kbDocs = [
    {
      title: "Shipping Policy",
      content:
        "We offer free shipping on orders over $50. Standard shipping takes 5-7 business days. Express shipping (2-3 business days) is available for an additional $12.99. International shipping varies by destination and typically takes 10-14 business days.",
      tags: ["shipping", "delivery", "orders"],
    },
    {
      title: "Return Policy",
      content:
        "Items can be returned within 30 days of delivery. Products must be unused and in original packaging. To start a return, log into your account and navigate to the order page. Refunds are processed within 5-7 business days after we receive the item.",
      tags: ["returns", "refunds", "policy"],
    },
    {
      title: "Account Management",
      content:
        "You can update your email, password, and shipping addresses from your account settings. For security, password changes require verification via email. Two-factor authentication is available in the security settings.",
      tags: ["account", "settings", "security"],
    },
    {
      title: "Payment Methods",
      content:
        "We accept Visa, Mastercard, American Express, PayPal, and Apple Pay. All payments are processed securely through Stripe. Your payment information is never stored on our servers. For subscription plans, billing occurs on the same day each month.",
      tags: ["payment", "billing", "subscription"],
    },
    {
      title: "Technical Support",
      content:
        "If you're experiencing issues with our platform, try clearing your browser cache and cookies first. Ensure you're using the latest version of Chrome, Firefox, or Safari. For API integration issues, check our documentation at docs.baki.ai for endpoint references and error codes.",
      tags: ["technical", "troubleshooting", "api"],
    },
  ];

  for (const doc of kbDocs) {
    await db.insert(kbDocuments).values(doc);
  }

  const sampleConversations = [
    {
      customerId: "cust_001",
      messages: [
        {
          role: "user",
          content: "Hey! Do you offer free shipping?",
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          role: "assistant",
          content:
            "Yes! We offer free shipping on all orders over $50. Standard delivery takes 5-7 business days. If you need it sooner, express shipping is available for $12.99. Would you like me to check the shipping options for a specific item?",
          created_at: new Date(Date.now() - 86300000).toISOString(),
        },
        {
          role: "user",
          content: "That's great! What if I need to return something?",
          created_at: new Date(Date.now() - 86200000).toISOString(),
        },
        {
          role: "assistant",
          content:
            "No problem! You have 30 days from delivery to return items. They just need to be unused and in the original packaging. Once we receive the return, refunds are processed within 5-7 business days. Would you like me to walk you through the return process?",
          created_at: new Date(Date.now() - 86100000).toISOString(),
        },
      ],
      status: "resolved",
      rating: 5,
      adminComment: "Handled all questions perfectly, great response.",
    },
    {
      customerId: "cust_002",
      messages: [
        {
          role: "user",
          content:
            "I can't log into my account. It keeps saying wrong password even though I'm sure it's correct.",
          created_at: new Date(Date.now() - 43200000).toISOString(),
        },
        {
          role: "assistant",
          content:
            "I'm sorry you're having trouble logging in! This often happens due to cached credentials. Try these steps:\n\n1. Clear your browser cache and cookies\n2. Use the 'Forgot Password' option to reset\n3. Make sure Caps Lock is off\n\nIf you've reset your password and it's still not working, let me know and I'll look into it further.",
          created_at: new Date(Date.now() - 43100000).toISOString(),
        },
        {
          role: "user",
          content:
            "The reset worked, I'm in now. Thanks for the quick help!",
          created_at: new Date(Date.now() - 43000000).toISOString(),
        },
      ],
      status: "resolved",
      rating: 4,
      adminComment: "Good troubleshooting steps provided.",
    },
    {
      customerId: "cust_003",
      messages: [
        {
          role: "user",
          content:
            "Hi, I was charged twice for my subscription this month. Can you help?",
          created_at: new Date(Date.now() - 21600000).toISOString(),
        },
        {
          role: "assistant",
          content:
            "I understand how frustrating that must be. Let me look into this for you. Double charges can happen if there was a payment processing error. Our billing team can review the transactions and issue a refund for the duplicate charge. I'm going to escalate this to our support team who can process the refund directly. They'll reach out to you within 24 hours.",
          created_at: new Date(Date.now() - 21500000).toISOString(),
        },
      ],
      status: "escalated",
    },
    {
      customerId: "cust_004",
      messages: [
        {
          role: "user",
          content:
            "Does your API support webhooks for real-time updates?",
          created_at: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          role: "assistant",
          content:
            "Yes! Our API supports webhooks for real-time events including new orders, payment confirmations, and account changes. You'll find the full webhook documentation with endpoint examples at docs.baki.ai/webhooks. You can configure webhook URLs in your account settings under Developer Settings. Is there a specific event you're looking to integrate with?",
          created_at: new Date(Date.now() - 7100000).toISOString(),
        },
        {
          role: "user",
          content:
            "Perfect, I need order confirmations. I'll check the docs. Thanks!",
          created_at: new Date(Date.now() - 7000000).toISOString(),
        },
      ],
      status: "active",
    },
    {
      customerId: "cust_005",
      messages: [
        {
          role: "user",
          content:
            "Your platform is really slow today, pages are taking forever to load.",
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          role: "assistant",
          content:
            "I'm sorry about the slow performance! This could be due to high traffic or a temporary network issue. Let me suggest a few things:\n\n1. Try refreshing the page\n2. Clear your browser cache\n3. Check if the issue persists in a different browser\n\nIf the problem continues, it might be an outage on our end — I'll flag this to our engineering team right away.",
          created_at: new Date(Date.now() - 3500000).toISOString(),
        },
        {
          role: "user",
          content:
            "Switched to Chrome and it's working fine now. Must have been my browser. Thanks!",
          created_at: new Date(Date.now() - 3400000).toISOString(),
        },
      ],
      status: "resolved",
      rating: 3,
    },
  ];

  for (const conv of sampleConversations) {
    await db.insert(conversations).values({
      customerId: conv.customerId,
      messages: conv.messages,
      status: conv.status,
      rating: conv.rating ?? null,
      adminComment: conv.adminComment ?? null,
    });
  }

  const sampleFeedback = [
    { category: "bug", message: "The dashboard charts don't load on mobile Safari.", comment: "iPhone 14" },
    { category: "suggestion", message: "Would love a dark mode option for the dashboard.", comment: null },
    { category: "other", message: "Great product overall! Keep up the good work.", comment: null },
    { category: "bug", message: "Chat widget disappears after a few minutes on the demo page.", comment: null },
    { category: "suggestion", message: "It would be helpful to have an export to CSV feature for conversations.", comment: "Nice to have" },
  ];

  for (const fb of sampleFeedback) {
    await db.insert(feedback).values(fb);
  }

  console.log(`Seeded ${kbDocs.length} KB documents`);
  console.log(`Seeded ${sampleConversations.length} conversations`);
  console.log(`Seeded ${sampleFeedback.length} feedback entries`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
