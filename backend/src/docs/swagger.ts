import type { Express } from "express";
import swaggerUi from "swagger-ui-express";
import { buildOpenApiSpec } from "./openapi.js";

/**
 * Serves interactive API docs at `/api-docs`.
 */
export function setupSwagger(app: Express): void {
  const spec = buildOpenApiSpec();

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(spec, {
      customSiteTitle: "Elctro API Docs",
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: "list",
        filter: true,
        tryItOutEnabled: true,
      },
    })
  );

  // Raw OpenAPI JSON for tooling / CI
  app.get("/openapi.json", (_req, res) => {
    res.json(spec);
  });
}
