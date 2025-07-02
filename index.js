// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  contacts;
  blogPosts;
  projects;
  currentContactId;
  currentBlogId;
  currentProjectId;
  constructor() {
    this.contacts = /* @__PURE__ */ new Map();
    this.blogPosts = /* @__PURE__ */ new Map();
    this.projects = /* @__PURE__ */ new Map();
    this.currentContactId = 1;
    this.currentBlogId = 1;
    this.currentProjectId = 1;
    this.initializeSampleData();
  }
  initializeSampleData() {
    const samplePosts = [
      {
        title: "Creating Interactive Dashboards in Power BI",
        slug: "creating-interactive-dashboards-power-bi",
        excerpt: "Learn how to build compelling and interactive dashboards in Power BI that drive business decisions. Step-by-step guide with real examples...",
        content: "Full blog post content here...",
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
        tags: ["Power BI", "Tutorial"],
        readTime: 5
      },
      {
        title: "Advanced Excel Techniques for Data Analysts",
        slug: "advanced-excel-techniques-data-analysts",
        excerpt: "Master advanced Excel functions, pivot tables, and data analysis techniques that every data analyst should know. Boost your productivity with these tips...",
        content: "Full blog post content here...",
        imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
        tags: ["Excel", "Tips"],
        readTime: 7
      },
      {
        title: "Data Cleaning Best Practices and Common Pitfalls",
        slug: "data-cleaning-best-practices-common-pitfalls",
        excerpt: "Data cleaning is 80% of the work in data analysis. Learn the best practices, common mistakes to avoid, and efficient techniques for preparing your data...",
        content: "Full blog post content here...",
        imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
        tags: ["Data Cleaning", "Best Practices"],
        readTime: 6
      }
    ];
    samplePosts.forEach((post) => this.createBlogPost(post));
    const sampleProjects = [
      {
        title: "Sales Performance Dashboard",
        description: "Interactive Power BI dashboard tracking monthly sales performance, revenue trends, and key performance indicators with dynamic filtering capabilities.",
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
        technologies: ["Power BI", "KPI Tracking", "Sales Analytics"],
        liveUrl: "#",
        githubUrl: "#",
        featured: true
      },
      {
        title: "Customer Segmentation Analysis",
        description: "Advanced Excel analysis identifying customer behavior patterns and segments, enabling targeted marketing strategies and improved customer retention.",
        imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
        technologies: ["Excel Advanced", "Customer Analytics", "Segmentation"],
        liveUrl: "#",
        githubUrl: "#",
        featured: true
      },
      {
        title: "Hospital Admission Insights",
        description: "Comprehensive visual reports analyzing hospital admission data patterns, patient demographics, and operational efficiency metrics for healthcare management.",
        imageUrl: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
        technologies: ["Healthcare Analytics", "Visual Reports", "Data Insights"],
        liveUrl: "#",
        githubUrl: "#",
        featured: true
      }
    ];
    sampleProjects.forEach((project) => this.createProject(project));
  }
  async createContact(insertContact) {
    const id = this.currentContactId++;
    const contact = {
      ...insertContact,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.contacts.set(id, contact);
    return contact;
  }
  async getContacts() {
    return Array.from(this.contacts.values()).sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }
  async getBlogPosts() {
    return Array.from(this.blogPosts.values()).sort(
      (a, b) => (b.publishedAt?.getTime() || 0) - (a.publishedAt?.getTime() || 0)
    );
  }
  async getBlogPost(slug) {
    return Array.from(this.blogPosts.values()).find((post) => post.slug === slug);
  }
  async createBlogPost(insertPost) {
    const id = this.currentBlogId++;
    const post = {
      ...insertPost,
      id,
      publishedAt: /* @__PURE__ */ new Date()
    };
    this.blogPosts.set(id, post);
    return post;
  }
  async getProjects() {
    return Array.from(this.projects.values());
  }
  async getFeaturedProjects() {
    return Array.from(this.projects.values()).filter((project) => project.featured);
  }
  async createProject(insertProject) {
    const id = this.currentProjectId++;
    const project = { ...insertProject, id };
    this.projects.set(id, project);
    return project;
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  tags: text("tags").array(),
  publishedAt: timestamp("published_at").defaultNow(),
  readTime: integer("read_time")
});
var projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  technologies: text("technologies").array(),
  liveUrl: text("live_url"),
  githubUrl: text("github_url"),
  featured: boolean("featured").default(false)
});
var insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true
});
var insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  publishedAt: true
});
var insertProjectSchema = createInsertSchema(projects).omit({
  id: true
});

// server/routes.ts
import { z } from "zod";
async function registerRoutes(app2) {
  app2.post("/api/contact", async (req, res) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(contactData);
      res.json({ success: true, contact });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, errors: error.errors });
      } else {
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });
  app2.get("/api/contacts", async (req, res) => {
    try {
      const contacts2 = await storage.getContacts();
      res.json(contacts2);
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/blog", async (req, res) => {
    try {
      const posts = await storage.getBlogPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/blog/:slug", async (req, res) => {
    try {
      const post = await storage.getBlogPost(req.params.slug);
      if (!post) {
        return res.status(404).json({ success: false, message: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/projects", async (req, res) => {
    try {
      const projects2 = await storage.getProjects();
      res.json(projects2);
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/projects/featured", async (req, res) => {
    try {
      const projects2 = await storage.getFeaturedProjects();
      res.json(projects2);
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
