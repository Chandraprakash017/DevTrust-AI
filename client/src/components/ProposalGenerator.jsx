import { useState } from "react";
import api from "../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Copy, Check, Wand2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ProposalGenerator({ taskDescription, userProfile, onApply }) {
  const [proposal, setProposal] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateAIProposal = async () => {
    setIsGenerating(true);
    try {
      const res = await api.post("/api/ai/generate-proposal", {
        userProfile,
        taskDescription
      });
      setProposal(res.data.proposal);
      toast.success("AI Proposal Generated! 🪄");
    } catch (err) {
      toast.error("Failed to generate proposal");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(proposal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-purple-400" />
          <h3 className="text-xl font-bold text-white">Smart Proposal Generator</h3>
        </div>
        <button
          onClick={generateAIProposal}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50"
        >
          {isGenerating ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate with AI
            </>
          )}
        </button>
      </div>

      <div className="relative group">
        <textarea
          value={proposal}
          onChange={(e) => setProposal(e.target.value)}
          placeholder="Your professional bid will appear here..."
          className="w-full h-64 bg-black/40 border border-white/10 rounded-xl p-4 text-gray-200 outline-none focus:border-purple-500/50 transition-all resize-none placeholder:text-gray-600"
        />
        
        <AnimatePresence>
          {proposal && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute top-4 right-4 flex gap-2"
            >
              <button
                onClick={copyToClipboard}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-gray-400 hover:text-white transition-all"
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          AI-generated proposals are 40% more likely to get noticed.
        </p>
        <button
          onClick={() => onApply(proposal)}
          disabled={!proposal}
          className="flex items-center gap-2 bg-white text-black hover:bg-gray-200 px-6 py-2 rounded-xl font-bold transition-all disabled:opacity-30"
        >
          <span>Submit Proposal</span>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
