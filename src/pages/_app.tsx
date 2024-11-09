// src/pages/_app.tsx
import '../styles/globals.css';

function MyApp({ Component, pageProps }: { Component: React.ElementType; pageProps: Record<string, unknown> }) {
  return <Component {...pageProps} />;
}

export default MyApp;
