import React, { useState } from "react";
import { INTERVIEW_QUESTIONS, analyzeResponse, FeedbackResult } from "../lib/interviewData";
import { usePlaybook } from "../lib/resumeState";
import { ShieldAlert, BookOpen, Clock, Play, MessageSquare, AlertTriangle, ArrowRight, HelpCircle } from "lucide-react";

export default function InterviewSimulator() {
  const { state, dispatch } = usePlaybook();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userText, setUserText] = useState("");
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = INTERVIEW_QUESTIONS[currentIdx];

  const handleEvaluate = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const result = analyzeResponse(userText);
      setFeedback(result);
      dispatch({
        type: "SET_INTERVIEW_ANSWER",
        payload: { questionId: currentQuestion.id, answer: userText }
      });
      setIsSubmitting(false);
    }, 450);
  };

  const handleNext = () => {
    setFeedback(null);
    setUserText("");
    setCurrentIdx((prev) => (prev + 1) % INTERVIEW_QUESTIONS.length);
  };

  return (
    <div className="bg-white border-2 border-slate-900 p-5 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-5">
      {/* Title */}
      <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-center">
        <div>
          <h3 className="font-display font-black text-xl uppercase text-slate-950 flex items-center gap-1.5">
            <MessageSquare className="w-5 h-5 text-indigo-600" /> Behavioral CNA Interview Simulator
          </h3>
          <p className="font-sans text-slate-600 text-xs font-medium mt-1">
            Test yourself with 5 core CNA behavioral scenarios. Submit structured responses to trigger rule-based, ATS-approved feedback.
          </p>
        </div>
        <span className="font-mono text-[9px] bg-indigo-100 text-indigo-900 border border-indigo-250 font-black px-2 py-0.5 uppercase select-none rounded-none shrink-0 self-start sm:self-center">
          Topic: {currentQuestion.topic}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left Col Question & Input */}
        <div className="md:col-span-7 space-y-4">
          <div className="bg-slate-50 border border-slate-205 p-4 space-y-2">
            <span className="block font-mono text-[8px] uppercase tracking-wider text-slate-400 font-extrabold">
              QUESTION INDEX: {currentIdx + 1} OF {INTERVIEW_QUESTIONS.length}
            </span>
            <p className="font-sans font-extrabold text-slate-900 text-[13px] leading-relaxed">
              "{currentQuestion.question}"
            </p>
            <div className="text-[10px] text-[#b45309] font-sans font-medium flex items-center gap-1">
              <HelpCircle className="w-4.5 h-4.5 shrink-0" />
              <span>
                <strong>Evaluation Tip:</strong> {currentQuestion.rubricHint}
              </span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-1">
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-500">
                Your Answer (STAR structured):
              </label>
              <span className="text-[9px] font-mono text-slate-400 font-bold">
                {userText.length} Characters
              </span>
            </div>
            <textarea
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              rows={4}
              placeholder="e.g. [Situation] In my last SNF ward shifts elopement alerts popped... [Action] I guided the confused resident using soft redirection... [Result] Checked sensors, ensuring complete resident safety..."
              className="w-full bg-slate-50 border border-slate-310 p-3 font-sans text-xs outline-none focus:bg-white focus:ring-1 focus:ring-slate-900 leading-relaxed"
            />
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={handleNext}
              className="font-mono text-[10px] font-bold uppercase hover:underline text-slate-500 hover:text-slate-950 px-2 py-1 focus:outline-none"
            >
              Skip / Next Scenario →
            </button>
            <button
              onClick={handleEvaluate}
              disabled={isSubmitting || !userText.trim()}
              className="font-mono text-xs font-black uppercase bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 border border-slate-950 disabled:opacity-50 disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all cursor-pointer"
            >
              {isSubmitting ? "Evaluating..." : "🤖 Get Rubric feedback"}
            </button>
          </div>
        </div>

        {/* Right Col Simulator feedback outcome */}
        <div className="md:col-span-5 bg-slate-50 border border-slate-205 p-4 rounded-none min-h-[250px] flex flex-col justify-between">
          {feedback ? (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                <span className="font-mono text-[9px] uppercase font-black text-slate-400">
                  Evaluation Report
                </span>
                <span
                  className={`font-mono text-[11px] font-black uppercase px-2 py-0.5 border ${
                    feedback.score >= 70
                      ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                      : feedback.score >= 50
                      ? "bg-amber-50 text-amber-900 border-amber-300"
                      : "bg-rose-50 text-rose-900 border-rose-300"
                  }`}
                >
                  Score: {feedback.score}/100
                </span>
              </div>

              {/* Rubric metrics met indicators */}
              <div className="flex flex-wrap gap-1.5 font-mono text-[8px] font-bold uppercase transition-all select-none">
                <span
                  className={`px-1.5 py-0.5 border ${
                    feedback.hasSTAR
                      ? "bg-emerald-50 text-emerald-800 border-emerald-305"
                      : "bg-slate-200 text-slate-400 border-transparent"
                  }`}
                >
                  {feedback.hasSTAR ? "✓ STAR Structure" : "✗ STAR Struct"}
                </span>
                <span
                  className={`px-1.5 py-0.5 border ${
                    feedback.hasMetrics
                      ? "bg-emerald-50 text-emerald-800 border-emerald-305"
                      : "bg-slate-200 text-slate-400 border-transparent"
                  }`}
                >
                  {feedback.hasMetrics ? "✓ Metric Metrics" : "✗ Numbers"}
                </span>
                <span
                  className={`px-1.5 py-0.5 border ${
                    feedback.hasSafetyLanguage
                      ? "bg-emerald-50 text-emerald-800 border-emerald-305"
                      : "bg-slate-200 text-slate-400 border-transparent"
                  }`}
                >
                  {feedback.hasSafetyLanguage ? "✓ Clinical Words" : "✗ Clinical Words"}
                </span>
              </div>

              {/* Strengths, Gaps and Recommendations bullets */}
              <div className="space-y-3 font-sans text-[11px] leading-relaxed">
                <div>
                  <p className="font-bold text-emerald-900 uppercase text-[9px] tracking-wide mb-0.5">
                    ★ Key Strengths:
                  </p>
                  <ul className="list-disc pl-4 text-slate-650 font-medium space-y-0.5">
                    {feedback.strengths.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>

                {feedback.gaps.length > 0 && (
                  <div>
                    <p className="font-bold text-rose-900 uppercase text-[9px] tracking-wide mb-0.5">
                      ⚠️ Audit Gaps:
                    </p>
                    <ul className="list-disc pl-4 text-slate-650 font-medium space-y-0.5">
                      {feedback.gaps.map((g, idx) => (
                        <li key={idx}>{g}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <p className="font-bold text-indigo-900 uppercase text-[9px] tracking-wide mb-0.5">
                    💡 Suggested Improvements:
                  </p>
                  <ul className="list-disc pl-4 text-slate-650 font-medium space-y-0.5">
                    {feedback.recommendations.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-205">
                <button
                  onClick={handleNext}
                  className="w-full bg-slate-900 text-white font-mono text-[9px] font-black uppercase text-center py-2 hover:bg-slate-800 border border-slate-950 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all cursor-pointer"
                >
                  Proceed to Next behavioral Question →
                </button>
              </div>
            </div>
          ) : (
            <div className="my-auto text-center p-3 leading-relaxed">
              <span className="block text-4xl mb-2 select-none">🤖</span>
              <span className="font-display font-black uppercase text-xs text-slate-950 block">
                Rule-Based Interview Evaluator
              </span>
              <p className="text-[11px] text-slate-500 font-sans font-medium mt-1 max-w-xs mx-auto">
                Type an account of how you managed these situations, then click [Get Feedback] to analyze metrics, STAR framework structure, and safety language.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
