import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Download, CalendarRange, Filter } from "lucide-react";
import { Project, TestCase, TestExecution, TestExecutionItem } from "@shared/schema";

export default function ReportsPage() {
  const { projectId } = useParams();
  const [timeRange, setTimeRange] = useState("last30days");
  
  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !!projectId,
  });
  
  const { data: testCases } = useQuery<TestCase[]>({
    queryKey: [`/api/projects/${projectId}/test-cases`],
    enabled: !!projectId,
  });
  
  const { data: testExecutions } = useQuery<TestExecution[]>({
    queryKey: [`/api/projects/${projectId}/test-executions`],
    enabled: !!projectId,
  });
  
  const testStatusData = [
    { name: 'Passed', value: 58, color: '#10B981' },
    { name: 'Failed', value: 14, color: '#EF4444' },
    { name: 'Blocked', value: 8, color: '#F59E0B' },
    { name: 'Not Run', value: 20, color: '#6B7280' },
  ];
  
  const testTypesData = [
    { name: 'Functional', value: 65, color: '#3B82F6' },
    { name: 'Performance', value: 15, color: '#8B5CF6' },
    { name: 'Security', value: 10, color: '#EC4899' },
    { name: 'Usability', value: 8, color: '#F59E0B' },
    { name: 'Regression', value: 12, color: '#10B981' },
  ];
  
  const testPriorityData = [
    { name: 'High', value: 30, color: '#EF4444' },
    { name: 'Medium', value: 45, color: '#F59E0B' },
    { name: 'Low', value: 25, color: '#10B981' },
  ];
  
  const testTrendData = [
    { month: 'Jan', passed: 42, failed: 12, blocked: 6 },
    { month: 'Feb', passed: 48, failed: 8, blocked: 4 },
    { month: 'Mar', passed: 52, failed: 10, blocked: 8 },
    { month: 'Apr', passed: 58, failed: 14, blocked: 8 },
    { month: 'May', passed: 60, failed: 10, blocked: 5 },
    { month: 'Jun', passed: 65, failed: 8, blocked: 2 },
  ];
  
  const executionProgress = [
    { date: '01/23', executed: 10, total: 80 },
    { date: '01/30', executed: 25, total: 80 },
    { date: '02/06', executed: 30, total: 80 },
    { date: '02/13', executed: 45, total: 80 },
    { date: '02/20', executed: 52, total: 80 },
    { date: '02/27', executed: 60, total: 80 },
    { date: '03/06', executed: 72, total: 80 },
  ];
  
  const defectData = [
    { severity: 'Critical', open: 2, closed: 3 },
    { severity: 'Major', open: 5, closed: 8 },
    { severity: 'Minor', open: 8, closed: 12 },
    { severity: 'Trivial', open: 3, closed: 7 },
  ];
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentModule="reports" />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Breadcrumbs */}
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Link href="/workspaces">
              <a className="hover:text-primary">Workspaces</a>
            </Link>
            <span className="mx-2">/</span>
            <Link href={`/workspace/${project?.workspace_id}/projects`}>
              <a className="hover:text-primary">Projects</a>
            </Link>
            <span className="mx-2">/</span>
            <Link href={`/project/${projectId}`}>
              <a className="hover:text-primary">{project?.name}</a>
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-800">Reports</span>
          </div>
          
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Test Reports & Analytics</h1>
              <p className="mt-1 text-sm text-gray-500">Insights and metrics about your testing process</p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
              <div className="flex items-center">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[180px]">
                    <CalendarRange className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last7days">Last 7 days</SelectItem>
                    <SelectItem value="last30days">Last 30 days</SelectItem>
                    <SelectItem value="last90days">Last 90 days</SelectItem>
                    <SelectItem value="thisYear">This year</SelectItem>
                    <SelectItem value="allTime">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>
          
          {/* Dashboard Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Test Cases</CardDescription>
                <CardTitle className="text-3xl">{testCases?.length || 246}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-green-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                  <span>12% growth</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Test Execution Rate</CardDescription>
                <CardTitle className="text-3xl">78%</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-green-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                  <span>5% increase</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Pass Rate</CardDescription>
                <CardTitle className="text-3xl">85%</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-green-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                  <span>3% increase</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Defects Identified</CardDescription>
                <CardTitle className="text-3xl">47</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-red-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                  </svg>
                  <span>8% increase</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-grid md:grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="execution">Execution</TabsTrigger>
              <TabsTrigger value="defects">Defects</TabsTrigger>
              <TabsTrigger value="coverage">Coverage</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Test Status Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Test Status</CardTitle>
                    <CardDescription>Current execution status breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={testStatusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {testStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Test Types</CardTitle>
                    <CardDescription>Distribution by test type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={testTypesData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {testTypesData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Test Priority</CardTitle>
                    <CardDescription>Distribution by priority level</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={testPriorityData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {testPriorityData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Test Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Test Results Trend</CardTitle>
                  <CardDescription>Results over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={testTrendData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="passed" stackId="a" fill="#10B981" name="Passed" />
                        <Bar dataKey="failed" stackId="a" fill="#EF4444" name="Failed" />
                        <Bar dataKey="blocked" stackId="a" fill="#F59E0B" name="Blocked" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Execution Tab */}
            <TabsContent value="execution" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Execution Progress</CardTitle>
                  <CardDescription>Test execution progress over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={executionProgress}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="executed" stroke="#3B82F6" name="Executed Tests" />
                        <Line type="monotone" dataKey="total" stroke="#9CA3AF" name="Total Tests" strokeDasharray="5 5" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Execution Statistics</CardTitle>
                    <CardDescription>Test execution summary</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total Test Executions</span>
                        <span className="font-bold">{testExecutions?.length || 12}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Executed Tests</span>
                        <span className="font-bold">187 / 246</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Execution Rate</span>
                        <span className="font-bold">76%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Average Execution Time</span>
                        <span className="font-bold">2.3 days</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Completed Test Cycles</span>
                        <span className="font-bold">8</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">In-Progress Test Cycles</span>
                        <span className="font-bold">4</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Test Executions</CardTitle>
                    <CardDescription>Latest test execution cycles</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(testExecutions || Array(5).fill(null)).slice(0, 5).map((execution, idx) => (
                        <div key={execution?.id || idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                          <div>
                            <p className="font-medium">{execution?.name || `Sprint ${22 - idx} Regression Tests`}</p>
                            <p className="text-xs text-gray-500">
                              {execution?.created_at 
                                ? new Date(execution.created_at).toLocaleDateString() 
                                : `${idx + 1} days ago`
                              }
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {execution?.status || (idx === 0 ? "In Progress" : "Completed")}
                            </p>
                            <p className="text-xs text-gray-500">
                              {Math.floor(70 + Math.random() * 20)}% pass rate
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Defects Tab */}
            <TabsContent value="defects" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Defect Summary</CardTitle>
                  <CardDescription>Overview of defects by severity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={defectData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="severity" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="open" fill="#EF4444" name="Open" />
                        <Bar dataKey="closed" fill="#10B981" name="Closed" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Defect Statistics</CardTitle>
                    <CardDescription>Summary of defect metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total Defects</span>
                        <span className="font-bold">47</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Open Defects</span>
                        <span className="font-bold">18</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Closed Defects</span>
                        <span className="font-bold">29</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Critical/Major Defects</span>
                        <span className="font-bold">18</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Average Resolution Time</span>
                        <span className="font-bold">3.5 days</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Defect Density</span>
                        <span className="font-bold">0.19 defects/test</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Defects</CardTitle>
                    <CardDescription>Latest reported defects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Array(5).fill(null).map((_, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                          <div>
                            <p className="font-medium">{
                              [
                                "User login fails with correct credentials",
                                "Payment form submits without validation",
                                "Product search returns incorrect results",
                                "Profile page layout breaks on mobile",
                                "Checkout process hangs on final step"
                              ][idx]
                            }</p>
                            <p className="text-xs text-gray-500">{`${idx + 1} days ago`}</p>
                          </div>
                          <div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              ["bg-red-100 text-red-800", "bg-red-100 text-red-800", "bg-yellow-100 text-yellow-800", "bg-yellow-100 text-yellow-800", "bg-green-100 text-green-800"][idx]
                            }`}>
                              {["Critical", "Major", "Major", "Minor", "Minor"][idx]}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Coverage Tab */}
            <TabsContent value="coverage" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Requirement Coverage</CardTitle>
                  <CardDescription>Test coverage by requirement area</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { area: "User Management", covered: 92, total: 100 },
                          { area: "Product Catalog", covered: 78, total: 100 },
                          { area: "Shopping Cart", covered: 85, total: 100 },
                          { area: "Checkout", covered: 95, total: 100 },
                          { area: "Order Management", covered: 67, total: 100 },
                          { area: "Payment Processing", covered: 88, total: 100 },
                        ]}
                        margin={{ top: 20, right: 30, left: 50, bottom: 20 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis type="category" dataKey="area" width={120} />
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Bar dataKey="covered" fill="#3B82F6" name="Coverage %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Coverage Statistics</CardTitle>
                    <CardDescription>Summary of test coverage metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Overall Test Coverage</span>
                        <span className="font-bold">84%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">High Priority Requirements Coverage</span>
                        <span className="font-bold">93%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total Requirements</span>
                        <span className="font-bold">187</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Covered Requirements</span>
                        <span className="font-bold">157</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Requirements with No Tests</span>
                        <span className="font-bold">30</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Tests per Requirement (avg)</span>
                        <span className="font-bold">1.6</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Coverage Gaps</CardTitle>
                    <CardDescription>Requirements with low or no test coverage</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Array(5).fill(null).map((_, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                          <div>
                            <p className="font-medium">{
                              [
                                "Admin user permission management",
                                "Refund processing workflow",
                                "Multiple shipping address support",
                                "Gift wrapping options",
                                "Customer loyalty program integration"
                              ][idx]
                            }</p>
                            <p className="text-xs text-gray-500">REQ-{1024 + idx}</p>
                          </div>
                          <div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              idx < 2 ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {idx < 2 ? "No Tests" : "Low Coverage"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
