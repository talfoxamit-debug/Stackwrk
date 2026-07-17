import Script from "next/script";

/**
 * Meta (Facebook) Pixel, loaded only when NEXT_PUBLIC_META_PIXEL_ID is set, so
 * it stays dormant until Tal drops in a real pixel id. Fires a base PageView;
 * conversion events (Lead) can be added on funnel success paths later. Paired
 * with fbclid capture in src/lib/attribution.ts.
 */
export default function MetaPixel() {
  const id = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  if (!id) return null;
  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${id}');fbq('track','PageView');`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img height="1" width="1" style={{ display: "none" }} alt=""
          src={`https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1`} />
      </noscript>
    </>
  );
}
