import "@/styles/globals.css";
import "aos/dist/aos.css";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/zoom";
import type { AppProps } from "next/app";
import {
  Cormorant_Garamond,
  Be_Vietnam_Pro,
  Dancing_Script,
  Great_Vibes,
  Playfair_Display,
} from "next/font/google";

const serif = Cormorant_Garamond({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
});

const sans = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
});

const script = Dancing_Script({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700"],
  variable: "--font-script",
});

const calligraphy = Great_Vibes({
  subsets: ["latin", "vietnamese"],
  weight: ["400"],
  variable: "--font-calligraphy",
});

// Font hiển thị số (giờ, ngày, năm) — số lining rõ nét, sang trọng.
const display = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main
      className={`${serif.variable} ${sans.variable} ${script.variable} ${calligraphy.variable} ${display.variable} font-sans`}
    >
      <Component {...pageProps} />
    </main>
  );
}
