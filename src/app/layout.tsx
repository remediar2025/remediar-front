// app/layout.tsx
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Roboto } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const SITE_URL = "https://ongremediar.com.br";

const roboto = Roboto({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

// 👇 AGORA AQUI: themeColor fica no viewport
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f19" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "Remediar",
  title: {
    default: "Remediar",
    template: "%s | Remediar",
  },
  description:
    "Solução para solicitação de medicamentos de forma rápida e eficiente",
  keywords: [
    "remediar",
    "medicamentos",
    "solicitação de remédios",
    "farmácia digital",
    "saúde",
    "receita",
    "entrega de medicamentos",
    "ong",
    "organização sem fins lucrativos",
    "ods",
    "desenvolvimento sustentável",
    "acesso à saúde",
    "inclusão social",
    "tecnologia para o bem",
  ],
  referrer: "origin-when-cross-origin",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: "Remediar",
    title: "Remediar — solicitação de medicamentos rápida e eficiente",
    description: "Solicite seus medicamentos de forma ágil, simples e segura.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Remediar" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Remediar — solicitação de medicamentos rápida e eficiente",
    description: "Solicite seus medicamentos de forma ágil, simples e segura.",
    images: ["/og.png"],
    creator: "@remediar",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [{ rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#0ea5e9" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={cn(roboto.variable, "min-h-screen bg-background antialiased")}>
        <AuthProvider>{children}</AuthProvider>

        {/* JSON-LD: Organization */}
        <Script id="ld-org" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Remediar",
            url: SITE_URL,
            logo: `${SITE_URL}/icon.svg`,
            sameAs: [
              "https://www.instagram.com/remediar",
            ],
          })}
        </Script>

        {/* JSON-LD: WebSite + SearchAction */}
        <Script id="ld-website" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Remediar",
            url: SITE_URL,
            potentialAction: {
              "@type": "SearchAction",
              target: `${SITE_URL}/search?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          })}
        </Script>
      </body>
    </html>
  );
}