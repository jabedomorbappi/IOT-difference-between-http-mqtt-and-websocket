import "./globals.css";

export const metadata = {
  title: "IoT Dashboard",
  description: "ESP8266 Device Control & Monitoring",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}