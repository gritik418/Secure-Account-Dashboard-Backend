import { errors } from "@vinejs/vine";
export class ErrorReporter {
    constructor() {
        /**
         * A flag to know if one or more errors have been
         * reported
         */
        this.hasErrors = false;
        /**
         * A collection of errors. Feel free to give accurate types
         * to this property
         */
        this.errors = {};
    }
    /**
     * VineJS call the report method
     */
    report(message, rule, field, meta) {
        this.hasErrors = true;
        /**
         * Collecting errors as per the JSONAPI spec
         */
        this.errors[field.name] = message;
    }
    /**
     * Creates and returns an instance of the
     * ValidationError class
     */
    createError() {
        return new errors.E_VALIDATION_ERROR(this.errors);
    }
}
//# sourceMappingURL=ErrorReporter.js.map