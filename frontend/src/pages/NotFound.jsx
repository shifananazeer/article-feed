import { Link } from "react-router-dom";

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-6">
            <h1 className="text-6xl font-bold text-red-600">404</h1>
            <h2 className="text-2xl font-semibold text-gray-800 mt-4">Page Not Found</h2>
            <p className="text-gray-600 mt-2">
                Oops! The page you’re looking for doesn’t exist.
            </p>
            <Link
                to="/"
                className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition"
            >
                Go to Home
            </Link>
        </div>
    );
};

export default NotFound;
