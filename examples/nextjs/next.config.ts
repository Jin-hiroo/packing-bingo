import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // このフォルダをプロジェクトの一番上として扱う（親フォルダの package-lock.json と混同しないように）
  turbopack: { root: __dirname },
};

export default nextConfig;
