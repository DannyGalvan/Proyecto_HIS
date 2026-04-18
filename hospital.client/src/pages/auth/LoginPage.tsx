import { Card } from "@heroui/react";

import { LoginForm, type LoginFormData } from "../../components/form/LoginForm";

import { useCallback } from "react";
import { LogoHIS } from "../../components/brand/LogoHIS";
import { useAuth } from "../../hooks/useAuth";
import ProtectedLogin from "../../routes/middlewares/ProtectedLogin";
import { authenticateUser } from "../../services/authService";

const initialForm: LoginFormData = {
  userName: "",
  password: "",
};

export function Component() {
  const { signIn } = useAuth();

  const petition = useCallback(
    async (form: LoginFormData) => {
      const response = await authenticateUser(form);

      if (!response.success) {
        return response;
      }

      const authentication = response.data;

      signIn({
        email: authentication.email,
        token: authentication.token,
        userName: authentication.userName,
        name: authentication.name,
        operations: authentication.operations,
        redirect: false,
        isLoggedIn: true,
        userId: authentication.userId,
        timezoneIanaId: authentication.timezoneIanaId || "America/Guatemala",
      });
      return response;
    },
    [signIn],
  );

  return (
    <ProtectedLogin>
      <section className="flex flex-col md:flex-row justify-center items-center w-screen h-screen login-bg relative overflow-hidden">
        {/* Decorative medical cross pattern */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect x='15' y='5' width='10' height='30' rx='2' fill='%230A4FA6'/%3E%3Crect x='5' y='15' width='30' height='10' rx='2' fill='%230A4FA6'/%3E%3C/svg%3E")`,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="flex items-center px-6 md:mx-auto w-full md:max-w-md lg:max-w-lg xl:max-w-xl">
          <Card className="w-full shadow-[0px_20px_20px_10px_#A0AEC0] login-card">
            <div className="p-10 flex flex-col w-full">
              <div className="flex flex-col items-center" style={{ marginBottom: "1.5rem" }}>
                <LogoHIS height="auto" width="220px" />
              </div>
              <LoginForm initialForm={initialForm} onSubmit={petition} />
            </div>
          </Card>
        </div>
      </section>
    </ProtectedLogin>
  );
}

Component.displayName = "LoginPage";
