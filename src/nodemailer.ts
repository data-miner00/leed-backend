import nodemailer from "nodemailer";
import config from "./config";

export const transporter = nodemailer.createTransport(config.nodemailerConfig);
export default transporter;
