import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config, { webpack }) {
    // Render runs Next on Node. Vinext on Sites uses the D1 implementation.
    config.plugins.push(new webpack.NormalModuleReplacementPlugin(
      /^\.\.\/\.\.\/\.\.\/db\/sites-store$/,
      path.resolve("db/render-store.ts"),
    ));
    return config;
  },
};

export default nextConfig;
