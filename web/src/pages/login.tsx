import { useState } from "react";
import { register, login, getCurrentUser, logout } from "../services/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    await register(email, password);
    alert("Usuário criado!");
  };

  const handleLogin = async () => {
    await login(email, password);
    alert("Logado!");
  };

  const verifyAuth = async () => {
    alert(
      getCurrentUser()
        ? "Usuário logado: " + getCurrentUser()?.uid
        : "Nenhum usuário logado",
    );
  };

  const logOut = async () => {
    await logout();
    alert("Deslogado!");
  };

  return (
    <div>
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input
        placeholder="Senha"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleRegister}>Cadastrar</button>
      <button onClick={handleLogin}>Login</button>
      <button onClick={verifyAuth}>Verificar login</button>
      <button onClick={logOut}>Logout</button>
    </div>
  );
}
