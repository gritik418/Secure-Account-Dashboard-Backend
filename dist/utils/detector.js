import DeviceDetector from "device-detector-js";
const deviceDetector = new DeviceDetector();
const detector = async (req) => {
    try {
        const userAgent = req.headers["user-agent"];
        const device = deviceDetector.parse(userAgent);
        const deviceInfo = (req["device"] = device);
        return deviceInfo;
    }
    catch (error) {
        throw new Error("Server Error");
    }
};
export default detector;
//# sourceMappingURL=detector.js.map