import nodemailer from "nodemailer";

export type MailOptionsType = {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
};

const transporter = nodemailer.createTransport({
  service: "Gmail",
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

const sendEmail = async (mailOptions: MailOptionsType) => {
  try {
    await new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          reject(error);
        } else {
          resolve(info);
        }
      });
    });
  } catch (error) {
    return false;
  }
};

export default sendEmail;
