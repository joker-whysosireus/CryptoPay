import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import axios from 'axios';
import History from './Pages/History/History.jsx';
import Help from './Pages/Help/Help.jsx';
import Wallet from './Pages/Wallet/Wallet.jsx';

const AUTH_FUNCTION_URL = 'https://cryptopayappbackend.netlify.app/.netlify/functions/auth';

const App = () => {
    const location = useLocation();
    const [isActive, setIsActive] = useState(false);
    const [userData, setUserData] = useState(null);
    const [telegramReady, setTelegramReady] = useState(false);

    // Initialize Telegram WebApp
    useEffect(() => {
        console.log("App.jsx: useEffect triggered");

        const isTelegramWebApp = () => {
            try {
                return window.Telegram && window.Telegram.WebApp;
            } catch (e) {
                return false;
            }
        };

        if (isTelegramWebApp()) {
            try {
                const webApp = window.Telegram.WebApp;
                console.log("Telegram WebApp detected, initializing...");
                
                // Отключение свайпов
                webApp.isVerticalSwipesEnabled = false;
                
                if (webApp.disableSwipeToClose) {
                    webApp.disableSwipeToClose();
                }
                
                // Установка цвета заголовка Telegram приложения
                if (webApp.setHeaderColor) {
                    webApp.setHeaderColor('#1C1C1D');
                }

                // EXPAND - развернуть приложение на весь экран
                if (webApp.expand) {
                    webApp.expand();
                    console.log("Telegram WebApp expanded to full screen");
                }
                
                console.log("Telegram WebApp initialized successfully");
                setTelegramReady(true);
                setIsActive(webApp.isActive);
                
            } catch (error) {
                console.error("Error initializing Telegram WebApp:", error);
                setTelegramReady(true);
            }
        } else {
            console.warn("Not in Telegram WebApp environment, running in standalone mode");
            setTelegramReady(true);
        }
    }, []);

    useEffect(() => {
        if (['/'].includes(location.pathname)) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }

        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, [location.pathname]);

    // User authentication
    useEffect(() => {
        if (telegramReady) {
            console.log("App.jsx: Starting authentication check");
            
            const getInitData = () => {
                try {
                    return window.Telegram?.WebApp?.initData || '';
                } catch (e) {
                    return '';
                }
            };

            const initData = getInitData();
            console.log("App.jsx: initData available:", !!initData);

            if (initData) {
                console.log("App.jsx: Sending authentication request");
                
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error("Authentication timeout")), 10000)
                );
                
                const authPromise = fetch(AUTH_FUNCTION_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ initData }),
                });

                Promise.race([authPromise, timeoutPromise])
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log("App.jsx: Authentication response received");
                        if (data.isValid) {
                            console.log("App.jsx: Authentication successful");
                            setUserData(data.userData);
                        } else {
                            console.error("App.jsx: Authentication failed");
                            setUserData(null);
                        }
                    })
                    .catch(error => {
                        console.error("App.jsx: Authentication error:", error);
                        setUserData(null);
                    });
            } else {
                console.warn("App.jsx: No initData available");
            }
        }
    }, [telegramReady]);

    const updateUserData = async () => {
        try {
            const initData = window.Telegram?.WebApp?.initData || '';
            const response = await axios.post(AUTH_FUNCTION_URL, { initData });
            setUserData(response.data.userData);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    return (
        <Routes location={location}>
            <Route path="/" element={
                <Wallet isActive={isActive} userData={userData} updateUserData={updateUserData} />
            } />
            <Route path="/history" element={
                <History isActive={isActive} userData={userData} updateUserData={updateUserData} />
            } />
            <Route path="/help" element={
                <Help isActive={isActive} userData={userData} updateUserData={updateUserData} />
            } />
        </Routes>
    );
};

const Main = () => {
    return (
        <Router>
            <App />
        </Router>
    );
};

export default Main;