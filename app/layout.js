import { Montserrat, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { icon } from "leaflet";

const source_sans_3 = Source_Sans_3({
  variable: "--font-source-sans-3",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "E-Alumni",
  description: "Aplikasi untuk mempermudah pengelolaan data alumni BBGTK",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} ${source_sans_3.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
