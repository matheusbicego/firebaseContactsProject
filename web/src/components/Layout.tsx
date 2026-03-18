import React, { useEffect, useMemo } from "react";
import Sidebar from "./Sidebar";
import { Outlet, useLocation } from "react-router-dom";

const titleMap: Record<string, string> = {
  "/": "Contatos",
  "/conexoes": "Conexões",
  "/mensagens": "Mensagens",
  "/login": "Login",
};

const Layout: React.FC = () => {
  const { pathname } = useLocation();
  const title = useMemo(() => titleMap[pathname] || "Minha App", [pathname]);

  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div className="flex min-h-screen">
      <Sidebar title={title} />
      <div className="flex-1 flex flex-col">
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
