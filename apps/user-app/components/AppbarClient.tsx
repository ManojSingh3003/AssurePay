"use client";

import { Appbar, PageLoader } from "@repo/ui"; 
import { signOut } from "next-auth/react";
import { useState } from "react";

export const AppbarClient = ({ user }: { user: any }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  return (
    <>
      <PageLoader isLoading={isLoggingOut} message="LOGGING OUT" />
      <Appbar
        user={user}
        onSignOut={async () => {
          setIsLoggingOut(true);
          await signOut({ callbackUrl: "/signin" });
        }}
      />
    </>
  );
};