import "server-only";
import QRCode from "qrcode";

/**
 * QR server pe generate hota hai — pehle api.qrserver.com pe
 * UPI ID bhej rahe the (3rd party ko data leak + extra latency).
 */
export async function qrDataUrl(text: string, size = 360): Promise<string> {
  return QRCode.toDataURL(text, {
    width: size,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#06070e", light: "#ffffff" },
  });
}
