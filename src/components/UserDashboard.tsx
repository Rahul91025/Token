import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/authStore";
import { Form } from "../types";
import { FileText, Plus, X } from "lucide-react";

const questionsDataset = [
  {
    id: 1,
    question: "What is your last four digits of your bank account number?",
    correctAnswer: "1234",
  },
  {
    id: 2,
    question: "What is the amount of your most recent loan repayment?",
    correctAnswer: "5000",
  },
  {
    id: 3,
    question: "What is the credit limit on your credit card?",
    correctAnswer: "20000",
  },
  {
    id: 4,
    question: "What is the current balance in your savings account?",
    correctAnswer: "10000",
  },
  {
    id: 5,
    question: "What was the date of your last mortgage payment?",
    correctAnswer: "2024-01-15",
  },
  {
    id: 6,
    question: "What is the routing number of your bank account?",
    correctAnswer: "987654321",
  },
  {
    id: 7,
    question: "What is your PIN for your online banking account?",
    correctAnswer: "4321",
  },
  {
    id: 8,
    question: "What is the last transaction ID from your bank statement?",
    correctAnswer: "TXN12345",
  },
  {
    id: 9,
    question: "What is the balance of your retirement fund?",
    correctAnswer: "150000",
  },
  {
    id: 10,
    question: "What was the amount of your last wire transfer?",
    correctAnswer: "2500",
  },
];

const UserDashboard = () => {
  const [forms, setForms] = useState<Form[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchForms = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("forms")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setForms(data);
      }
    };

    fetchForms();
  }, [user]);

  const handlePendingClick = (form) => {
    const shuffledQuestions = questionsDataset
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);
    setSelectedQuestions(shuffledQuestions);
    setUserAnswers([]);
    setShowQuiz(true);
    setSelectedForm(form);
  };

  const handleQuizSubmit = () => {
    const allCorrect = selectedQuestions.every(
      (question, index) => question.correctAnswer === userAnswers[index]
    );

    const updatedForms = forms.map((f) => {
      if (f.id === selectedForm.id) {
        return {
          ...f,
          status: allCorrect ? "approved" : "pending",
        };
      }
      return f;
    });

    setForms(updatedForms);
    setShowQuiz(false);
    setSelectedForm(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900">My Forms</h1>
        <Link
          to="/submit-form"
          className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-all"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Form
        </Link>
      </div>

      {/* Forms Section */}
      {forms.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg shadow-md">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No Forms Submitted Yet
          </h3>
          <p className="text-gray-500 mb-4">
            You haven’t submitted any forms yet. Create your first form now!
          </p>
          <Link
            to="/submit-form"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-all"
          >
            Create New Form
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Form Type
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Token
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Submitted
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {forms.map((form) => (
                <tr key={form.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="capitalize font-medium">
                      {form.form_type.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <code className="bg-gray-100 px-2 py-1 rounded-lg">
                      {form.token}
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      onClick={() =>
                        form.status === "pending" && handlePendingClick(form)
                      }
                      className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full cursor-pointer ${
                        {
                          reviewed: "bg-green-100 text-green-800",
                          pending: "bg-yellow-100 text-yellow-800",
                        }[form.status] || "bg-red-100 text-red-800"
                      }`}
                    >
                      {form.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(form.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handlePendingClick(form)}
                      className="text-blue-600 hover:underline"
                    >
                      Check Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Quiz Pop-Up */}
      {showQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
            <button
              onClick={() => setShowQuiz(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-bold mb-4">Answer the Questions</h2>
            {selectedQuestions.map((question, index) => (
              <div key={question.id} className="mb-4">
                <p className="text-sm font-medium">{question.question}</p>
                <input
                  type="text"
                  className="w-full mt-2 p-2 border rounded-lg"
                  value={userAnswers[index] || ""}
                  onChange={(e) => {
                    const newAnswers = [...userAnswers];
                    newAnswers[index] = e.target.value;
                    setUserAnswers(newAnswers);
                  }}
                />
              </div>
            ))}
            <div className="flex justify-end">
              <button
                onClick={handleQuizSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
