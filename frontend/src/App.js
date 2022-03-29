import { initializeApp } from "firebase/app";
import { useRef } from "react";

import { UserProvider } from "./contexts/userContext";
import AuthButton from "./components/AuthButton";
import { Route, Routes } from "react-router-dom";
import UploadForm from "./components/UploadForm";
import SearchModule from "./components/SearchModule";

function initializeFirebase() {
  const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
  };

  initializeApp(firebaseConfig);
}

function App() {
  const initialized = useRef(false);
  if (!initialized.current) {
    initializeFirebase();
    initialized.current = true;
  }

  return (
    <UserProvider>
      <Routes>
        <Route path="/" element={<AuthButton setLoading={() => {}} />} />
      </Routes>
      <UploadForm />
      <SearchModule setResults={(v) => console.log(v)} />
    </UserProvider>
  );
}

export default App;
