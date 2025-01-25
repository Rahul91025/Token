import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/authStore";
import { FileText, Check } from "lucide-react";
import jsPDF from "jspdf";

const FORM_TYPES = [
  {
    id: "credit_form",
    title: "Credit Form",
    fields: [
      { name: "creditAmount", label: "Credit Amount", type: "number" },
      { name: "creditReason", label: "Reason for Credit", type: "text" },
      { name: "accountNumber", label: "Account Number", type: "number" },
      { name: "transactionDate", label: "Transaction Date", type: "date" },
    ],
  },
  {
    id: "debit_form",
    title: "Debit Form",
    fields: [
      { name: "debitAmount", label: "Debit Amount", type: "number" },
      { name: "debitReason", label: "Reason for Debit", type: "text" },
      { name: "accountNumber", label: "Account Number", type: "number" },
      { name: "transactionDate", label: "Transaction Date", type: "date" },
    ],
  },
  {
    id: "loan_form",
    title: "Loan Form",
    fields: [
      { name: "loanAmount", label: "Loan Amount", type: "number" },
      { name: "loanPurpose", label: "Purpose of Loan", type: "text" },
      {
        name: "employmentStatus",
        label: "Employment Status",
        type: "select",
        options: ["Employed", "Self-Employed", "Unemployed", "Retired"],
      },
      { name: "monthlyIncome", label: "Monthly Income", type: "number" },
    ],
  },
];

const FormSubmission = () => {
  const [formType, setFormType] = useState(FORM_TYPES[0].id);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { data: tokenData, error: tokenError } = await supabase.rpc(
        "generate_unique_token"
      );
      if (tokenError) throw tokenError;

      const { data, error: submitError } = await supabase
        .from("forms")
        .insert([
          {
            user_id: user.id,
            form_type: formType,
            form_data: formData,
            token: tokenData,
          },
        ])
        .select()
        .single();

      if (submitError) throw submitError;

      setToken(data.token);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const generateInvoice = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Form Submission Invoice", 20, 20);
    doc.setFontSize(12);
    doc.text(`Form Type: ${formType}`, 20, 40);
    doc.text("Form Data:", 20, 50);

    Object.keys(formData).forEach((key, index) => {
      doc.text(`${key}: ${formData[key]}`, 20, 60 + index * 10);
    });

    doc.text(`Token: ${token}`, 20, 80 + Object.keys(formData).length * 10);

    doc.save("FormSubmissionInvoice.pdf");
  };

  const selectedForm = FORM_TYPES.find((f) => f.id === formType)!;

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto p-6">
        <div className="bg-gradient-to-br from-green-100 to-green-50 shadow-lg rounded-lg p-8 text-center">
          <div className="mb-4">
            <Check className="mx-auto text-green-600 w-12 h-12 animate-bounce" />
          </div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">
            Submission Successful!
          </h2>
          <p className="text-gray-600 mb-4">
            Your form was submitted successfully. Save your unique token:
          </p>
          <div className="bg-gray-200 p-4 rounded-lg font-mono text-lg text-gray-700">
            {token}
          </div>
          <div className="mt-6">
            <button
              onClick={generateInvoice}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition mb-4"
            >
              Download Invoice
            </button>
          </div>
          <div className="flex mt-6 gap-4">
            <button
              onClick={() => navigate("/")}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => {
                setFormData({});
                setSubmitted(false);
                setToken("");
              }}
              className="w-full bg-gray-100 text-indigo-600 py-2 px-4 rounded-lg border border-indigo-600 hover:bg-gray-50 transition"
            >
              Submit Another Form
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-lg p-8">
        <div className="flex items-center mb-8">
          <FileText className="w-8 h-8 text-indigo-500 mr-3" />
          <h2 className="text-3xl font-semibold text-gray-800">
            Submit Your Form
          </h2>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Form Type
            </label>
            <select
              value={formType}
              onChange={(e) => setFormType(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {FORM_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-6">
            {selectedForm.fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                </label>
                {field.type === "select" ? (
                  <select
                    className="w-full border-gray-300 rounded-md focus:ring-indigo-500"
                    value={formData[field.name] || ""}
                    onChange={(e) =>
                      handleInputChange(field.name, e.target.value)
                    }
                  >
                    <option value="">Select</option>
                    {field.options?.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    className="block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={formData[field.name] || ""}
                    onChange={(e) =>
                      handleInputChange(field.name, e.target.value)
                    }
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 flex gap-4">
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition"
            >
              Submit Form
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-full bg-gray-100 text-indigo-600 py-2 px-4 rounded-lg border border-indigo-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormSubmission;
