import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "IoT Dashboard",
  description: "ESP8266 Device Control & Monitoring",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}