import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Ensure Turbopack uses this app directory as the workspace root.
    // This avoids Next.js accidentally selecting a parent folder due to another lockfile,
    // which can break `.env.local` loading and other root-relative behavior.
    // Use an explicit absolute path because `__dirname` can be unreliable depending on how the config is loaded.
    root: "C:\\Users\\PAGC\\Desktop\\ICX-DV\\globe-icx-db",
  },
};

export default nextConfig;
