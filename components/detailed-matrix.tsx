"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import { TrendingUp, Star, Target, Award, Calendar, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DetailedMatrixProps {
  salesReps: any[];
  className?: string;
}

// Generate separate data for different time periods
const generateDailyData = () => [
  { period: "Monday", conversions: 12 },
  { period: "Tuesday", conversions: 15 },
  { period: "Wednesday", conversions: 18 },
  { period: "Thursday", conversions: 14 },
  { period: "Friday", conversions: 22 },
  { period: "Saturday", conversions: 8 },
  { period: "Sunday", conversions: 6 },
];

const generateWeeklyData = () => [
  { period: "Week 1", conversions: 85 },
  { period: "Week 2", conversions: 92 },
  { period: "Week 3", conversions: 98 },
  { period: "Week 4", conversions: 105 },
];

const generateMonthlyData = () => [
  { period: "January", conversions: 342 },
  { period: "February", conversions: 358 },
  { period: "March", conversions: 371 },
  { period: "April", conversions: 365 },
  { period: "May", conversions: 389 },
  { period: "June", conversions: 410 },
];

// Generate leads data for different time periods
const generateDailyLeadsData = () => [
  { period: "Monday", leads: 45 },
  { period: "Tuesday", leads: 52 },
  { period: "Wednesday", leads: 48 },
  { period: "Thursday", leads: 58 },
  { period: "Friday", leads: 61 },
  { period: "Saturday", leads: 32 },
  { period: "Sunday", leads: 28 },
];

const generateWeeklyLeadsData = () => [
  { period: "Week 1", leads: 325 },
  { period: "Week 2", leads: 342 },
  { period: "Week 3", leads: 368 },
  { period: "Week 4", leads: 385 },
];

const generateMonthlyLeadsData = () => [
  { period: "January", leads: 1250 },
  { period: "February", leads: 1320 },
  { period: "March", leads: 1410 },
  { period: "April", leads: 1380 },
  { period: "May", leads: 1450 },
  { period: "June", leads: 1520 },
];

const generateLeadQualityDailyData = () => [
  { period: "Monday", quality: 6.8 },
  { period: "Tuesday", quality: 7.1 },
  { period: "Wednesday", quality: 6.9 },
  { period: "Thursday", quality: 7.3 },
  { period: "Friday", quality: 7.5 },
  { period: "Saturday", quality: 6.5 },
  { period: "Sunday", quality: 6.2 },
];

const generateLeadQualityWeeklyData = () => [
  { period: "Week 1", quality: 6.9 },
  { period: "Week 2", quality: 7.2 },
  { period: "Week 3", quality: 7.4 },
  { period: "Week 4", quality: 7.6 },
];

const generateLeadQualityMonthlyData = () => [
  { period: "January", quality: 6.8 },
  { period: "February", quality: 7.0 },
  { period: "March", quality: 7.2 },
  { period: "April", quality: 7.4 },
  { period: "May", quality: 7.6 },
  { period: "June", quality: 7.8 },
];

// Generate staff performance data for different time periods
const generateStaffPerformanceDailyData = () => [
  { staff: "John Smith", leads: 12 },
  { staff: "Sarah Johnson", leads: 18 },
  { staff: "Mike Davis", leads: 15 },
  { staff: "Emily Wilson", leads: 22 },
  { staff: "Alex Brown", leads: 8 },
  { staff: "Lisa Chen", leads: 14 },
];

const generateStaffPerformanceWeeklyData = () => [
  { staff: "John Smith", leads: 85 },
  { staff: "Sarah Johnson", leads: 126 },
  { staff: "Mike Davis", leads: 105 },
  { staff: "Emily Wilson", leads: 154 },
  { staff: "Alex Brown", leads: 56 },
  { staff: "Lisa Chen", leads: 98 },
];

const generateStaffPerformanceMonthlyData = () => [
  { staff: "John Smith", leads: 342 },
  { staff: "Sarah Johnson", leads: 504 },
  { staff: "Mike Davis", leads: 420 },
  { staff: "Emily Wilson", leads: 616 },
  { staff: "Alex Brown", leads: 224 },
  { staff: "Lisa Chen", leads: 392 },
];

