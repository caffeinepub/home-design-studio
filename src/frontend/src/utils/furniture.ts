import type { Size } from "../backend.d";

export interface FurnitureTemplate {
  type: string;
  label: string;
  defaultSize: Size;
  color: string;
  darkColor: string;
}

// Default sizes in feet (will be scaled by PIXELS_PER_FOOT)
export const FURNITURE_TEMPLATES: FurnitureTemplate[] = [
  {
    type: "sofa",
    label: "Sofa",
    defaultSize: { width: 7, height: 3 },
    color: "#5B7FA6",
    darkColor: "#4A6A8E",
  },
  {
    type: "armchair",
    label: "Armchair",
    defaultSize: { width: 3, height: 3 },
    color: "#7BA05B",
    darkColor: "#6A8E4A",
  },
  {
    type: "bed_single",
    label: "Bed (Single)",
    defaultSize: { width: 3, height: 6.5 },
    color: "#A05B7B",
    darkColor: "#8E4A6A",
  },
  {
    type: "bed_double",
    label: "Bed (Double)",
    defaultSize: { width: 5, height: 6.5 },
    color: "#8B5BA0",
    darkColor: "#7A4A8E",
  },
  {
    type: "dining_table",
    label: "Dining Table",
    defaultSize: { width: 6, height: 4 },
    color: "#C47B3A",
    darkColor: "#B06A2A",
  },
  {
    type: "coffee_table",
    label: "Coffee Table",
    defaultSize: { width: 4, height: 2 },
    color: "#3A94C4",
    darkColor: "#2A80B0",
  },
  {
    type: "desk",
    label: "Desk",
    defaultSize: { width: 5, height: 2.5 },
    color: "#4A9E8E",
    darkColor: "#3A8A7A",
  },
  {
    type: "bookshelf",
    label: "Bookshelf",
    defaultSize: { width: 5, height: 1 },
    color: "#8E6E4A",
    darkColor: "#7A5C3A",
  },
  {
    type: "dresser",
    label: "Dresser",
    defaultSize: { width: 4, height: 1.5 },
    color: "#A07B5B",
    darkColor: "#8E6A4A",
  },
  {
    type: "tv_stand",
    label: "TV Stand",
    defaultSize: { width: 5, height: 1.5 },
    color: "#5B6B8E",
    darkColor: "#4A5A7A",
  },
];

export function getFurnitureTemplate(type: string): FurnitureTemplate {
  return (
    FURNITURE_TEMPLATES.find((t) => t.type === type) ?? FURNITURE_TEMPLATES[0]
  );
}

export function getFurnitureColor(type: string): string {
  const template = getFurnitureTemplate(type);
  return template.color;
}
