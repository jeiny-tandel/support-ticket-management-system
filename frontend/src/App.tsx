import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { ConfigProvider } from "antd";
import { store } from "./store";
import { solvixTheme } from "./theme";
import { AppRouter } from "./routes";
import "./App.css";

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ConfigProvider theme={solvixTheme}>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </ConfigProvider>
    </Provider>
  );
};

export default App;
