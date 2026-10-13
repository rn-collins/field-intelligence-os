import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";
import jsxA11y from "eslint-plugin-jsx-a11y";

const config = [
  {
    ignores: [
      ".next/**",
      "out/**",
      "node_modules/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "next-env.d.ts",
    ],
  },

  ...nextCoreWebVitals,
  ...nextTypescript,

  /**
   * `eslint-config-next` already registers the jsx-a11y plugin but enables only
   * a subset of its rules. Spreading the rules alone — rather than the whole
   * flat config — turns on full `recommended` coverage without redefining the
   * plugin, which ESLint rejects.
   */
  { rules: jsxA11y.flatConfigs.recommended.rules },

  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-console": ["error", { allow: ["warn", "error"] }],
      eqeqeq: ["error", "always"],
    },
  },

  /**
   * Enforces the service-role boundary from `AGENTS.md`:
   * "Never expose the Supabase service-role key to browser code."
   *
   * `lib/supabase/server.ts` is the only module permitted to read privileged
   * credentials. Presentation code may not import it, even transitively through
   * a client component. `server-only` catches this at build time too; this rule
   * catches it at lint time with a message that explains the rule.
   */
  {
    files: ["components/**/*.{ts,tsx}", "app/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/lib/supabase/server", "@/lib/supabase/server"],
              message:
                "Privileged Supabase access is server-only. Load data in a server component or route handler and pass plain data down as props.",
            },
          ],
        },
      ],
    },
  },

  /** Test files legitimately need `any` for partial mocks and may log. */
  {
    files: ["tests/**/*.{ts,tsx}", "**/*.test.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
    },
  },

  prettier,
];

export default config;
