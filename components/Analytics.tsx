import Script from "next/script";
import { GA_ID } from "@/lib/analytics";

/** Loads GA4 only when NEXT_PUBLIC_GA_ID is set (e.g. G-XXXXXXXXXX). */
export function Analytics() {
  if (!/^G-[A-Z0-9]{6,}$/.test(GA_ID)) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA_ID}');`}
      </Script>
    </>
  );
}
