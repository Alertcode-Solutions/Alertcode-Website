import Container from "@/components/ui/Container";
import { siteConfig } from "@/lib/config";

const quickLinks = [
  { label: "Work", href: "/#work" },
  { label: "Community", href: "/#community" },
  { label: "Contact", href: "/#contact" },
];

const companyLinks = [
  { label: "About Alertcode", href: "/#top" },
  { label: "Developer Ecosystem", href: "/#community" },
];

const socialLinks = [
  { label: "LinkedIn", href: siteConfig.social.linkedin || "#" },
  { label: "GitHub", href: siteConfig.social.github || "#" },
  { label: "Twitter / X", href: siteConfig.social.x || "#" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-border/90 bg-background/95" aria-label="Site footer">
      <Container>
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div className="space-y-4">
            <p className="text-base font-semibold tracking-tight text-foreground">Alertcode</p>
            <p className="type-body-sm max-w-xs">
              Engineering intelligent digital infrastructure with AI, blockchain, and modern platforms.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Navigation</h2>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Company</h2>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Social</h2>
            <ul className="space-y-2">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.href === "#" ? undefined : "_blank"}
                    rel={link.href === "#" ? undefined : "noreferrer"}
                    className="text-sm text-muted transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border/80 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>{`© ${currentYear} Alertcode. All rights reserved.`}</p>
          <p>Built with precision.</p>
        </div>
      </Container>
    </footer>
  );
}
