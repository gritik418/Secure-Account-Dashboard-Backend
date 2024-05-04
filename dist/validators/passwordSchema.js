import vine from "@vinejs/vine";
const changePasswordSchema = vine.object({
    old_password: vine.string().minLength(8).maxLength(32),
    new_password: vine.string().minLength(8).maxLength(32).confirmed(),
});
export default changePasswordSchema;
//# sourceMappingURL=passwordSchema.js.map