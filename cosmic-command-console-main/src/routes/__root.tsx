import { Outlet, createRootRoute, HeadContent, Scripts, Link } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { AuthProvider } from "@/lib/auth";
import { StarField } from "@/components/StarField";
import { Header } from "@/components/Header";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass max-w-md rounded-2xl p-10 text-center">
        <h1 className="text-7xl font-bold text-gradient-aurora">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Lost in deep space</h2>
        <p className="mt-2 text-sm text-muted-foreground">This sector is uncharted. Return to base.</p>
        <Link to="/" className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Go home
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "NASA Deep Space Command & Prediction System" },
      { name: "description", content: "AI-driven mission feasibility, climate prediction, and command operations across the solar system." },
      { property: "og:title", content: "NASA Deep Space Command" },
      { property: "og:description", content: "AI-driven mission feasibility & command operations." },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <StarField />
      <Header />
      <Outlet />
    </AuthProvider>
  );
}
