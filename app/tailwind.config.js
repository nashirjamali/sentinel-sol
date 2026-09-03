/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "media",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          1: "var(--color-primary-1)",
          2: "var(--color-primary-2)",
          3: "var(--color-primary-3)",
          4: "var(--color-primary-4)",
        },
        secondary: {
          1: "var(--color-secondary-1)",
          2: "var(--color-secondary-2)",
          3: "var(--color-secondary-3)",
          4: "var(--color-secondary-4)",
        },
        neutrals: {
          1: "var(--color-neutrals-1)",
          2: "var(--color-neutrals-2)",
          3: "var(--color-neutrals-3)",
          4: "var(--color-neutrals-4)",
          5: "var(--color-neutrals-5)",
          6: "var(--color-neutrals-6)",
          7: "var(--color-neutrals-7)",
          8: "var(--color-neutrals-8)",
        },
        paper: "var(--paper)",
        ink: "var(--ink)",
        border: "var(--paper-line)",
        background: "var(--paper)",
        foreground: "var(--ink)",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        "hairline-2": ["12px", { lineHeight: "12px", letterSpacing: "1px" }],
        caption: ["14px", { lineHeight: "24px" }],
        "caption-2": ["12px", { lineHeight: "20px" }],
        "body-1": ["24px", { lineHeight: "32px", letterSpacing: "-0.01em" }],
        "body-2": ["16px", { lineHeight: "24px" }],
        "button-1": ["16px", { lineHeight: "16px" }],
        "button-2": ["14px", { lineHeight: "16px" }],
      },
      borderRadius: {
        pill: "90px",
        card: "16px",
      },
      boxShadow: {
        depth1: "0 8px 16px -8px rgba(15, 15, 15, 0.2)",
        depth2: "0 24px 24px -16px rgba(15, 15, 15, 0.2)",
        depth3: "0 40px 32px -24px rgba(15, 15, 15, 0.12)",
        depth4: "0 64px 64px -48px rgba(15, 15, 15, 0.1)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
