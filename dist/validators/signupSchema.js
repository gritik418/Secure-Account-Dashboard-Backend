import vine from "@vinejs/vine";
const signupSchema = vine.object({
    first_name: vine.string().minLength(3),
    username: vine.string(),
    email: vine.string().email(),
    password: vine.string().minLength(8).maxLength(32).confirmed(),
});
export default signupSchema;
//# sourceMappingURL=signupSchema.js.map