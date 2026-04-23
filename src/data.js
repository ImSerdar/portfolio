// ============================================================================
// PORTFOLIO CONTENT DATA (EDIT THIS SECTION TO CHANGE WEBSITE CONTENT)
// ============================================================================
export const PORTFOLIO_DATA = {
  header: {
    logo: "Serdar.",
    navLinks: [
      { name: "Services", href: "/#services" },
      { name: "Process", href: "/#process" },
      { name: "Work", href: "/#work" },
      { name: "Showcase", href: "/showcase" },
      { name: "Contact", href: "/#contact" }
    ]
  },
  hero: {
    badge: "Available for new projects",
    headline: "I solve technical problems.",
    tagline: "I build fast websites, fix broken ones, and automate what's eating your time. No jargon, no bloat — just results that ship.",
    primaryCta: { text: "Let's Talk", href: "/#contact" },
    secondaryCta: { text: "See My Work", href: "/#work" },
    image: "/hero_abstract.png"
  },
  stats: {
    items: [
      { value: "< 24h", label: "Reply Time" },
      { value: "5+", label: "Years Building" },
      { value: "100%", label: "Direct Contact" },
      { value: "Fixed", label: "Transparent Pricing" }
    ]
  },
  services: {
    title: "My Services",
    items: [
      {
        id: 1,
        title: "Web Development",
        description: "From idea to launch. Fast, responsive sites built to convert — not just to exist.",
        features: [
          "Custom design, mobile-first",
          "Lightning-fast load times",
          "SEO-ready out of the box",
          "Launch in weeks, not months"
        ]
      },
      {
        id: 2,
        title: "Website Management",
        description: "Keep your site running while you focus on the business. I handle the technical grind.",
        features: [
          "Uptime monitoring & alerts",
          "Security patches & backups",
          "Content & feature updates",
          "Performance tuning"
        ]
      },
      {
        id: 3,
        title: "Automation & Tools",
        description: "Stop doing the same task twice. Let me build the tool that saves you hours every week.",
        features: [
          "API integrations",
          "Data pipelines & scrapers",
          "Scheduled jobs & alerts",
          "Internal dashboards"
        ]
      }
    ]
  },
  process: {
    title: "How I Work",
    subtitle: "No surprises. No agency games. Just a clear path from call to launch.",
    steps: [
      {
        id: "01",
        title: "Discovery Call",
        description: "Free 15-minute call. We talk through what you need and whether I'm the right fit."
      },
      {
        id: "02",
        title: "Scope & Quote",
        description: "You get a written plan with fixed pricing and a clear timeline. No hidden fees."
      },
      {
        id: "03",
        title: "Build & Iterate",
        description: "Weekly progress updates. You see the work as it happens and can course-correct early."
      },
      {
        id: "04",
        title: "Launch & Support",
        description: "Deploy, train your team, and 30 days of included post-launch support. You own everything."
      }
    ]
  },
  work: {
    title: "Sample Builds",
    projects: [
      {
        id: 1,
        title: "E\u2011Commerce Platform",
        description: "A full-stack online store featuring responsive design, secure payment gateways, and scalable backend infrastructure.",
        tags: ["React", "Node.js", "Stripe"],
        link: "/demo/ecommerce",
        image: "/ecommerce_preview.png"
      },
      {
        id: 2,
        title: "Workflow Automation Tool",
        description: "An internal tool that automates repetitive data entry tasks, saving clients countless hours each week.",
        tags: ["Python", "API", "Automation"],
        link: "/demo/workflow",
        image: "/workflow_preview.png"
      },
      {
        id: 3,
        title: "Corporate Website Redesign",
        description: "A complete overhaul of a client's legacy site, drastically improving UX, accessibility, and SEO performance.",
        tags: ["Next.js", "Design System", "CMS"],
        link: "/demo/corporate",
        image: "/corporate_preview.png"
      },
      {
        id: 4,
        title: "Fitness Tracking Mobile App",
        description: "A mobile-first dashboard summarizing real-time health metrics, activity rings, and historical workout logs.",
        tags: ["React Native", "GraphQL", "UX/UI"],
        link: "/demo/fitness",
        image: "/fitness_app.png"
      },
      {
        id: 5,
        title: "Crypto Trading Terminal",
        description: "High-frequency trading interface featuring live WebSocket candlestick charts and advanced dark mode optimization.",
        tags: ["Vue 3", "WebSockets", "Data"],
        link: "/demo/crypto",
        image: "/crypto_dashboard.png"
      },
      {
        id: 6,
        title: "Creative Agency Hub",
        description: "A minimalist digital headquarters for an ad agency, heavily relying on massive typography and WebGL interactive environments.",
        tags: ["Three.js", "GSAP", "Branding"],
        link: "/demo/agency",
        image: "/marketing_site.png"
      }
    ]
  },
  ctaBanner: {
    headline: "Still reading?",
    subtext: "Let's stop talking and start building. Free 15-min call, no pitch.",
    button: { text: "Book a Call", href: "/#contact" }
  },
  showcase: {
    title: "Websites I've Built & Manage",
    description: "Check out these live previews of client websites on different devices.",
    sites: [
      {
        id: 1,
        name: "Gold Star Fade",
        url: "https://goldstarfade.ca",
        role: "Built from scratch"
      },
      {
        id: 2,
        name: "Argus Carriers",
        url: "https://arguscarriers.com",
        role: "Built from scratch"
      },
      {
        id: 3,
        name: "Coquitlam Family Chiropractic",
        url: "https://coquitlamfamilychiropractic.com",
        role: "Currently managing"
      }
    ]
  },
  contact: {
    title: "Get In Touch",
    headline: "Have a project in mind?",
    text: "Tell me what you're building or what's broken. I reply within 24 hours — no auto-responders, no sales funnels.",
    email: "hello@example.com",
    primaryCta: { text: "Email Me", href: "mailto:hello@example.com" },
    secondaryCta: { text: "Book a 15-min Call", href: "mailto:hello@example.com?subject=15-min%20Call%20Request" },
    availability: "Available for freelance opportunities",
    replyTime: "Replies within 24 hours"
  }
};
