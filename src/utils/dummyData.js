export const dummyDramas = [
  {
    id: 1,
    name: "The Last Kingdom",
    thumbnail: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400",
    type: "drama",
    totalSeries: 5,
    totalViews: 125000,
    rating: 4.8,
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    name: "Eternal Love",
    thumbnail: "https://images.pexels.com/photos/1117132/pexels-photo-1117132.jpeg?auto=compress&cs=tinysrgb&w=400",
    type: "drama",
    totalSeries: 3,
    totalViews: 98000,
    rating: 4.6,
    createdAt: "2024-02-20",
  },
  {
    id: 3,
    name: "Mystery Night",
    thumbnail: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400",
    type: "drama",
    totalSeries: 4,
    totalViews: 156000,
    rating: 4.9,
    createdAt: "2024-03-10",
  },
];

export const dummyMovies = [
  {
    id: 1,
    name: "Shadow Warriors",
    thumbnail: "https://images.pexels.com/photos/1200450/pexels-photo-1200450.jpeg?auto=compress&cs=tinysrgb&w=400",
    type: "movie",
    totalViews: 250000,
    rating: 4.7,
    duration: "2h 15m",
    createdAt: "2024-01-05",
  },
  {
    id: 2,
    name: "Lost in Time",
    thumbnail: "https://images.pexels.com/photos/2035066/pexels-photo-2035066.jpeg?auto=compress&cs=tinysrgb&w=400",
    type: "movie",
    totalViews: 180000,
    rating: 4.5,
    duration: "1h 45m",
    createdAt: "2024-02-12",
  },
];

export const dummySeries = [
  {
    id: 1,
    dramaId: 1,
    name: "Season 1",
    totalVideos: 12,
    createdAt: "2024-01-16",
  },
  {
    id: 2,
    dramaId: 1,
    name: "Season 2",
    totalVideos: 10,
    createdAt: "2024-02-01",
  },
];

export const dummyVideos = [
  {
    id: 1,
    seriesId: 1,
    title: "Episode 1: The Beginning",
    thumbnail: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400",
    videoUrl: "#",
    highlightText: "New",
    highlightBgColor: "#22c55e",
    tags: ["action", "drama"],
    shortDescription: "The journey begins as our hero faces an unexpected challenge.",
    duration: "45m",
    views: 15000,
    createdAt: "2024-01-17",
  },
  {
    id: 2,
    seriesId: 1,
    title: "Episode 2: Rising Conflict",
    thumbnail: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400",
    videoUrl: "#",
    highlightText: "Hot",
    highlightBgColor: "#ef4444",
    tags: ["action", "thriller"],
    shortDescription: "Tensions rise as new enemies emerge from the shadows.",
    duration: "42m",
    views: 12000,
    createdAt: "2024-01-24",
  },
];

export const dummyUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "+8801712345678",
    status: "active",
    subscriptionType: "Premium",
    subscriptionExpiry: "2025-01-15",
    joinedAt: "2023-06-10",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+8801812345678",
    status: "active",
    subscriptionType: "Basic",
    subscriptionExpiry: "2024-12-20",
    joinedAt: "2023-08-22",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike@example.com",
    phone: "+8801912345678",
    status: "inactive",
    subscriptionType: "Free",
    subscriptionExpiry: null,
    joinedAt: "2024-01-05",
  },
];

export const dummySubscriptions = [
  {
    id: 1,
    name: "Basic Plan",
    price: 299,
    duration: "1 Month",
    features: ["SD Quality", "2 Devices", "Limited Content"],
    isActive: true,
  },
  {
    id: 2,
    name: "Premium Plan",
    price: 599,
    duration: "1 Month",
    features: ["HD Quality", "5 Devices", "Full Content Library", "Offline Download"],
    isActive: true,
  },
  {
    id: 3,
    name: "Annual Plan",
    price: 5999,
    duration: "12 Months",
    features: ["4K Quality", "Unlimited Devices", "Full Content Library", "Offline Download", "Priority Support"],
    isActive: true,
  },
];

export const dummyOverviewStats = {
  totalDramas: 48,
  totalMovies: 125,
  totalUsers: 12458,
  activeSubscriptions: 8234,
  userGrowth: [
    { month: "Jan", users: 8000 },
    { month: "Feb", users: 8500 },
    { month: "Mar", users: 9200 },
    { month: "Apr", users: 9800 },
    { month: "May", users: 10500 },
    { month: "Jun", users: 11200 },
    { month: "Jul", users: 12458 },
  ],
  topWatchedContent: [
    { name: "Mystery Night", views: 156000 },
    { name: "Shadow Warriors", views: 250000 },
    { name: "The Last Kingdom", views: 125000 },
    { name: "Lost in Time", views: 180000 },
    { name: "Eternal Love", views: 98000 },
    // { name: "KGF Chapter 1", views: 198000 },
  ],
};
