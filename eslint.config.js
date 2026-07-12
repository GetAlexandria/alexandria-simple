import tseslint from "typescript-eslint";

export default tseslint.config(
  // Vendored quarantine source (quarantine/README.md) is exempt from repo lint.
  { ignores: ["quarantine/**"] },
  ...tseslint.configs.recommended,
);
