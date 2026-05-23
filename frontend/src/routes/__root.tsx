import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 relative">
      <div className="page-bg" aria-hidden />
      <div className="max-w-md text-center relative z-10">
        <h1 className="text-8xl font-display font-extrabold text-aurora">404</h1>
        <h2 className="mt-4 text-2xl font-display font-bold">Wrong dimension</h2>
        <p className="mt-2 text-sm text-white/50">This AlterEgo doesn&apos;t exist yet.</p>
        <div className="mt-6">
          <Link to="/" className="btn-aurora inline-flex px-5 py-2.5 text-sm font-medium">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-white/60">Try again, or head back home.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="btn-aurora px-5 py-2.5 text-sm">Try again</button>
          <a href="/" className="px-5 py-2.5 text-sm rounded-full border border-white/10">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "AlterEgo — Meet Every Version of You" },
      { name: "description", content: "Upload your headshot. Pick your persona. AI reimagines you as a Founder, Anime Hero, Cyberpunk Hacker, and more." },
      { property: "og:title", content: "AlterEgo — AI Avatar Branding Studio" },
      { property: "og:description", content: "Transform your headshot into 6 cinematic personas with AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Syne:wght@400..800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="noise" />
        <Outlet />
        <Toaster richColors closeButton />
      </AuthProvider>
    </QueryClientProvider>
  );
}
