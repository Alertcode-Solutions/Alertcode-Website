import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import {
  ADMIN_SESSION_COOKIE_NAME,
  isSafeRedirectPath,
  verifySessionToken,
} from "@/lib/auth";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: {
    index: false,
    follow: false,
  },
};

type AdminLoginPageProps = {
  searchParams?: {
    next?: string | string[];
  };
};

async function hasValidSession(): Promise<boolean> {
  const token = cookies().get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const sessionSecret = process.env.SESSION_SECRET?.trim();

  if (!token || !sessionSecret) {
    return false;
  }

  const payload = await verifySessionToken(token, sessionSecret);
  return Boolean(payload);
}

function getNextPath(searchParams: AdminLoginPageProps["searchParams"]): string {
  const rawNext = Array.isArray(searchParams?.next) ? searchParams.next[0] : searchParams?.next;
  return isSafeRedirectPath(rawNext);
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const nextPath = getNextPath(searchParams);

  if (await hasValidSession()) {
    redirect(nextPath);
  }

  return (
    <Section className="min-h-screen flex items-center">
      <Container>
        <div className="mx-auto max-w-md space-y-6 border border-border bg-card p-8">
          <h1 className="type-h2">Admin Login</h1>
          <p className="type-body-sm">Sign in with admin credentials to access dashboard routes.</p>
          <LoginForm nextPath={nextPath} />
        </div>
      </Container>
    </Section>
  );
}
