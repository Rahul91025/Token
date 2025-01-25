import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { Form } from "../types";
import {
  Search,
  FileText,
  User,
  Calendar,
  CheckCircle,
  Clock,
} from "lucide-react";

const AdminDashboard = () => {
  const [token, setToken] = useState("");
  const [form, setForm] = useState<Form | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState<{ email: string } | null>(
    null
  );

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setForm(null);
    setUserDetails(null);

    try {
      const { data: formData, error: formError } = await supabase
        .from("forms")
        .select("*")
        .eq("token", token)
        .single();

      if (formError) throw formError;

      setForm(formData);

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("email")
        .eq("id", formData.user_id)
        .single();

      if (userError) {
        console.error("Error fetching user details:", userError);
      } else {
        setUserDetails(userData);
      }
    } catch (err: any) {
      setError("Form not found");
      setForm(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: "pending" | "reviewed") => {
    if (!form) return;

    try {
      const { error: updateError } = await supabase
        .from("forms")
        .update({ status: newStatus })
        .eq("id", form.id);

      if (updateError) throw updateError;
      setForm({ ...form, status: newStatus });
    } catch (err: any) {
      setError("Failed to update status");
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Admin Dashboard
        </h1>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label
                htmlFor="token"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Search Form by Token
              </label>
              <input
                type="text"
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition duration-200 px-4 py-2"
                placeholder="Enter form token"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md shadow-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition duration-200 flex items-center gap-2"
            >
              <Search className="h-5 w-5" />
              Search
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md mb-4 text-center">
            {error}
          </div>
        )}

        {form && (
          <div className="bg-gray-50 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Form Details
                </h2>
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Submitted {formatDate(form.created_at)}
                  </span>
                  {userDetails && (
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {userDetails.email}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusUpdate("pending")}
                  className={`flex items-center px-4 py-2 rounded-md font-semibold transition duration-200 shadow-md ${
                    form.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-600 hover:bg-yellow-50 hover:text-yellow-700"
                  }`}
                >
                  <Clock className="h-4 w-4 mr-1" />
                  Pending
                </button>
                <button
                  onClick={() => handleStatusUpdate("reviewed")}
                  className={`flex items-center px-4 py-2 rounded-md font-semibold transition duration-200 shadow-md ${
                    form.status === "reviewed"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-700"
                  }`}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Reviewed
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-white p-4 rounded-md shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Form Type
                </h3>
                <p className="text-gray-900 capitalize flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-indigo-500" />
                  {form.form_type.replace("_", " ")}
                </p>
              </div>
              <div className="bg-white p-4 rounded-md shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Token
                </h3>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                  {form.token}
                </code>
              </div>
            </div>

            <div className="bg-white p-6 rounded-md shadow-md">
              <h3 className="text-sm font-medium text-gray-500 mb-4">
                Form Data
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(form.form_data).map(([key, value]) => (
                  <div key={key} className="border-b border-gray-100 pb-3">
                    <div className="text-sm font-medium text-gray-500 mb-1 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </div>
                    <div className="text-gray-900">
                      {value?.toString() || "-"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
