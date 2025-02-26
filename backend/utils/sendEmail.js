import { createTransport } from "nodemailer";

const sendEmail = async (email, subject, text) => {
  try {
    const transporter = createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      text,
    });

    console.log("📩 Email Sent Successfully");
  } catch (error) {
    console.error("❌ Email Sending Error:", error);
  }
};

export default sendEmail;
