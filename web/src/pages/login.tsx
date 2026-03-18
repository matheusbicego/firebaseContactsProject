import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { register, login } from "../services/auth";
import { useAuth } from "../hooks/useAuth";
import {
  Button,
  Card,
  Paper,
  TextField,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  OutlinedInput,
  FormHelperText,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [type, setType] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const handleRegister = async () => {
    if (!verifySamePassword(password, confirmPassword)) {
      alert("As senhas não coincidem");
      return;
    }
    try {
      await register(email, password);
      alert("Usuário criado!");
      navigate("/");
    } catch (err: unknown) {
      console.error(err);
      alert( "Erro ao cadastrar");
    }
  };

  const handleLogin = async () => {
    try {
      await login(email, password);
      navigate("/");
    } catch (err: unknown) {
      console.error(err);
      alert("Credenciais Inválidas");
    }
  };

  const verifySamePassword = (pass: string, confirmPass:string) => {
    if (pass !== confirmPass) {
      setErrorMessage("As senhas não coincidem");
      return false;
    }
    setErrorMessage("");
    return true;
  };

  return (
    <Card className="flex items-center justify-center min-h-screen bg-gray-100">
      <Paper className="p-8 w-full max-w-sm flex flex-col gap-4">
        <h1 className="text-2xl font-semibold text-center">
          {type === "login" ? "Login" : "Registrar"}
        </h1>

        <TextField
          label="Email"
          variant="outlined"
          size="small"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />

        <FormControl variant="outlined" size="small" fullWidth>
          <InputLabel htmlFor="password">Senha</InputLabel>
          <OutlinedInput
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (type === "register") {
                verifySamePassword(e.target.value, confirmPassword);
              }
            }}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setShowPassword((s) => !s)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label="Senha"
          />
        </FormControl>

        {type === "register" && (
          <FormControl
            variant="outlined"
            size="small"
            fullWidth
            error={!!errorMessage}
          >
            <InputLabel htmlFor="confirm-password">Confirmar Senha</InputLabel>
            <OutlinedInput
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                verifySamePassword(password, e.target.value);
                setConfirmPassword(e.target.value);
              }}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label={
                      showConfirmPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Confirmar Senha"
            />
            {errorMessage && <FormHelperText>{errorMessage}</FormHelperText>}
          </FormControl>
        )}

        <Button
          variant="contained"
          onClick={type === "login" ? handleLogin : handleRegister}
        >
          {type === "login" ? "Entrar" : "Registrar"}
        </Button>

        <Button
          variant="text"
          onClick={() => setType(type === "login" ? "register" : "login")}
        >
          {type === "login" ? "Criar conta" : "Já possui conta?"}
        </Button>
      </Paper>
    </Card>
  );
}
