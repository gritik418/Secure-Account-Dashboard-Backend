import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
    service: "Gmail",
    secure: true,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
    },
});
const sendEmail = async (mailOptions) => {
    try {
        await new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(info);
                }
            });
        });
    }
    catch (error) {
        return false;
    }
};
export default sendEmail;
//# sourceMappingURL=sendEmail.js.map