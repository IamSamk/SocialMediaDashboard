import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';

const Analytics: React.FC = () => {
  // State for each table
  const [reviews, setReviews] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [toolUsage, setToolUsage] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const userId = localStorage.getItem('userId');

  // Fetch all data on mount
  useEffect(() => {
    if (!userId) return;
    api.get(`/reviews?userId=${userId}`).then(res => setReviews(res.data));
    api.get(`/goals?userId=${userId}`).then(res => setGoals(res.data));
    api.get(`/trends`).then(res => setTrends(res.data));
    api.get(`/toolusage?userId=${userId}`).then(res => setToolUsage(res.data));
    api.get(`/anomalies?userId=${userId}`).then(res => setAnomalies(res.data));
  }, [userId]);

  // Simple forms for adding new entries (for demonstration)
  const [reviewInput, setReviewInput] = useState({ rating: 5, comment: '' });
  const [goalInput, setGoalInput] = useState({ goalType: '', targetValue: 0, deadline: '' });
  const [trendInput, setTrendInput] = useState({ platform: '', hashtag: '', occurrences: 1 });
  const [toolInput, setToolInput] = useState({ toolName: '', paramsUsed: '', result: '' });
  const [anomalyInput, setAnomalyInput] = useState({ description: '', severity: 'Low' });

  // Handlers for adding new entries
  const addReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.post('/reviews', { userId, ...reviewInput });
    setReviews([...reviews, { ...reviewInput, reviewId: res.data.reviewId }]);
    setReviewInput({ rating: 5, comment: '' });
  };
  const addGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.post('/goals', { userId, ...goalInput });
    setGoals([...goals, { ...goalInput, goalId: res.data.goalId }]);
    setGoalInput({ goalType: '', targetValue: 0, deadline: '' });
  };
  const addTrend = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.post('/trends', trendInput);
    setTrends([...trends, { ...trendInput, trendId: res.data.trendId }]);
    setTrendInput({ platform: '', hashtag: '', occurrences: 1 });
  };
  const addToolUsage = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.post('/toolusage', { userId, ...toolInput });
    setToolUsage([...toolUsage, { ...toolInput, toolId: res.data.toolId }]);
    setToolInput({ toolName: '', paramsUsed: '', result: '' });
  };
  const addAnomaly = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.post('/anomalies', { userId, ...anomalyInput });
    setAnomalies([...anomalies, { ...anomalyInput, anomalyId: res.data.anomalyId }]);
    setAnomalyInput({ description: '', severity: 'Low' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 p-6 font-sans">
      <Navbar />
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8">📈 Analytics & Feedback</h1>
      {/* Reviews Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Reviews</h2>
        <form onSubmit={addReview} className="mb-2 flex gap-2">
          <input type="number" min={1} max={5} value={reviewInput.rating} onChange={e => setReviewInput({ ...reviewInput, rating: Number(e.target.value) })} className="border rounded px-2" required />
          <input type="text" value={reviewInput.comment} onChange={e => setReviewInput({ ...reviewInput, comment: e.target.value })} placeholder="Comment" className="border rounded px-2 flex-1" required />
          <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded">Add</button>
        </form>
        <ul className="bg-white rounded shadow p-2">
          {reviews.map((r, i) => <li key={i}>⭐ {r.rating} - {r.comment}</li>)}
        </ul>
      </section>
      {/* Goals Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Goals</h2>
        <form onSubmit={addGoal} className="mb-2 flex gap-2">
          <input type="text" value={goalInput.goalType} onChange={e => setGoalInput({ ...goalInput, goalType: e.target.value })} placeholder="Goal Type" className="border rounded px-2" required />
          <input type="number" value={goalInput.targetValue} onChange={e => setGoalInput({ ...goalInput, targetValue: Number(e.target.value) })} placeholder="Target Value" className="border rounded px-2" required />
          <input type="date" value={goalInput.deadline} onChange={e => setGoalInput({ ...goalInput, deadline: e.target.value })} className="border rounded px-2" required />
          <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded">Add</button>
        </form>
        <ul className="bg-white rounded shadow p-2">
          {goals.map((g, i) => <li key={i}>{g.goalType} - Target: {g.targetValue} by {g.deadline}</li>)}
        </ul>
      </section>
      {/* Trends Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Trends</h2>
        <form onSubmit={addTrend} className="mb-2 flex gap-2">
          <input type="text" value={trendInput.platform} onChange={e => setTrendInput({ ...trendInput, platform: e.target.value })} placeholder="Platform" className="border rounded px-2" required />
          <input type="text" value={trendInput.hashtag} onChange={e => setTrendInput({ ...trendInput, hashtag: e.target.value })} placeholder="Hashtag" className="border rounded px-2" required />
          <input type="number" value={trendInput.occurrences} onChange={e => setTrendInput({ ...trendInput, occurrences: Number(e.target.value) })} placeholder="Occurrences" className="border rounded px-2" required />
          <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded">Add</button>
        </form>
        <ul className="bg-white rounded shadow p-2">
          {trends.map((t, i) => <li key={i}>#{t.hashtag} ({t.platform}) - {t.occurrences} times</li>)}
        </ul>
      </section>
      {/* Tool Usage Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Tool Usage</h2>
        <form onSubmit={addToolUsage} className="mb-2 flex gap-2">
          <input type="text" value={toolInput.toolName} onChange={e => setToolInput({ ...toolInput, toolName: e.target.value })} placeholder="Tool Name" className="border rounded px-2" required />
          <input type="text" value={toolInput.paramsUsed} onChange={e => setToolInput({ ...toolInput, paramsUsed: e.target.value })} placeholder="Params Used" className="border rounded px-2" required />
          <input type="text" value={toolInput.result} onChange={e => setToolInput({ ...toolInput, result: e.target.value })} placeholder="Result" className="border rounded px-2" required />
          <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded">Add</button>
        </form>
        <ul className="bg-white rounded shadow p-2">
          {toolUsage.map((t, i) => <li key={i}>{t.toolName} - Params: {t.paramsUsed} - Result: {t.result}</li>)}
        </ul>
      </section>
      {/* Anomalies Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Anomalies</h2>
        <form onSubmit={addAnomaly} className="mb-2 flex gap-2">
          <input type="text" value={anomalyInput.description} onChange={e => setAnomalyInput({ ...anomalyInput, description: e.target.value })} placeholder="Description" className="border rounded px-2" required />
          <select value={anomalyInput.severity} onChange={e => setAnomalyInput({ ...anomalyInput, severity: e.target.value })} className="border rounded px-2">
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded">Add</button>
        </form>
        <ul className="bg-white rounded shadow p-2">
          {anomalies.map((a, i) => <li key={i}>{a.severity} - {a.description}</li>)}
        </ul>
      </section>
    </div>
  );
};

export default Analytics; 