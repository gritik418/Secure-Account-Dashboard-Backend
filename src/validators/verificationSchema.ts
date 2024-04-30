import vine from "@vinejs/vine";

const verificationSchema = vine.object({
  email: vine.string().email(),
  otp: vine.string().minLength(6).maxLength(6),
});

export default verificationSchema;
