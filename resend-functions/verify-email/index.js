import { Client, Databases } from "node-appwrite";
import fetch from "node-fetch";

// Initialize Appwrite
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

// Generate verification code
function generateVerificationCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default async (req, res) => {
  try {
    // Get Resend API key from MCP Hub
    const configDoc = await databases.getDocument(
      "mcp_hub",
      "resend_projects",
      "printHub"
    );

    const RESEND_API_KEY = configDoc.api_key;

    // Extract email from request
    const { email } = req.body;

    if (!email) {
      return res.json(
        { success: false, error: "Missing required field: email" },
        400
      );
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();

    // Send verification email
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "verify@printhub.com",
        to: email,
        subject: "Email Verification Code - PrintHub",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Email Verification</h2>
            <p>Your verification code is:</p>
            <h1 style="color: #007bff; letter-spacing: 2px;">${verificationCode}</h1>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <hr/>
            <p style="color: #666; font-size: 12px;">PrintHub - Professional Print Management</p>
          </div>
        `,
        text: `Your verification code is: ${verificationCode}. This code will expire in 10 minutes.`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.json(
        {
          success: false,
          error: data.message || "Failed to send verification email",
          details: data,
        },
        response.status
      );
    }

    return res.json({
      success: true,
      messageId: data.id,
      verificationCode,
      expiresIn: 600, // 10 minutes in seconds
      message: "Verification email sent successfully",
    });
  } catch (error) {
    console.error("Error sending verification email:", error);
    return res.json(
      { success: false, error: error.message || "Internal server error" },
      500
    );
  }
};
