import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <Image
            src="/logo/light.svg"
            alt="Prehydrate"
            width={120}
            height={28}
            className="block dark:hidden"
          />
          <Image
            src="/logo/dark.svg"
            alt="Prehydrate"
            width={120}
            height={28}
            className="hidden dark:block"
          />
        </>
      ),
    },
    links: [
      {
        text: 'Home',
        url: '/',
      },
      {
        text: 'Docs',
        url: '/docs',
      },
    ],
    githubUrl: 'https://github.com/gruckion/prehydrate',
  };
}
