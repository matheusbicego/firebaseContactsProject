import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute";
import Login from "../pages/Login";
import Contacts from "../pages/Contacts";
import Layout from "../components/Layout";
import Connections from "../pages/Connections";
import Messages from "../pages/Messages";

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<Layout />}>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Contacts />
              </PrivateRoute>
            }
          />
          <Route
            path="/conexoes"
            element={
              <PrivateRoute>
                <Connections />
              </PrivateRoute>
            }
          />
          <Route
            path="/mensagens"
            element={
              <PrivateRoute>
                <Messages />
              </PrivateRoute>
            }
          />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};
