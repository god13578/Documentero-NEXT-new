module.exports = {
  root: true,
  extends: ["next/core-web-vitals"],
  overrides: [
    {
      files: ["src/lib/**/*.{ts,tsx,js,jsx}"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: ["@/components/**", "**/components/**", "@/app/**", "**/app/**", "@/app", "**/app"],
                message: "UI imports are disallowed in src/lib to keep it UI-independent.",
              },
            ],
          },
        ],
      },
    },
  ],
};
