import js from "@eslint/js";
import ts from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import boundaries from "eslint-plugin-boundaries";

export default ts.config(
  js.configs.recommended,
  ...ts.configs.strictTypeChecked,
  ...ts.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["**/*.{js,jsx,mjs,ts,tsx}"],
    plugins: {
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
      boundaries,
    },
    settings: {
      react: {
        version: "detect",
      },
      "boundaries/elements": [
        { type: "app", pattern: "src/app/*" },
        { type: "features", pattern: "src/features/*" },
        { type: "components", pattern: "src/components/*" },
        { type: "services", pattern: "src/services/*" },
        { type: "lib", pattern: "src/lib/*" },
        { type: "providers", pattern: "src/providers/*" },
        { type: "stores", pattern: "src/stores/*" },
        { type: "constants", pattern: "src/constants/*" },
        { type: "types", pattern: "src/types/*" },
      ],
      "boundaries/include": ["src/**/*"],
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,

      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/no-floating-promises": ["error", { ignoreVoid: true }],
      "@typescript-eslint/no-confusing-void-expression": ["error", { ignoreArrowShorthand: false }],
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/exhaustive-deps": "error",

      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "axios",
              message: "Use the generated openapi-fetch client (src/lib/api/client.ts) instead.",
            },
          ],
        },
      ],

      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            {
              from: "app",
              allow: ["features", "components", "lib", "providers", "constants", "types"],
            },
            {
              from: "features",
              allow: ["components", "services", "lib", "constants", "types", "stores"],
            },
            { from: "components", allow: ["lib", "types", "components"] },
            { from: "services", allow: ["lib", "types"] },
            { from: "providers", allow: ["lib", "types", "components", "features"] },
            { from: "stores", allow: ["lib", "types"] },
            { from: "constants", allow: ["lib", "types"] },
            { from: "lib", allow: ["lib", "types"] },
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.test.{ts,tsx}", "**/src/tests/**/*.{ts,tsx}", "e2e/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
    },
  },
  {
    files: [
      "**/*.config.{js,mjs,ts}",
      "postcss.config.mjs",
      "next.config.mjs",
      "eslint.config.mjs",
      "prettier.config.mjs",
    ],
    rules: {
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-confusing-void-expression": "off",
    },
  },
  {
    files: ["src/types/api.generated.ts"],
    rules: {
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
  {
    ignores: [
      ".next",
      "node_modules",
      "out",
      "dist",
      "coverage",
      "playwright-report",
      "test-results",
      "src/types/api.generated.ts",
    ],
  }
);
