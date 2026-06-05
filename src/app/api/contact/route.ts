import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const mailUser = process.env.GMAIL_SMTP_USER;
    const mailPass = process.env.GMAIL_SMTP_PASS;

    if (!mailUser || !mailPass) {
      console.error("Missing email credentials");
      return NextResponse.json(
        { error: "Email service is not configured." },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const message = String(body.message || "").trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email and message are required." },
        { status: 400 }
      );
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: mailUser,
        pass: mailPass, // Use App Password, not regular password
      },
    });

    // Send mail
    const mailOptions = {
      from: `"Elite Arcade Contact" <${mailUser}>`,
      to: mailUser, // Sending to yourself
      replyTo: email, // User's email for reply
      subject: `New Contact: ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">New Contact Form Message</h2>
          <hr style="border: 1px solid #e5e7eb;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px;">
            ${message.replace(/\n/g, "<br>")}
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully from:", mailUser);

    return NextResponse.json({ 
      success: true,
      message: "Message sent successfully!" 
    });
    
  } catch (error) {
    console.error("Detailed error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}