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
    badge: "STATUS: ACCEPTING NEW PROJECTS",
    headline: "Full-Stack Engineering & System Architecture.",
    tagline: "Building high-performance web applications, resilient backend architectures, and immersive digital experiences for companies that demand technical excellence.",
    primaryCta: { text: "Let's Talk", href: "/#contact" },
    secondaryCta: { text: "See My Work", href: "/#work" },
    image: "/hero_abstract.png"
  },
  stats: {
    title: "System Telemetry",
    items: [
      { value: "99.9%", label: "Uptime SLA" },
      { value: "< 50ms", label: "API Latency" },
      { value: "100+", label: "Production Deployments" },
      { value: "Zero", label: "Compromises" }
    ]
  },
  services: {
    title: "Core Competencies",
    items: [
      {
        id: 1,
        title: "Digital Architecture",
        description: "Engineering robust, ultra-fast web platforms using state-of-the-art frameworks. Designed for maximum performance, SEO dominance, and unparalleled user engagement.",
        features: [
          "Immersive 3D & WebGL Experiences",
          "Lightning-fast load times",
          "Scalable modern tech stacks",
          "Bespoke UI/UX implementation"
        ]
      },
      {
        id: 2,
        title: "Platform Operations",
        description: "Proactive maintenance, security hardening, and performance optimization. Ensuring your digital infrastructure remains resilient and scales seamlessly.",
        features: [
          "Zero-downtime deployments",
          "Security patches & auditing",
          "Continuous feature iteration",
          "Performance & core web vitals"
        ]
      },
      {
        id: 3,
        title: "Workflow Engineering",
        description: "Developing bespoke internal tooling and automation pipelines. Eliminating operational friction and transforming complex workflows into automated processes.",
        features: [
          "Custom API integrations",
          "Complex data pipelines",
          "Automated cloud infrastructure",
          "Executive dashboards"
        ]
      }
    ]
  },
  process: {
    title: "Engagement Model",
    subtitle: "A refined, strategic approach to technical delivery. Moving seamlessly from conceptual architecture to production scale.",
    steps: [
      {
        id: "01",
        title: "Discovery & System Design",
        description: "An executive-level consultation to dissect your objectives, evaluate technical feasibility, and map out architectural requirements."
      },
      {
        id: "02",
        title: "Architectural Prototyping",
        description: "A meticulously crafted blueprint outlining the technical stack, precise deliverables, and transparent investment structuring."
      },
      {
        id: "03",
        title: "Agile Implementation",
        description: "Iterative, high-velocity development cycles with transparent communication. Rapid prototyping ensuring flawless execution."
      },
      {
        id: "04",
        title: "CI/CD & Scale",
        description: "Seamless transition to production environments accompanied by comprehensive documentation and dedicated post-launch support."
      }
    ]
  },
  work: {
    title: "Featured Case Studies",
    projects: [
      {
        id: 1,
        title: "Enterprise Commerce Platform",
        description: "A full-stack online store featuring responsive design, secure payment gateways, and scalable backend infrastructure.",
        tags: ["React", "Node.js", "Stripe"],
        link: "/demo/ecommerce",
        image: "/ecommerce_preview.png"
      },
      {
        id: 2,
        title: "Intelligent Automation Pipeline",
        description: "An internal tool that automates repetitive data entry tasks, saving clients countless hours each week.",
        tags: ["Python", "API", "Automation"],
        link: "/demo/workflow",
        image: "/workflow_preview.png"
      },
      {
        id: 3,
        title: "Global Brand Architecture",
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
    title: "Production Deployments",
    description: "A curated selection of live production environments engineered and maintained for global clientele.",
    sites: [
      {
        id: 1,
        name: "Gold Star Fade",
        url: "https://goldstarfade.ca",
        role: "Built from scratch & Currently managing",
        technologies: ["WordPress", "Elementor"]
      },
      {
        id: 2,
        name: "Argus Carriers",
        url: "https://arguscarriers.com",
        role: "Built from scratch & Currently managing",
        technologies: ["WordPress", "Elementor"]
      },
      {
        id: 3,
        name: "Coquitlam Family Chiropractic",
        url: "https://coquitlamfamilychiropractic.com",
        role: "Currently managing",
        technologies: ["Next.js", "React"]
      }
    ]
  },
  contact: {
    title: "Initiate Dialogue",
    headline: "Ready to elevate your digital presence?",
    text: "Reach out to discuss technical architecture, complex integrations, or bespoke development solutions. Operating at the highest standards of engineering.",
    email: "serdara@gmx.com",
    primaryCta: { text: "Initialize Contact", href: "mailto:serdara@gmx.com" },
    secondaryCta: { text: "Request Consultation", href: "mailto:serdara@gmx.com?subject=Strategic%20Consultation%20Request" },
    availability: "Accepting select technical engagements",
    replyTime: "Priority response queue"
  }
};
