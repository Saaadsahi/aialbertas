import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://aialbertas.com",
      priority: 1
    },
    {
      url: "https://aialbertas.com/services",
      priority: 0.8
    },
    {
      url: "https://aialbertas.com/contact",
      priority: 0.7
    },
    {
      url: "https://aialbertas.com/about",
      priority: 0.7
    },
    {
      url: "https://aialbertas.com/projects",
      priority: 0.7
    },
    {
      url: "https://aialbertas.com/community",
      priority: 0.7
    },
    {
      url: "https://aialbertas.com/ai-automation-alberta",
      priority: 0.8
    },
    {
      url: "https://aialbertas.com/ai-consulting-edmonton",
      priority: 0.8
    },
    {
      url: "https://aialbertas.com/ai-development-alberta",
      priority: 0.8
    }
  ];
}
