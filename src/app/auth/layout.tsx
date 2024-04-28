"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
  return <main className="grid grid-cols-5 h-screen bg-[var(--secondary-color)]">
    {children}</main>;
};
export default Layout;
