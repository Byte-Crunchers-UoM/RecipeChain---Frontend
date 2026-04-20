'use client';

import React from 'react';
import { FOOTER_COLUMNS, FOOTER_SOCIAL_LINKS, FOOTER_COPYRIGHT } from '@/lib/constants/home.constants';

interface FooterColumnProps {
  title: string;
  links: Array<{
    label: string;
    href: string;
  }>;
}

function FooterColumnComponent({ title, links }: FooterColumnProps): React.ReactElement {
  return (
    <div>
      <h4 className="font-bold text-white mb-4">{title}</h4>
      <ul className="space-y-2 text-slate-400 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <a 
              href={link.href} 
              className="hover:text-white transition"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FooterSection(): React.ReactElement {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-12">
      <div className="max-w-7xl mx-auto px-8">
        {/* Footer Grid */}
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {FOOTER_COLUMNS.map((column) => (
            <FooterColumnComponent 
              key={column.title}
              title={column.title}
              links={column.links}
            />
          ))}
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm">
          <p>{FOOTER_COPYRIGHT}</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            {FOOTER_SOCIAL_LINKS.map((link) => (
              <a 
                key={link.href}
                href={link.href} 
                className="hover:text-white transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
