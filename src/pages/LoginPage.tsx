import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API_ENDPOINTS from "../utils/apiConfig";

const LoginPage = () => {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const navigate = useNavigate();
    const { login } = useAuth();

    function HandleLogin(): void {
        // Hit API login endpoint

        // Get username and password from form
        const username = (document.getElementById("username") as HTMLInputElement).value;
        const password = (document.getElementById("password") as HTMLInputElement).value;

        fetch(API_ENDPOINTS.LOGIN, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: username, password: password })
        })
            .then(response => {
                return response.json();
            })
            .then(data => {
                if (data.token) {
                    login(data.token);
                    navigate('/');
                } else {
                    setErrorMessage("Login failed. Please try again.");
                }
            })
            .catch(() => {
                setErrorMessage("Login failed. Please try again.");
            });
    }

    return (

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-center min-h-[60vh]">
            <form className="flex flex-col gap-5" action="#" method="POST" onSubmit={(e) => e.preventDefault()}>
                <div>
                    <label htmlFor="username">Username:</label>
                    <input className="shadow border rounded w-full py-2 px-3 text-text-muted focus:text-text leading-tight focus:shadow-outline" type="text" id="username" name="username" required />
                </div>

                <div>
                    <label htmlFor="password">Password:</label>
                    <input className="shadow border rounded w-full py-2 px-3 text-text-muted focus:text-text leading-tight focus:shadow-outline" type="password" id="password" name="password" required />
                </div>

                <div>
                    <button className="px-4 py-2 rounded-lg font-medium transition-colors bg-primary-600 hover:bg-primary-300 text-white" type="submit" onClick={HandleLogin}>Login</button>
                </div>

                <div id="error-message" className="text-red-600 font-medium">
                    {errorMessage}
                </div>
            </form>
        </div>

    )
}

export default LoginPage
