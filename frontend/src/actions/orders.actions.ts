"use server";

import { apiRequest, ApiError } from "@/lib/api";

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  product: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
}

export interface Order {
  id: string;
  userId: string;
  status: string;
  paymentMethod: string;
  total: string;
  address: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

interface CreateOrderInput {
  items: { productId: string; quantity: number }[];
  paymentMethod: "COD" | "ONLINE_SIMULATED";
  address: string;
  notes?: string;
}

interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function createOrderAction(
  data: CreateOrderInput
): Promise<ActionResult<Order>> {
  try {
    const order = await apiRequest<Order>("/api/orders", {
      method: "POST",
      body: data,
    });
    return { success: true, data: order };
  } catch (err) {
    return {
      success: false,
      error: err instanceof ApiError ? err.message : "Failed to place order",
    };
  }
}

export async function getOrdersAction(): Promise<ActionResult<Order[]>> {
  try {
    const orders = await apiRequest<Order[]>("/api/orders");
    return { success: true, data: orders };
  } catch (err) {
    return {
      success: false,
      error: err instanceof ApiError ? err.message : "Failed to fetch orders",
    };
  }
}

export async function getOrderAction(id: string): Promise<ActionResult<Order>> {
  try {
    const order = await apiRequest<Order>(`/api/orders/${id}`);
    return { success: true, data: order };
  } catch (err) {
    return {
      success: false,
      error: err instanceof ApiError ? err.message : "Order not found",
    };
  }
}

export async function updateOrderStatusAction(
  id: string,
  status: string
): Promise<ActionResult<Order>> {
  try {
    const order = await apiRequest<Order>(`/api/orders/${id}/status`, {
      method: "PATCH",
      body: { status },
    });
    return { success: true, data: order };
  } catch (err) {
    return {
      success: false,
      error: err instanceof ApiError ? err.message : "Failed to update status",
    };
  }
}
