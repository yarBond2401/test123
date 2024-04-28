"use client";

import { firebaseConfig, app } from "@/app/firebase";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { useEffect } from "react";

interface Props {
  children: React.ReactNode;
}

const AppCheckProvider: React.FC<Props> = ({ children }) => {
  useEffect(() => {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(firebaseConfig.reCaptchaPublicKey),
      isTokenAutoRefreshEnabled: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app]);

  return <>{children}</>;
};

export default AppCheckProvider;
