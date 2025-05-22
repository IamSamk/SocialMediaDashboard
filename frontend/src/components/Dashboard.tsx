// Login + Dashboard Integration (YouTube OAuth + Analytics View)
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  BarChart, Bar,
  LineChart, Line as RechartsLine,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid
} from 'recharts';
import { FaYoutube, FaInstagram, FaXTwitter, FaLinkedin } from 'react-icons/fa6';
import { Line, Pie as PieChartJS } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  ChartLegend
);

interface Post {
  postId: number;
  title: string;
  platform: string;
  views: number;
  likes: number;
  comments: number;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState('');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [showPie, setShowPie] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriberCount, setSubscriberCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) {
      navigate('/');
      return;
    }

    setIsLoading(true);
    
    // Fetch posts
    api.get(`/posts?userId=${userId}`)
      .then(res => {
        console.log('Posts data:', res.data);
        setPosts(Array.isArray(res.data) ? res.data : []);
        setIsLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch posts. Please try again.');
        console.error('API Error:', err);
        setIsLoading(false);
      });

    // Fetch subscriber count
    const fetchSubscribers = async () => {
      try {
        const res = await api.get(`/youtube/subscribers?token=${token}`);
        setSubscriberCount(res.data.subscriberCount);
      } catch (err) {
        setSubscriberCount(0);
      }
    };
    fetchSubscribers();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="bg-white p-10 rounded-xl shadow-xl max-w-md w-full text-center">
          <h1 className="text-3xl font-bold mb-6 text-red-600">⚠️ Error</h1>
          <p className="mb-4 text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Fallback: always use an array for posts
  const filteredPosts = Array.isArray(posts)
    ? posts.filter(p => (p.title || '').toLowerCase().includes(filter.toLowerCase()))
    : [];

  const totalViews = filteredPosts.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalLikes = filteredPosts.reduce((sum, p) => sum + (p.likes || 0), 0);
  const totalComments = filteredPosts.reduce((sum, p) => sum + (p.comments || 0), 0);
  const avgEngagement = totalLikes + totalComments > 0 
    ? ((totalLikes + totalComments) / (totalLikes + totalComments)).toFixed(2)
    : '0';

  const pieData = {
    labels: ['Likes', 'Comments'],
    datasets: [{
      data: [totalLikes, totalComments],
      backgroundColor: ['#34d399', '#facc15'],
    }]
  };

  const insight = avgEngagement > '0.5'
    ? 'Great job! Engagement is strong. Keep it up!'
    : 'Try to increase engagement by responding to comments and asking questions.';

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 p-6 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800 drop-shadow-md">
          📊 Social Media Analytics Dashboard
        </h1>
        <div className="flex space-x-4 text-2xl mt-4 md:mt-0">
          <FaYoutube className="text-red-600 hover:scale-110 transition-transform cursor-pointer" />
          <FaInstagram className="text-pink-500 hover:scale-110 transition-transform cursor-pointer" />
          <FaXTwitter className="text-black hover:scale-110 transition-transform cursor-pointer" />
          <FaLinkedin className="text-blue-700 hover:scale-110 transition-transform cursor-pointer" />
        </div>
      </div>

      <input
        type="text"
        placeholder="Search by title..."
        value={filter}
        onChange={e => setFilter(e.target.value)}
        className="block mx-auto mb-6 px-4 py-2 border border-gray-300 rounded-lg shadow w-full md:w-1/2"
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-6">
        <div className="bg-white shadow-lg rounded-xl p-5 text-center border-t-4 border-blue-400">
          <h2 className="text-xl font-semibold text-gray-600">Total Posts</h2>
          <p className="text-3xl font-bold text-blue-600">{filteredPosts.length}</p>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-5 text-center border-t-4 border-green-400">
          <h2 className="text-xl font-semibold text-gray-600">Total Views</h2>
          <p className="text-3xl font-bold text-green-600">{totalViews.toLocaleString()}</p>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-5 text-center border-t-4 border-yellow-400">
          <h2 className="text-xl font-semibold text-gray-600">Total Likes</h2>
          <p className="text-3xl font-bold text-yellow-600">{totalLikes.toLocaleString()}</p>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-5 text-center border-t-4 border-purple-400">
          <h2 className="text-xl font-semibold text-gray-600">Avg. Engagement</h2>
          <p className="text-3xl font-bold text-purple-600">{avgEngagement}</p>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-5 text-center border-t-4 border-red-400">
          <h2 className="text-xl font-semibold text-gray-600">Subscribers</h2>
          <p className="text-3xl font-bold text-red-600">{subscriberCount.toLocaleString()}</p>
        </div>
      </div>

      <div className="mb-6 text-center">
        <h2 className="text-lg font-medium text-gray-700">🧠 AI Insight</h2>
        <p className="text-md italic text-indigo-600 mt-1">{insight}</p>
      </div>

      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">📈 Engagement Chart</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setChartType(chartType === 'bar' ? 'line' : 'bar')}
            className="px-4 py-2 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700"
          >
            Switch to {chartType === 'bar' ? 'Line' : 'Bar'} Chart
          </button>
          <button
            onClick={() => setShowPie(!showPie)}
            className="px-4 py-2 bg-pink-500 text-white rounded shadow hover:bg-pink-600"
          >
            {showPie ? 'Hide' : 'Show'} Pie Chart
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <ResponsiveContainer width="100%" height={300}>
          {chartType === 'bar' ? (
            <BarChart data={filteredPosts.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="title" tickFormatter={(title) => title.slice(0, 5) + '...'} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="views" fill="#60a5fa" name="Views" />
              <Bar dataKey="likes" fill="#34d399" name="Likes" />
            </BarChart>
          ) : (
            <LineChart data={filteredPosts.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="title" tickFormatter={(title) => title.slice(0, 5) + '...'} />
              <YAxis />
              <Tooltip />
              <Legend />
              <RechartsLine type="monotone" dataKey="views" stroke="#60a5fa" name="Views" />
              <RechartsLine type="monotone" dataKey="likes" stroke="#34d399" name="Likes" />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {showPie && (
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <h2 className="text-xl font-semibold mb-2">🧠 Likes vs Comments</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChartJS
              data={pieData}
              options={{
                plugins: {
                  legend: {
                    display: true,
                    position: 'bottom'
                  },
                },
              }}
            />
          </ResponsiveContainer>
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Title</th>
              <th className="border p-2">Views</th>
              <th className="border p-2">Likes</th>
              <th className="border p-2">Comments</th>
              <th className="border p-2">Engagement</th>
              <th className="border p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.map((p) => (
              <tr key={p.postId} className="hover:bg-gray-50">
                <td className="border p-2">{(p.title || '').slice(0, 50)}...</td>
                <td className="border p-2">{(p.views || 0).toLocaleString()}</td>
                <td className="border p-2">{(p.likes || 0).toLocaleString()}</td>
                <td className="border p-2">{(p.comments || 0).toLocaleString()}</td>
                <td className="border p-2">{avgEngagement}</td>
                <td className="border p-2">{(p.createdAt || '').slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
