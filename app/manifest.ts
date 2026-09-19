import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.shortName,
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#06070e",
    theme_color: "#06070e",
    categories: ["entertainment", "shopping"],
    icons: [
      {
        src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='0.9em' font-size='90'%3E%E2%9A%A1%3C/text%3E%3C/svg%3E",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
