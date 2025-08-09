export const brand = {
  name: "Propellic",
  // === Core ===
  primary: "#E21A6B",   // Pink (CTA, highlights)
  secondary: "#152534", // Midnight (surfaces, headers)
  bg: "#FFFFFF",
  text: "#152534",
  // === Extended ===
  accent: "#EB669C",    // lighter pink accent
  shadeDeep: "#482342", // deep plum for charts/borders
  tintLight: "#F7BFD5", // light pink tint for backgrounds
  shadePunch: "#8F1F55",// strong pink shadow
  // Status (not in guide; sensible defaults)
  success: "#10B981",
  warning: "#F59E0B",
  danger:  "#EF4444",
  // === Typography ===
  fontHeading: "Proxima Nova", // fallback wired via CSS var
  fontBody: "Proxima Nova",
  fallbackHeading: "Montserrat",
  fallbackBody: "Montserrat",
  // Logos (drop SVGs in /public/brand)
  logoLight: "/brand/propellic-logo-light.svg",
  logoDark: "/brand/propellic-logo-dark.svg",
};