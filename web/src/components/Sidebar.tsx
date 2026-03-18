import {
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import Box from "@mui/material/Box";
import ContactsIcon from "@mui/icons-material/Contacts";
import LogoutIcon from "@mui/icons-material/Logout";
import { NavLink, useNavigate } from "react-router-dom";
import type { JSX } from "@emotion/react/jsx-runtime";
import { Bookmark, Message } from "@mui/icons-material";
import { logout } from "../services/auth";

type NavItem = { text: string; to: string; icon: JSX.Element };

const navItems: NavItem[] = [
  { text: "Conexões", to: "/conexoes", icon: <Bookmark /> },
  { text: "Contatos", to: "/", icon: <ContactsIcon /> },
  { text: "Mensagens", to: "/mensagens", icon: <Message /> },
];

export const Sidebar: React.FC<{ title?: string; className?: string }> = ({
  title = "Minha App",
  className = "",
}) => {
  const navigate = useNavigate();

  const logOut = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Erro ao deslogar:", err);
      alert("Falha ao deslogar");
    }
  };

  return (
    <aside className={`w-64 h-screen bg-white shadow ${className}`}>
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{title}</span>
        </div>
        <IconButton onClick={logOut} size="small" aria-label="menu">
          <LogoutIcon />
        </IconButton>
      </div>

      <Divider />

      <Box component="nav" className="p-2">
        <List>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block rounded-md my-1 ${isActive ? "bg-gray-100" : ""}`
              }
            >
              <ListItemButton>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </NavLink>
          ))}
        </List>
      </Box>
    </aside>
  );
};

export default Sidebar;