const COLORS = {
  daily: "#3b82f6",
  weekly: "#8b5cf6", 
  monthly: "#10b981",
  quality: "#f59e0b",
  trend: "#ef4444",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-4 min-w-[180px]">
        <p className="text-sm font-semibold text-gray-900 mb-3">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs font-medium text-gray-700">Conversions</span>
            </div>
            <span className="text-sm font-bold text-gray-900">
              {entry.dataKey.includes('Quality') || entry.dataKey === 'daily' || entry.dataKey === 'weekly' || entry.dataKey === 'monthly' 
                ? `${entry.value}/10` 
                : `${entry.value} conversions`}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Dynamic insight calculation functions
const calculateInsights = (data: any[], metricType: 'conversions' | 'leads', timePeriod: 'daily' | 'weekly' | 'monthly') => {
  const valueKey = metricType === 'leads' ? 'leads' : 'conversions';
  const values = data.map(item => item[valueKey]);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length;
  const maxIndex = values.indexOf(maxValue);
  const minIndex = values.indexOf(minValue);
  
  const maxPeriod = data[maxIndex].period;
  const minPeriod = data[minIndex].period;
  
  // Calculate growth (first vs last)
  const growthValue = values.length > 1 ? (values[values.length - 1] - values[0]) / values[0] * 100 : 0;
  const growth = growthValue.toFixed(1);
  
  // Calculate weekend vs weekday performance (for daily)
  let weekendInsight = '';
  if (timePeriod === 'daily') {
    const weekendDays = ['Saturday', 'Sunday'];
    const weekendValues = data.filter(item => weekendDays.includes(item.period)).map(item => item[valueKey]);
    const weekdayValues = data.filter(item => !weekendDays.includes(item.period)).map(item => item[valueKey]);
    const weekendAvg = weekendValues.reduce((sum, val) => sum + val, 0) / weekendValues.length;
    const weekdayAvg = weekdayValues.reduce((sum, val) => sum + val, 0) / weekdayValues.length;
    const weekendDiff = ((weekdayAvg - weekendAvg) / weekdayAvg * 100).toFixed(0);
    weekendInsight = `Weekend performance is ${weekendDiff}% lower than weekdays`;
  }
  
  return {
    bestPerformer: `${maxPeriod} shows highest performance (${maxValue} ${metricType})`,
    growthTrend: `${growthValue > 0 ? '+' : ''}${growth}% growth over ${timePeriod === 'daily' ? 'the week' : timePeriod === 'weekly' ? '4 weeks' : '6 months'}`,
    avgPerformance: `Average: ${avgValue.toFixed(1)} ${metricType} per ${timePeriod === 'daily' ? 'day' : timePeriod === 'weekly' ? 'week' : 'month'}`,
    weekendInsight,
    conversionRate: metricType === 'leads' && timePeriod === 'daily' ? 
      `Lead-to-conversion ratio: ${(avgValue / 95).toFixed(1)}:1` : null
  };
};

export function DetailedMatrix({ salesReps, className }: DetailedMatrixProps) {
  const [timePeriod, setTimePeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [qualityTimePeriod, setQualityTimePeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [metricType, setMetricType] = useState<'conversions' | 'leads'>('conversions');
  const [staffTimePeriod, setStaffTimePeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  
  const getConversionData = () => {
    if (metricType === 'leads') {
      switch(timePeriod) {
        case 'daily':
          return generateDailyLeadsData();
        case 'weekly':
          return generateWeeklyLeadsData();
        case 'monthly':
          return generateMonthlyLeadsData();
        default:
          return generateDailyLeadsData();
      }
    } else {
      switch(timePeriod) {
        case 'daily':
          return generateDailyData();
        case 'weekly':
          return generateWeeklyData();
        case 'monthly':
          return generateMonthlyData();
        default:
          return generateDailyData();
      }
    }
  };

  const getQualityData = () => {
    switch(qualityTimePeriod) {
      case 'daily':
        return generateLeadQualityDailyData();
      case 'weekly':
        return generateLeadQualityWeeklyData();
      case 'monthly':
        return generateLeadQualityMonthlyData();
      default:
        return generateLeadQualityDailyData();
    }
  };

  const getStaffPerformanceData = () => {
    switch(staffTimePeriod) {
      case 'daily':
        return generateStaffPerformanceDailyData();
      case 'weekly':
        return generateStaffPerformanceWeeklyData();
      case 'monthly':
        return generateStaffPerformanceMonthlyData();
      default:
        return generateStaffPerformanceDailyData();
    }
  };

  const conversionData = getConversionData();
  const qualityData = getQualityData();
  const staffData = getStaffPerformanceData();
  
  // Calculate dynamic insights
  const insights = calculateInsights(conversionData, metricType, timePeriod);

  return (
    <motion.div
      className={cn(
        "space-y-6",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Section Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-3">
            <Target className="w-6 h-6 text-indigo-600" />
            Performance Comparison Analytics
          </h2>
          <p className="text-sm text-gray-600">
            Daily, Weekly, and Monthly conversion & lead quality trends for strategic decision-making
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full">
          <Award className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-medium text-indigo-600">CEO Insights</span>
        </div>
      </motion.div>

      {/* Charts Grid - Focused on Conversions & Lead Quality */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Conversion Comparison Chart */}
        <motion.div
          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm lg:col-span-2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Analytics</h3>
            <p className="text-sm text-gray-600 mb-4">View conversions and leads by time period</p>
            
            {/* Metric Type Switcher */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setMetricType('conversions')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  metricType === 'conversions'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Conversions
              </button>
              <button
                onClick={() => setMetricType('leads')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  metricType === 'leads'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Leads
              </button>
            </div>
            
            {/* Time Period Switcher */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTimePeriod('daily')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timePeriod === 'daily'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setTimePeriod('weekly')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timePeriod === 'weekly'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setTimePeriod('monthly')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timePeriod === 'monthly'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-xs text-blue-600 font-medium mb-1">
                {timePeriod === 'daily' ? "Today\'s Total" : timePeriod === 'weekly' ? "This Week" : "This Month"}
              </p>
              <p className="text-xl font-bold text-blue-900">
                {metricType === 'conversions' 
                  ? (timePeriod === 'daily' ? '95' : timePeriod === 'weekly' ? '105' : '410')
                  : (timePeriod === 'daily' ? '324' : timePeriod === 'weekly' ? '1420' : '6800')
                }
              </p>
              <p className="text-xs text-blue-700">{metricType === 'conversions' ? 'conversions' : 'leads'}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <p className="text-xs text-purple-600 font-medium mb-1">
                {timePeriod === 'daily' ? "Daily Avg" : timePeriod === 'weekly' ? "Weekly Avg" : "Monthly Avg"}
              </p>
              <p className="text-xl font-bold text-purple-900">
                {metricType === 'conversions' 
                  ? (timePeriod === 'daily' ? '13.6' : timePeriod === 'weekly' ? '95' : '374')
                  : (timePeriod === 'daily' ? '46.3' : timePeriod === 'weekly' ? '355' : '1388')
                }
              </p>
              <p className="text-xs text-purple-700">
                {timePeriod === 'daily' ? 'per day' : timePeriod === 'weekly' ? 'per week' : 'per month'}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-xs text-green-600 font-medium mb-1">Growth Rate</p>
              <p className="text-xl font-bold text-green-900">
                {metricType === 'conversions' 
                  ? (timePeriod === 'daily' ? '+23%' : timePeriod === 'weekly' ? '+12%' : '+8%')
                  : (timePeriod === 'daily' ? '+18%' : timePeriod === 'weekly' ? '+15%' : '+10%')
                }
              </p>
              <p className="text-xs text-green-700">vs last period</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={conversionData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                <defs>
                  <linearGradient id="conversionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metricType === 'leads' ? '#6366f1' : (timePeriod === 'daily' ? '#3b82f6' : timePeriod === 'weekly' ? '#8b5cf6' : '#10b981')} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={metricType === 'leads' ? '#6366f1' : (timePeriod === 'daily' ? '#3b82f6' : timePeriod === 'weekly' ? '#8b5cf6' : '#10b981')} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="period"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  label={{ value: metricType === 'leads' ? "Leads" : "Conversions", angle: -90, position: "insideLeft", style: { fontSize: 12, fill: "#64748b" } }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey={metricType === 'leads' ? "leads" : "conversions"}
                  stroke={metricType === 'leads' ? '#6366f1' : (timePeriod === 'daily' ? COLORS.daily : timePeriod === 'weekly' ? COLORS.weekly : COLORS.monthly)}
                  strokeWidth={2}
                  fill="url(#conversionGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          {/* Performance Insights */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-700 mb-2">📊 Key Insights:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>• {insights.bestPerformer}</div>
              <div>• {insights.growthTrend}</div>
              <div>• {insights.avgPerformance}</div>
              {insights.weekendInsight && <div>• {insights.weekendInsight}</div>}
              {insights.conversionRate && <div>• {insights.conversionRate}</div>}
              <div>• Data-driven analysis updated in real-time</div>
            </div>
          </div>
        </motion.div>

        {/* Lead Quality Comparison Chart */}
        <motion.div
          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Lead Quality Trends</h3>
              <p className="text-xs text-gray-600 mb-4">Quality scores across time periods</p>
              
              {/* Time Period Switcher */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQualityTimePeriod('daily')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    qualityTimePeriod === 'daily'
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setQualityTimePeriod('weekly')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    qualityTimePeriod === 'weekly'
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setQualityTimePeriod('monthly')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    qualityTimePeriod === 'monthly'
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg">
              <Star className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={qualityData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <defs>
                  <linearGradient id="qualityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="period"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  domain={[6, 9]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="quality"
                  stroke={COLORS.quality}
                  strokeWidth={2}
                  fill="url(#qualityGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="bg-blue-50 rounded-lg p-2">
              <p className="text-xs text-blue-600 font-medium">
                {qualityTimePeriod === 'daily' ? "Today\'s Score" : qualityTimePeriod === 'weekly' ? "This Week" : "This Month"}
              </p>
              <p className="text-sm font-bold text-blue-900">
                {qualityTimePeriod === 'daily' ? '6.2' : qualityTimePeriod === 'weekly' ? '7.6' : '7.8'}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-2">
              <p className="text-xs text-purple-600 font-medium">
                {qualityTimePeriod === 'daily' ? "Daily Avg" : qualityTimePeriod === 'weekly' ? "Weekly Avg" : "Monthly Avg"}
              </p>
              <p className="text-sm font-bold text-purple-900">
                {qualityTimePeriod === 'daily' ? '6.9' : qualityTimePeriod === 'weekly' ? '7.3' : '7.3'}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-2">
              <p className="text-xs text-green-600 font-medium">Trend</p>
              <p className="text-sm font-bold text-green-900">
                {qualityTimePeriod === 'daily' ? '+0.4' : qualityTimePeriod === 'weekly' ? '+0.7' : '+1.0'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Staff Performance */}
        <motion.div
          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Staff Performance</h3>
              <p className="text-xs text-gray-600 mb-4">Leads generated by each staff member</p>
              
              {/* Time Period Switcher */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStaffTimePeriod('daily')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    staffTimePeriod === 'daily'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setStaffTimePeriod('weekly')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    staffTimePeriod === 'weekly'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setStaffTimePeriod('monthly')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    staffTimePeriod === 'monthly'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <Award className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={staffData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <defs>
                  <linearGradient id="staffBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="staff"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  height={60}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="leads"
                  fill="url(#staffBarGradient)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-center">
            <div className="bg-green-50 rounded-lg p-2">
              <p className="text-xs text-green-600 font-medium">Top Performer</p>
              <p className="text-sm font-bold text-green-900">
                {staffData.reduce((max, staff) => staff.leads > max.leads ? staff : max).staff.split(' ')[0]}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-2">
              <p className="text-xs text-blue-600 font-medium">Total Leads</p>
              <p className="text-sm font-bold text-blue-900">
                {staffData.reduce((sum, staff) => sum + staff.leads, 0)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* CEO Actionable Insights */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h4 className="text-sm font-semibold text-blue-900">Conversion Performance</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-blue-700">Weekly Growth Rate</span>
              <span className="text-sm font-bold text-blue-900">+29%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-blue-700">Best Performing Day</span>
              <span className="text-sm font-bold text-blue-900">Friday</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-blue-700">Monthly Target Progress</span>
              <span className="text-sm font-bold text-blue-900">87%</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-5 h-5 text-amber-600" />
            <h4 className="text-sm font-semibold text-amber-900">Lead Quality Insights</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-amber-700">Quality Improvement</span>
              <span className="text-sm font-bold text-amber-900">+8.5%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-amber-700">Quality Consistency</span>
              <span className="text-sm font-bold text-amber-900">Stable</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-amber-700">Optimal Range</span>
              <span className="text-sm font-bold text-amber-900">7.0-7.8</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
