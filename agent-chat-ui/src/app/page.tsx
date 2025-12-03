import { loadServerConfig } from "@/lib/config-server";

import ClientApp from "./ClientApp";

// Force dynamic rendering to always read the latest config file
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DemoPage() {
  const initialConfig = await loadServerConfig();

  return <ClientApp initialConfig={initialConfig} />;
}
