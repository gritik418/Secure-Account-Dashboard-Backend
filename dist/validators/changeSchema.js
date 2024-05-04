import vine from "@vinejs/vine";
const changeSchema = vine.object({
    old_password: vine.string().minLength(6).maxLength(32),
    new_password: vine.string().minLength(8).maxLength(32).confirmed(),
});
export default changeSchema;
//# sourceMappingURL=changeSchema.js.map