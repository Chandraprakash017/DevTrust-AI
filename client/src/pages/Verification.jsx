import { useState, useEffect } from "react";
import api from "../utils/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function Verification() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [doc, setDoc] = useState("");
  const [myDocs, setMyDocs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDocs = () => {
    // We'll query notifications to see if there's a verification status
    // For now we track submissions in state after upload
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleUpload = async () => {
    if (!doc.trim()) return toast.error("Please enter a document URL");
    setLoading(true);
    try {
      await api.post("/api/verify/upload", {
        user_id: user.id,
        document_url: doc,
      });
      toast.success("📄 Document submitted for review!");
      setMyDocs((prev) => [...prev, { document_url: doc, status: "pending" }]);
      setDoc("");
    } catch {
      toast.error("Upload failed ❌");
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    pending:  "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100  text-green-700",
    rejected: "bg-red-100    text-red-700",
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1">
        <Navbar title="📄 Verification" />

        <div className="p-6 max-w-2xl mx-auto space-y-6">

          {/* Info Banner */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-6 rounded-2xl shadow"
          >
            <h1 className="text-xl font-bold">🔍 Identity Verification</h1>
            <p className="text-sm mt-1 opacity-90">
              Submit a public link to your document (Google Drive, Dropbox, etc.) for admin review.
            </p>
          </motion.div>

          {/* Upload Form */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow"
          >
            <h2 className="font-bold text-lg mb-4">Submit Document</h2>

            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Document URL (Google Drive / Dropbox / etc.)
            </label>
            <input
              type="url"
              value={doc}
              placeholder="https://drive.google.com/..."
              onChange={(e) => setDoc(e.target.value)}
              className="w-full p-3 mb-4 rounded-xl border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
            />

            <button
              onClick={handleUpload}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white p-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Submitting..." : "📤 Submit for Review"}
            </button>
          </motion.div>

          {/* Submitted Docs */}
          {myDocs.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow"
            >
              <h2 className="font-bold text-lg mb-4">📋 Your Submissions</h2>
              <div className="space-y-3">
                {myDocs.map((d, i) => (
                  <div key={i} className="flex items-center justify-between border dark:border-gray-700 rounded-xl p-3">
                    <a
                      href={d.document_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-500 hover:underline truncate max-w-xs"
                    >
                      {d.document_url}
                    </a>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${statusColors[d.status] || "bg-gray-100 text-gray-600"}`}>
                      {d.status}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Tips */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-700 rounded-2xl p-5">
            <h3 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">💡 Tips</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 list-disc list-inside">
              <li>Use a public or view-accessible link</li>
              <li>Accepted: Aadhar, PAN, Passport, Driver's License</li>
              <li>Approval typically takes 24–48 hours</li>
            </ul>
          </motion.div>

        </div>
      </div>
    </div>
  );
}