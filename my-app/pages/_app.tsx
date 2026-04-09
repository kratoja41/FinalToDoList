import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";

export default function App({ 
  Component, 
  pageProps: { session, ...pageProps } 
}: AppProps) {
  return (
    // SessionProvider zajistí, že hook useSession bude fungovat všude
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}