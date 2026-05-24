import React, { useState, useEffect } from 'react';
import quizApi from '../../../api/quizApi';
import { useAuth } from '../../../context/AuthContext';

interface QuizTabProps {
  courseId: string;
}

const QuizTab: React.FC<QuizTabProps> = ({ courseId }) => {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { student } = useAuth();
  
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<any | null>(null);
  const [quizReview, setQuizReview] = useState<any | null>(null);

  useEffect(() => {
    fetchData();
  }, [courseId, student]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const resQuizzes = await quizApi.getCourseQuizzes(courseId);
      setQuizzes(resQuizzes.quizzes || []);
      
      if (student) {
        const resHistory = await quizApi.getQuizHistory(courseId);
        setHistory(resHistory.history || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async (quizId: string) => {
    if (!student) {
      alert('Vui lòng đăng nhập để làm bài.');
      return;
    }
    try {
      const res = await quizApi.getQuizDetail(quizId);
      setActiveQuiz(res.quiz);
      setAnswers(new Array(res.quiz.questions.length).fill(-1));
      setResult(null);
      setQuizReview(null);
    } catch (err) {
      alert('Không thể tải bài tập.');
    }
  };

  const selectAnswer = (questionIndex: number, optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const submitQuiz = async () => {
    if (answers.includes(-1)) {
      alert('Vui lòng trả lời tất cả các câu hỏi.');
      return;
    }
    try {
      const res = await quizApi.submitQuiz(activeQuiz._id, answers);
      setResult(res.result);
      setQuizReview(res.quizReview);
      fetchData(); // Reload history
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  if (loading) return <div>Đang tải bài tập...</div>;

  if (activeQuiz && !result) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{activeQuiz.title}</h2>
          <button onClick={() => setActiveQuiz(null)} className="btn btn-secondary px-4 py-2 text-sm bg-gray-200 rounded">Quay lại</button>
        </div>
        <p className="text-gray-600 mb-4">{activeQuiz.description}</p>

        {activeQuiz.questions.map((q: any, i: number) => (
          <div key={i} className="border border-gray-200 rounded-xl p-5 mb-4">
            <h3 className="font-semibold mb-3">Câu {i + 1}: {q.questionText}</h3>
            <div className="space-y-2">
              {q.options.map((opt: string, optIdx: number) => (
                <div 
                  key={optIdx} 
                  onClick={() => selectAnswer(i, optIdx)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${answers[i] === optIdx ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <span className="font-medium mr-2">{String.fromCharCode(65 + optIdx)}.</span> {opt}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="text-right">
          <button onClick={submitQuiz} className="btn btn-primary px-6 py-2.5 bg-blue-600 text-white font-bold rounded hover:bg-blue-700">
            Nộp Bài
          </button>
        </div>
      </div>
    );
  }

  if (result && quizReview) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="text-center p-6 border rounded-xl bg-gray-50">
          <h2 className="text-2xl font-bold mb-2">Kết Quả: {activeQuiz.title}</h2>
          <div className="text-4xl font-extrabold mb-2" style={{ color: result.passed ? '#10b981' : '#ef4444' }}>
            {result.score.toFixed(1)}%
          </div>
          <p className="font-bold text-lg">{result.passed ? '🎉 CHÚC MỪNG BẠN ĐÃ VƯỢT QUA!' : '❌ BẠN CHƯA ĐẠT ĐIỂM YÊU CẦU'}</p>
          <p className="text-gray-600">Đúng {result.correctAnswers} / {result.totalQuestions} câu</p>
          <button onClick={() => setActiveQuiz(null)} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded font-semibold">Trở về danh sách</button>
        </div>

        <h3 className="text-xl font-bold mt-8 mb-4">Xem Lại Đáp Án</h3>
        {quizReview.questions.map((q: any, i: number) => {
          const isCorrect = answers[i] === q.correctOptionIndex;
          return (
            <div key={i} className={`border rounded-xl p-5 mb-4 ${isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
              <h3 className="font-semibold mb-3">Câu {i + 1}: {q.questionText}</h3>
              <div className="space-y-2 mb-3">
                {q.options.map((opt: string, optIdx: number) => {
                  let styleClass = 'border-gray-200 opacity-60';
                  if (optIdx === q.correctOptionIndex) styleClass = 'border-green-500 bg-green-100 text-green-800 font-bold';
                  else if (optIdx === answers[i] && !isCorrect) styleClass = 'border-red-500 bg-red-100 text-red-800 line-through';
                  
                  return (
                    <div key={optIdx} className={`p-3 border rounded-lg ${styleClass}`}>
                      <span className="mr-2">{String.fromCharCode(65 + optIdx)}.</span> {opt}
                    </div>
                  );
                })}
              </div>
              {q.explanation && (
                <div className="text-sm bg-white p-3 rounded border border-gray-200">
                  <span className="font-bold">Giải thích:</span> {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {quizzes.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <p>Chưa có bài tập nào cho khóa học này.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {quizzes.map(quiz => {
            const bestScore = history.filter(h => h.quizId._id === quiz._id || h.quizId === quiz._id).sort((a,b) => b.score - a.score)[0];
            return (
              <div key={quiz._id} className="border border-gray-200 rounded-xl p-5 flex justify-between items-center bg-white shadow-sm hover:shadow-md transition">
                <div>
                  <h3 className="font-bold text-lg">{quiz.title}</h3>
                  <div className="text-sm text-gray-500 mt-1">Điểm đỗ: {quiz.passingScore}% • {quiz.questions.length} câu hỏi</div>
                  {bestScore && (
                    <div className="text-sm mt-2 font-medium">
                      Điểm cao nhất của bạn: <span className={bestScore.passed ? 'text-green-600' : 'text-red-500'}>{bestScore.score}% ({bestScore.passed ? 'Đạt' : 'Chưa đạt'})</span>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => startQuiz(quiz._id)}
                  className="px-5 py-2.5 bg-blue-50 text-blue-700 font-bold rounded-lg hover:bg-blue-100 border border-blue-200"
                >
                  Làm Bài
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuizTab;
