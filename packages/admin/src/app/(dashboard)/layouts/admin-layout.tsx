import type { Integration } from '@arkw/core';
import { ReactNode } from 'react';

import { IntegrationTab } from '@/app/components/integration-tab';
import { Sidebar } from '@/app/components/sidebar';

export default function AdminLayout({
  children,
  integrations,
}: {
  children: ReactNode;
  integrations: { name: string; integration: Integration }[];
}) {
  return (
    <main className="bg-arkw-bg-1 grid h-full w-full grid-cols-[15rem_minmax(0,_1fr)] overflow-clip">
      <div className="z-20 h-full">
        <div className="h-full">
          <Sidebar>
            {integrations.map(integration => {
              return <IntegrationTab key={integration.name} name={integration.name} />;
            })}
          </Sidebar>
        </div>
      </div>
      <div className="bg-arkw-bg-2 grid border-arkw-border-1 rounded-xs border-thin m-2 overflow-hidden border-solid">
        {children}
      </div>
    </main>
  );
}