import { NextResponse } from "next/server";
import { db } from "@/db";
import { conversations, feedback, kbDocuments } from "@/db/schema";

export async function POST() {
  try {
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
      { customerId: "cust_001", messages: [{ role: "user", content: "Hey! Do you offer free shipping?", created_at: new Date(Date.now() - 86400000).toISOString() }, { role: "assistant", content: "Yes! We offer free shipping on all orders over $50. Standard delivery takes 5-7 business days. If you need it sooner, express shipping is available for $12.99. Would you like me to check the shipping options for a specific item?", created_at: new Date(Date.now() - 86300000).toISOString() }, { role: "user", content: "That's great! What if I need to return something?", created_at: new Date(Date.now() - 86200000).toISOString() }, { role: "assistant", content: "No problem! You have 30 days from delivery to return items. They just need to be unused and in the original packaging. Once we receive the return, refunds are processed within 5-7 business days. Would you like me to walk you through the return process?", created_at: new Date(Date.now() - 86100000).toISOString() }], status: "resolved", rating: 5, adminComment: "Handled all questions perfectly." },
      { customerId: "cust_002", messages: [{ role: "user", content: "I can't log into my account.", created_at: new Date(Date.now() - 43200000).toISOString() }, { role: "assistant", content: "Try clearing your cache or using the forgot password option.", created_at: new Date(Date.now() - 43100000).toISOString() }, { role: "user", content: "The reset worked, thanks!", created_at: new Date(Date.now() - 43000000).toISOString() }], status: "resolved", rating: 4 },
      { customerId: "cust_003", messages: [{ role: "user", content: "I was charged twice for my subscription.", created_at: new Date(Date.now() - 21600000).toISOString() }, { role: "assistant", content: "I'll escalate this to our billing team right away.", created_at: new Date(Date.now() - 21500000).toISOString() }], status: "active" },
      { customerId: "cust_004", messages: [{ role: "user", content: "Does your API support webhooks?", created_at: new Date(Date.now() - 7200000).toISOString() }, { role: "assistant", content: "Yes! Check docs.baki.ai/webhooks.", created_at: new Date(Date.now() - 7100000).toISOString() }, { role: "user", content: "Perfect, thanks!", created_at: new Date(Date.now() - 7000000).toISOString() }], status: "active" },
      { customerId: "cust_005", messages: [{ role: "user", content: "Your platform is really slow today.", created_at: new Date(Date.now() - 3600000).toISOString() }, { role: "assistant", content: "Try clearing your cache or switching browsers.", created_at: new Date(Date.now() - 3500000).toISOString() }, { role: "user", content: "Chrome works, thanks!", created_at: new Date(Date.now() - 3400000).toISOString() }], status: "resolved", rating: 3 },
    ];

    for (const conv of sampleConversations) {
      await db.insert(conversations).values(conv);
    }

    const sampleFeedback = [
      { category: "bug", message: "Dashboard charts don't load on mobile Safari.", comment: "iPhone 14" },
      { category: "suggestion", message: "Would love a dark mode option for the dashboard.", comment: null },
      { category: "other", message: "Great product overall! Keep up the good work.", comment: null },
      { category: "bug", message: "Chat widget disappears after a few minutes on the demo page.", comment: null },
      { category: "suggestion", message: "It would be helpful to have an export to CSV feature.", comment: "Nice to have" },
    ];

    for (const fb of sampleFeedback) {
      await db.insert(feedback).values(fb);
    }

    return NextResponse.json({
      success: true,
      kbDocs: kbDocs.length,
      conversations: sampleConversations.length,
      feedback: sampleFeedback.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Seed failed", details: String(error) },
      { status: 500 }
    );
  }
}
