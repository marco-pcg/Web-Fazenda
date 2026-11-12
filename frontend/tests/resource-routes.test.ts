import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import inventory from "../docs/backend-endpoints.json";
import { resources } from "@/features";

describe("backend endpoint coverage", () => {
  it.each(inventory)(
    "covers all backend routes for $key without inventing operations",
    (expected) => {
      const resource = resources.find((item) => item.key === expected.key);
      expect(resource).toBeDefined();
      expect(
        resource!.endpoints
          .map((endpoint) => `${endpoint.method} ${endpoint.path}`)
          .sort(),
      ).toEqual(
        expected.endpoints
          .map((endpoint) => `${endpoint.method} ${endpoint.path}`)
          .sort(),
      );
      const routes = resource!.endpoints.map((endpoint) => endpoint.route);
      expect(new Set(routes).size).toBe(routes.length);
      for (const endpoint of resource!.endpoints) {
        expect(
          existsSync(
            join(
              process.cwd(),
              "app",
              "(workspace)",
              endpoint.route.slice(1),
              "page.tsx",
            ),
          ),
        ).toBe(true);
        expect(endpoint.params.map((param) => param.name).sort()).toEqual(
          [...endpoint.route.matchAll(/\[([^\]]+)\]/g)]
            .map((match) => match[1])
            .sort(),
        );
      }
    },
  );
});
