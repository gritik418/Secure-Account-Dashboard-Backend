import DeviceDetector from "device-detector-js";
const deviceDetector = new DeviceDetector();
const detector = async (req, res, next) => {
    try {
        const userAgent = req.headers["user-agent"];
        const device = deviceDetector.parse(userAgent);
        const ip = req.ip;
        req["device"] = device;
        console.log(ip);
        next();
    }
    catch (error) { }
};
export default detector;
//# sourceMappingURL=detector.js.map