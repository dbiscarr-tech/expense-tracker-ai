import {
  UtensilsCrossed,
  Car,
  Film,
  ShoppingBag,
  Receipt,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";
import type { Category } from "./types";

// Colors follow the validated categorical palette (fixed order, never cycled).
// Slots 1-6: blue, orange, aqua, yellow, magenta, green.
interface CategoryMeta {
  icon: LucideIcon;
  color: string; // light-mode hex
  bg: string; // light background tint
  text: string; // accessible text-on-tint color
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  Food: { icon: UtensilsCrossed, color: "#2a78d6", bg: "#eaf2fc", text: "#184f95" },
  Transportation: { icon: Car, color: "#eb6834", bg: "#fdeee7", text: "#a8451f" },
  Entertainment: { icon: Film, color: "#1baf7a", bg: "#e6f7f1", text: "#0f7a54" },
  Shopping: { icon: ShoppingBag, color: "#eda100", bg: "#fdf3e0", text: "#8a5f00" },
  Bills: { icon: Receipt, color: "#e87ba4", bg: "#fceef3", text: "#a8386a" },
  Other: { icon: MoreHorizontal, color: "#008300", bg: "#e5f5e5", text: "#006300" },
};

export const CATEGORY_COLORS: Record<Category, string> = Object.fromEntries(
  Object.entries(CATEGORY_META).map(([k, v]) => [k, v.color])
) as Record<Category, string>;
