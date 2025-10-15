import React, { Suspense, useContext } from "react";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { AppContextProvider } from "./context/AppContext";
import { AuthContext, AuthProvider } from "./context/AuthContext";

import { I18nextProvider } from "react-i18next";
import i18n from "./config/i18n";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./assets/styles/custom.css";
import "./assets/styles/main.css";
import "./assets/styles/responsive.css";
import "react-phone-input-2/lib/style.css";
import Loader from "./components/Loader";
import PrivateRoute from "./components/PrivateRoute";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Auth/Home";
import SignIn from "./pages/Auth/SignIn";
import Error from "./pages/Error";

import { Category, CmsManagement, Customer, SubCategory, Diary, AddEditDiary, Occasion } from "./pages";

window.Buffer = window.Buffer || require("buffer").Buffer;
function App() {
  return (
    <AuthProvider>
      <AppContextProvider>
        <I18nextProvider i18n={i18n}>
          <Suspense fallback={<Loader />}>
            <BrowserRouter>
              <ScrollToTop />
              <ToastContainer closeOnClick={false} />
              <AppRoutes />
            </BrowserRouter>
          </Suspense>
        </I18nextProvider>
      </AppContextProvider>
    </AuthProvider>
  );
}

const AppRoutes = () => {
  const { isLoggedIn } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/login" element={<SignIn />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        {/* Auth Routes */}
        <Route exact path="/" element={<Home />} />
        <Route exact path="/dashboard" element={<Home />} />
        <Route exact path="/customer" element={<Customer />} />
        {/* category */}
        <Route exact path="/category" element={<Category />} />
        <Route exact path="/occasion" element={<Occasion />} />
        <Route exact path="/sub-category" element={<SubCategory />} />
        <Route exact path="/diary" element={<Diary />} />
        <Route exact path="/diary-add-edit" element={<AddEditDiary />} />
        <Route exact path="/diary-add-edit/:id" element={<AddEditDiary />} />

        {/* cms manager */}
        <Route exact path="/cms" element={<CmsManagement />} />
      </Route>

      <Route path="*" element={<Error />} />
    </Routes>
  );
};

const Layout = () => {
  return (
    <>
      <Outlet />
    </>
  );
};

export default App;
