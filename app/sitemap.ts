import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";
import { PACK_LIST } from "@/lib/plans";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: SITE.url,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...PACK_LIST.map((pack) => ({
      url: `${SITE.url}/checkout/${pack.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    {
      url: `${SITE.url}/order`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];
}
