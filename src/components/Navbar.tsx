import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { FormInput as Forms, LogOut, Menu, X } from "lucide-react";

const Navbar = () => {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAdmin = true;

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-blue-500 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <Link to="/" className="flex items-center space-x-2 text-white">
            <Forms className="h-6 w-6" />
            <span className="font-bold text-xl tracking-wide">Finser</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-white hover:text-gray-200 transition duration-300"
            >
              Home
            </Link>
            {user && (
              <>
                <Link
                  to="/submit-form"
                  className="text-white hover:text-gray-200 transition duration-300"
                >
                  Submit Form
                </Link>
                {isAdmin &&  (
                  <Link
                    to="/admin"
                    className="text-white hover:text-gray-200 transition duration-300"
                  >
                    Admin Panel
                  </Link>
                )}
              </>
            )}
            {!user && (
              <>
                <Link
                  to="/login"
                  className="text-white hover:text-gray-200 transition duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-indigo-600 px-4 py-2 rounded-full hover:bg-gray-100 transition duration-300"
                >
                  Register
                </Link>
              </>
            )}
            {user && (
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-white hover:text-gray-200 transition duration-300"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Icon */}
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="bg-white md:hidden shadow-lg">
          <div className="flex flex-col items-start px-4 py-4 space-y-2">
            <Link
              to="/"
              className="text-gray-700 hover:bg-gray-100 px-4 py-2 w-full rounded-lg transition duration-300"
              onClick={toggleMenu}
            >
              Home
            </Link>
            {user && (
              <>
                <Link
                  to="/submit-form"
                  className="text-gray-700 hover:bg-gray-100 px-4 py-2 w-full rounded-lg transition duration-300"
                  onClick={toggleMenu}
                >
                  Submit Form
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="text-gray-700 hover:bg-gray-100 px-4 py-2 w-full rounded-lg transition duration-300"
                    onClick={toggleMenu}
                  >
                    Admin Panel
                  </Link>
                )}
              </>
            )}
            {!user && (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:bg-gray-100 px-4 py-2 w-full rounded-lg transition duration-300"
                  onClick={toggleMenu}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-300 w-full text-center"
                  onClick={toggleMenu}
                >
                  Register
                </Link>
              </>
            )}
            {user && (
              <button
                onClick={() => {
                  handleSignOut();
                  toggleMenu();
                }}
                className="text-gray-700 hover:bg-gray-100 px-4 py-2 w-full rounded-lg transition duration-300 flex items-center space-x-2"
              >
                <LogOut className="h-5 w-5 text-gray-700" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
