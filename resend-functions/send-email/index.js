import { Client, Databases } from "node-appwrite";
import fetch from "node-fetch";

// Initialize Appwrite
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

export default async (req, res) => {
  try {
    // Get Resend API key from MCP Hub
    const configDoc = await databases.getDocument(
      "mcp_hub",
      "resend_projects",
      "printHub"
    );

    const RESEND_API_KEY = configDoc.api_key;

    // Extract email details from request
    const { to, subject, html, text, from = "noreply@printHub.com" } = req.body;

    if (!to || !subject) {
      return res.json(
        { success: false, error: "Missing required fields: to, subject" },
        400
      );
    }

    // Call Resend API
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html: html || text,
        text: text || html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.json(
        {
          success: false,
          error: data.message || "Failed to send email",
          details: data,
        },
        response.status
      );
    }

    return res.json({
      success: true,
      messageId: data.id,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.json(
      { success: false, error: error.message || "Internal server error" },
      500
    );
  }
};
