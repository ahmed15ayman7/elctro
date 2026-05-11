"use server";

import { apiRequest, ApiError } from "@/lib/api";

export interface Product {
  id: string;
  name: string;
  nameAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  price: string;
  imageUrl: string | null;
  isActive: boolean;
  categoryId: string;
  category: {
    id: string;
    name: string;
    nameAr: string | null;
    slug: string;
  };
}

export interface Category {
  id: string;
  name: string;
  nameAr: string | null;
  slug: string;
  _count?: { products: number };
}

interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getProductsAction(params?: {
  categoryId?: string;
  search?: string;
}): Promise<ActionResult<Product[]>> {
  try {
    const query = new URLSearchParams();
    if (params?.categoryId) query.set("categoryId", params.categoryId);
    if (params?.search) query.set("search", params.search);
    const qs = query.toString();
    const products = await apiRequest<Product[]>(
      `/api/products${qs ? `?${qs}` : ""}`
    );
    return { success: true, data: products };
  } catch (err) {
    return {
      success: false,
      error: err instanceof ApiError ? err.message : "Failed to fetch products",
    };
  }
}

export async function getProductAction(
  id: string
): Promise<ActionResult<Product>> {
  try {
    const product = await apiRequest<Product>(`/api/products/${id}`);
    return { success: true, data: product };
  } catch (err) {
    return {
      success: false,
      error: err instanceof ApiError ? err.message : "Product not found",
    };
  }
}

export async function getCategoriesAction(): Promise<ActionResult<Category[]>> {
  try {
    const categories = await apiRequest<Category[]>("/api/categories");
    return { success: true, data: categories };
  } catch (err) {
    return {
      success: false,
      error: err instanceof ApiError ? err.message : "Failed to fetch categories",
    };
  }
}

export async function getAdminProductsAction(): Promise<ActionResult<Product[]>> {
  try {
    const products = await apiRequest<Product[]>("/api/products/manage");
    return { success: true, data: products };
  } catch (err) {
    return {
      success: false,
      error: err instanceof ApiError ? err.message : "Failed to fetch products",
    };
  }
}

export async function createCategoryAction(data: {
  name: string;
  nameAr?: string;
  slug: string;
}): Promise<ActionResult<Category>> {
  try {
    const category = await apiRequest<Category>("/api/categories", {
      method: "POST",
      body: data,
    });
    return { success: true, data: category };
  } catch (err) {
    return {
      success: false,
      error: err instanceof ApiError ? err.message : "Failed to create category",
    };
  }
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  try {
    await apiRequest(`/api/categories/${id}`, { method: "DELETE" });
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof ApiError ? err.message : "Failed to delete category",
    };
  }
}

export type ProductCreateInput = {
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  price: number;
  imageUrl?: string;
  isActive?: boolean;
  categoryId: string;
};

export async function createProductAction(
  data: ProductCreateInput
): Promise<ActionResult<Product>> {
  try {
    const product = await apiRequest<Product>("/api/products", {
      method: "POST",
      body: data,
    });
    return { success: true, data: product };
  } catch (err) {
    return {
      success: false,
      error: err instanceof ApiError ? err.message : "Failed to create product",
    };
  }
}

export async function updateProductAction(
  id: string,
  data: Partial<Omit<Product, "id" | "category">>
): Promise<ActionResult<Product>> {
  try {
    const product = await apiRequest<Product>(`/api/products/${id}`, {
      method: "PUT",
      body: data,
    });
    return { success: true, data: product };
  } catch (err) {
    return {
      success: false,
      error: err instanceof ApiError ? err.message : "Failed to update product",
    };
  }
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  try {
    await apiRequest(`/api/products/${id}`, {
      method: "DELETE",
    });
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof ApiError ? err.message : "Failed to delete product",
    };
  }
}
