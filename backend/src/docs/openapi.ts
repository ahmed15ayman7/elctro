/**
 * OpenAPI 3.0 document for Elctro API (served at /api-docs).
 * `API_PUBLIC_URL` overrides the default server URL (useful behind reverse proxies).
 */
export function buildOpenApiSpec(): Record<string, unknown> {
  const port = process.env.PORT ?? "4000";
  const publicUrl =
    process.env.API_PUBLIC_URL?.replace(/\/$/, "") ??
    `http://localhost:${port}`;

  return {
    openapi: "3.0.3",
    info: {
      title: "Elctro Food Ordering API",
      version: "1.0.0",
      description:
        "REST API for authentication (JWT access + HttpOnly refresh cookie), catalog, orders, and admin user management. " +
        "Protected routes require `Authorization: Bearer <accessToken>`. " +
        "Refresh and logout use the `refresh_token` HttpOnly cookie on `/api/auth/*`.",
    },
    servers: [{ url: publicUrl, description: "API base" }],
    tags: [
      { name: "Health", description: "Liveness" },
      { name: "Auth", description: "Register, login, refresh, logout" },
      { name: "Products", description: "Menu items" },
      { name: "Categories", description: "Product categories" },
      { name: "Orders", description: "Checkout and order tracking" },
      { name: "Users", description: "Profile and admin user management" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Short-lived access token from login/register response.",
        },
        refreshCookie: {
          type: "apiKey",
          in: "cookie",
          name: "refresh_token",
          description: "HttpOnly cookie set by login/register; sent automatically on same-site requests.",
        },
      },
      schemas: {
        UserPublic: {
          type: "object",
          properties: {
            id: { type: "string" },
            email: { type: "string", format: "email" },
            name: { type: "string" },
            role: { type: "string", enum: ["CUSTOMER", "ADMIN"] },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            user: { $ref: "#/components/schemas/UserPublic" },
            accessToken: { type: "string" },
          },
        },
        RegisterBody: {
          type: "object",
          required: ["email", "password", "name"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
            name: { type: "string", maxLength: 100 },
          },
        },
        LoginBody: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" },
          },
        },
        UpdateRoleBody: {
          type: "object",
          required: ["role"],
          properties: {
            role: { type: "string", enum: ["CUSTOMER", "ADMIN"] },
          },
        },
        ErrorBody: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
        EmptyBody: {
          type: "object",
          additionalProperties: false,
          description: "Optional empty JSON object; body may be omitted.",
        },
        ValidationError: {
          type: "object",
          properties: {
            error: { type: "string" },
            issues: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  path: { type: "string" },
                  message: { type: "string" },
                },
              },
            },
          },
        },
        CategoryCreateBody: {
          type: "object",
          required: ["name", "slug"],
          properties: {
            name: { type: "string", minLength: 1, maxLength: 100, example: "Burgers" },
            nameAr: { type: "string", maxLength: 100, example: "برجر" },
            slug: {
              type: "string",
              minLength: 1,
              maxLength: 100,
              pattern: "^[a-z0-9-]+$",
              example: "burgers",
              description: "Lowercase letters, numbers, hyphens only",
            },
          },
        },
        CategoryUpdateBody: {
          type: "object",
          properties: {
            name: { type: "string", minLength: 1, maxLength: 100 },
            nameAr: { type: "string", maxLength: 100 },
            slug: {
              type: "string",
              minLength: 1,
              maxLength: 100,
              pattern: "^[a-z0-9-]+$",
            },
          },
        },
        ProductCreateBody: {
          type: "object",
          required: ["name", "price", "categoryId"],
          properties: {
            name: { type: "string", minLength: 1, maxLength: 200, example: "Classic Burger" },
            nameAr: { type: "string", maxLength: 200 },
            description: { type: "string", example: "Beef patty with lettuce" },
            descriptionAr: { type: "string" },
            price: { type: "number", format: "double", minimum: 0.01, example: 9.99 },
            imageUrl: { type: "string", format: "uri", example: "https://example.com/burger.jpg" },
            isActive: { type: "boolean", default: true },
            categoryId: { type: "string", description: "Category cuid" },
          },
        },
        ProductUpdateBody: {
          type: "object",
          description: "All fields optional; send only fields to change.",
          properties: {
            name: { type: "string", minLength: 1, maxLength: 200 },
            nameAr: { type: "string", maxLength: 200 },
            description: { type: "string" },
            descriptionAr: { type: "string" },
            price: { type: "number", format: "double", minimum: 0.01 },
            imageUrl: { type: "string", format: "uri" },
            isActive: { type: "boolean" },
            categoryId: { type: "string" },
          },
        },
        OrderItemInput: {
          type: "object",
          required: ["productId", "quantity"],
          properties: {
            productId: { type: "string", description: "Product cuid" },
            quantity: { type: "integer", minimum: 1, example: 2 },
          },
        },
        OrderCreateBody: {
          type: "object",
          required: ["items", "address"],
          properties: {
            items: {
              type: "array",
              minItems: 1,
              items: { $ref: "#/components/schemas/OrderItemInput" },
            },
            paymentMethod: {
              type: "string",
              enum: ["COD", "ONLINE_SIMULATED"],
              default: "COD",
            },
            address: { type: "string", minLength: 5, maxLength: 500 },
            notes: { type: "string", maxLength: 500 },
          },
        },
        OrderStatusUpdateBody: {
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: [
                "PENDING",
                "CONFIRMED",
                "PREPARING",
                "OUT_FOR_DELIVERY",
                "DELIVERED",
                "CANCELLED",
              ],
            },
          },
        },
      },
    },
    paths: {
      "/health": {
        get: {
          tags: ["Health"],
          summary: "Health check",
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "ok" },
                      timestamp: { type: "string", format: "date-time" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register",
          description: "Creates a customer account; sets refresh cookie and returns access token.",
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/RegisterBody" } },
            },
          },
          responses: {
            "201": {
              description: "Created",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } },
              },
            },
            "409": {
              description: "Email already registered",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/ErrorBody" } },
              },
            },
            "422": { description: "Validation error" },
          },
        },
      },
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login",
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/LoginBody" } },
            },
          },
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } },
              },
            },
            "401": { description: "Invalid credentials" },
            "422": { description: "Validation error" },
          },
        },
      },
      "/api/auth/refresh": {
        post: {
          tags: ["Auth"],
          summary: "Refresh access token",
          description: "Rotates refresh token; requires `refresh_token` cookie. No JSON body required.",
          security: [{ refreshCookie: [] }],
          requestBody: {
            required: false,
            description: "Optional; send `{}` or leave empty.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EmptyBody" },
              },
            },
          },
          responses: {
            "200": {
              description: "New access token",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } },
              },
            },
            "401": { description: "Missing or invalid refresh session" },
          },
        },
      },
      "/api/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Logout",
          security: [{ refreshCookie: [] }],
          requestBody: {
            required: false,
            description: "Optional; send `{}` or leave empty.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EmptyBody" },
              },
            },
          },
          responses: {
            "200": {
              description: "Logged out",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { message: { type: "string" } },
                  },
                },
              },
            },
          },
        },
      },
      "/api/users/me": {
        get: {
          tags: ["Users"],
          summary: "Current user profile",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/UserPublic" } },
              },
            },
            "401": { description: "Unauthorized" },
            "404": { description: "User not found" },
          },
        },
      },
      "/api/users": {
        get: {
          tags: ["Users"],
          summary: "List users (admin)",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": { description: "OK" },
            "403": { description: "Not an admin" },
            "401": { description: "Unauthorized" },
          },
        },
      },
      "/api/users/{id}": {
        get: {
          tags: ["Users"],
          summary: "Get user by id (admin)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/UserPublic" } },
              },
            },
            "403": { description: "Not an admin" },
            "401": { description: "Unauthorized" },
            "404": { description: "User not found" },
          },
        },
      },
      "/api/users/{id}/role": {
        patch: {
          tags: ["Users"],
          summary: "Set user role (admin)",
          description: "Set role to CUSTOMER or ADMIN.",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UpdateRoleBody" },
              },
            },
          },
          responses: {
            "200": {
              description: "Updated user",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/UserPublic" } },
              },
            },
            "403": { description: "Not an admin" },
            "401": { description: "Unauthorized" },
            "404": { description: "User not found" },
            "422": { description: "Validation error" },
          },
        },
      },
      "/api/users/{id}/promote-to-admin": {
        post: {
          tags: ["Users"],
          summary: "Promote user to admin",
          description: "Idempotent: if the user is already ADMIN, returns the current record.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EmptyBody" },
              },
            },
          },
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "User is now ADMIN",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/UserPublic" } },
              },
            },
            "403": { description: "Not an admin" },
            "401": { description: "Unauthorized" },
            "404": { description: "User not found" },
          },
        },
      },
      "/api/users/{id}/demote-from-admin": {
        post: {
          tags: ["Users"],
          summary: "Demote admin to customer",
          description:
            "Sets role to CUSTOMER. You cannot demote your own account (409). Idempotent if already CUSTOMER.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EmptyBody" },
              },
            },
          },
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "User is now CUSTOMER",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/UserPublic" } },
              },
            },
            "409": {
              description: "Cannot demote yourself",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/ErrorBody" } },
              },
            },
            "403": { description: "Not an admin" },
            "401": { description: "Unauthorized" },
            "404": { description: "User not found" },
          },
        },
      },
      "/api/products": {
        get: {
          tags: ["Products"],
          summary: "List active products (public)",
          parameters: [
            {
              name: "categoryId",
              in: "query",
              schema: { type: "string" },
            },
            {
              name: "search",
              in: "query",
              schema: { type: "string" },
            },
          ],
          responses: { "200": { description: "OK" } },
        },
        post: {
          tags: ["Products"],
          summary: "Create product (admin)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductCreateBody" },
              },
            },
          },
          responses: {
            "201": { description: "Created" },
            "403": { description: "Forbidden" },
            "401": { description: "Unauthorized" },
            "422": {
              description: "Validation error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ValidationError" },
                },
              },
            },
          },
        },
      },
      "/api/products/manage": {
        get: {
          tags: ["Products"],
          summary: "List all products including inactive (admin)",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": { description: "OK" },
            "403": { description: "Forbidden" },
            "401": { description: "Unauthorized" },
          },
        },
      },
      "/api/products/{id}": {
        get: {
          tags: ["Products"],
          summary: "Get product by id",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            "200": { description: "OK" },
            "404": { description: "Not found" },
          },
        },
        put: {
          tags: ["Products"],
          summary: "Update product (admin)",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductUpdateBody" },
              },
            },
          },
          responses: {
            "200": { description: "OK" },
            "403": { description: "Forbidden" },
            "401": { description: "Unauthorized" },
            "422": {
              description: "Validation error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ValidationError" },
                },
              },
            },
          },
        },
        delete: {
          tags: ["Products"],
          summary: "Delete product (admin)",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            "204": { description: "No content" },
            "403": { description: "Forbidden" },
            "401": { description: "Unauthorized" },
          },
        },
      },
      "/api/categories": {
        get: {
          tags: ["Categories"],
          summary: "List categories",
          responses: { "200": { description: "OK" } },
        },
        post: {
          tags: ["Categories"],
          summary: "Create category (admin)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CategoryCreateBody" },
              },
            },
          },
          responses: {
            "201": { description: "Created" },
            "403": { description: "Forbidden" },
            "401": { description: "Unauthorized" },
            "422": {
              description: "Validation error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ValidationError" },
                },
              },
            },
          },
        },
      },
      "/api/categories/{id}": {
        get: {
          tags: ["Categories"],
          summary: "Get category with products",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            "200": { description: "OK" },
            "404": { description: "Not found" },
          },
        },
        put: {
          tags: ["Categories"],
          summary: "Update category (admin)",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CategoryUpdateBody" },
              },
            },
          },
          responses: {
            "200": { description: "OK" },
            "403": {},
            "401": {},
            "422": {
              description: "Validation error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ValidationError" },
                },
              },
            },
          },
        },
        delete: {
          tags: ["Categories"],
          summary: "Delete category (admin)",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: { "204": { description: "No content" }, "403": {}, "401": {} },
        },
      },
      "/api/orders": {
        get: {
          tags: ["Orders"],
          summary: "List orders",
          description: "Customers see their orders; admins see all.",
          security: [{ bearerAuth: [] }],
          responses: { "200": { description: "OK" }, "401": {} },
        },
        post: {
          tags: ["Orders"],
          summary: "Create order (checkout)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OrderCreateBody" },
              },
            },
          },
          responses: {
            "201": { description: "Created" },
            "401": {},
            "422": {
              description: "Validation error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ValidationError" },
                },
              },
            },
          },
        },
      },
      "/api/orders/{id}": {
        get: {
          tags: ["Orders"],
          summary: "Get order by id",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            "200": { description: "OK" },
            "401": {},
            "403": { description: "Not owner / not admin" },
            "404": {},
          },
        },
      },
      "/api/orders/{id}/status": {
        patch: {
          tags: ["Orders"],
          summary: "Update order status (admin)",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OrderStatusUpdateBody" },
              },
            },
          },
          responses: { "200": {}, "403": {}, "401": {}, "422": {} },
        },
      },
    },
  };
}
