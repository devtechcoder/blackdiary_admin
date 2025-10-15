import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuthContext } from "./AuthContext";
import apiPath from "../constants/apiPath";
import axios from "axios";

export const AppStateContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [pageHeading, setPageHeading] = useState("Heading");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(true);

  const { userProfile } = useAuthContext();
  const [cities, setCities] = useState([]);

  const [country, setCountry] = useState({
    country_id: undefined,
    currency: undefined,
    data: undefined,
  });

  useEffect(() => {
    setLoading(true);
    let lang = localStorage.getItem("languageSet");
    lang = lang ? lang : "en";

    if (lang == "ar") {
      import("../assets/styles/rtl.css");
    } else {
      import("../assets/styles/main.css");
    }

    setTimeout(() => setLoading(false), 200);
    setLanguage(lang);
  }, []);

  const getCities = async ({ id, onSuccess }) => {
    try {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      };
      const response = await axios.get(
        apiPath.baseURL + `/country-city/${id}`,
        {
          headers,
        }
      );
      const data = response.data.data;
      if (data) {
        let cData = [];
        if (userProfile.type == "Admin") {
          cData = data;
        } else {
          const city_ids = userProfile.city_ids.map(({ _id }) => _id);
          cData = data.filter((item) => city_ids.includes(item._id));
        }
        console.log(cData, "cData");
        setCities(cData);
        if (onSuccess) onSuccess(cData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!country.country_id) return;
    if (!userProfile) return;
    getCities({ id: country.country_id });
  }, [country.country_id, userProfile]);

  return (
    <AppStateContext.Provider
      value={{
        pageHeading,
        setPageHeading,
        setCountry,
        country,
        language,
        setLanguage,
        cities,
        getCities,
      }}
    >
      {loading ? null : children}
    </AppStateContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppStateContext);
};
