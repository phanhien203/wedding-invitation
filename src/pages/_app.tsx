import "@/styles/globals.css";
import "aos/dist/aos.css";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/zoom";
import type { AppProps } from "next/app";
import { Cormorant_Garamond, Be_Vietnam_Pro } from "next/font/google";

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

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={`${serif.variable} ${sans.variable}`}>
      <Component {...pageProps} />
    </main>
  );
}
