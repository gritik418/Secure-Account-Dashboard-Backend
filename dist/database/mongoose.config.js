import { connect } from "mongoose";
const connectToDB = async () => {
    try {
        const { connection } = await connect(process.env.MONGO_URI, {
            dbName: "Secure-Account-Dashboard",
        });
        console.log(connection.host);
    }
    catch (error) {
        console.log(`Mongo Error: ${error}`);
    }
};
export default connectToDB;
//# sourceMappingURL=mongoose.config.js.map