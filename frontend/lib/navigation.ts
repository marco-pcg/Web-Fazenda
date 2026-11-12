import { resources } from "@/features";

export const navigation = resources.map((resource) => ({
  title: resource.title,
  href: `/${resource.key}`,
}));
