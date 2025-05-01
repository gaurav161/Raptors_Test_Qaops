import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email format"),
  name: z.string().optional(),
});

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      name: "",
    },
  });

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const onLoginSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: z.infer<typeof registerSchema>) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Hero Section */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary to-secondary flex-col justify-center items-center text-white p-10">
        <div className="max-w-md">
          <div className="flex items-center mb-8">
            <svg className="h-12 w-12 mr-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2L2,12H6V22H18V12H22L12,2Z"/>
            </svg>
            <h1 className="text-3xl font-bold">RaptorTest</h1>
          </div>
          
          {/* Illustration SVG */}
          <div className="w-full flex justify-center mb-6">
            <svg className="w-64 h-64" viewBox="0 0 600 500" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g opacity="0.8">
                {/* Background shapes */}
                <circle cx="300" cy="250" r="200" fill="white" fillOpacity="0.1" />
                <circle cx="300" cy="250" r="150" fill="white" fillOpacity="0.1" />
                
                {/* Clipboard */}
                <rect x="200" y="100" width="200" height="300" rx="10" fill="white" />
                <rect x="220" y="120" width="160" height="260" rx="5" fill="#f0f0f0" />
                <rect x="240" y="140" width="120" height="20" rx="3" fill="#d0d0d0" />
                
                {/* Checkmarks and items */}
                <circle cx="250" cy="180" r="10" fill="#60a5fa" />
                <path d="M245 180L248 184L255 176" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="270" y="175" width="70" height="10" rx="2" fill="#d0d0d0" />
                
                <circle cx="250" cy="220" r="10" fill="#60a5fa" />
                <path d="M245 220L248 224L255 216" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="270" y="215" width="70" height="10" rx="2" fill="#d0d0d0" />
                
                <circle cx="250" cy="260" r="10" fill="#60a5fa" />
                <path d="M245 260L248 264L255 256" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="270" y="255" width="70" height="10" rx="2" fill="#d0d0d0" />
                
                <circle cx="250" cy="300" r="10" fill="#d0d0d0" />
                <rect x="270" y="295" width="70" height="10" rx="2" fill="#d0d0d0" />
                
                <circle cx="250" cy="340" r="10" fill="#d0d0d0" />
                <rect x="270" y="335" width="70" height="10" rx="2" fill="#d0d0d0" />
                
                {/* Report graphic on right */}
                <rect x="420" y="200" width="80" height="120" rx="5" fill="white" />
                <rect x="430" y="210" width="60" height="10" rx="2" fill="#60a5fa" />
                <rect x="430" y="230" width="40" height="10" rx="2" fill="#d0d0d0" />
                <rect x="430" y="250" width="50" height="10" rx="2" fill="#d0d0d0" />
                <rect x="430" y="270" width="30" height="10" rx="2" fill="#d0d0d0" />
                
                {/* Stats chart */}
                <rect x="100" y="200" width="80" height="120" rx="5" fill="white" />
                <rect x="110" y="210" width="60" height="80" rx="2" fill="#f0f0f0" />
                <rect x="120" y="270" width="10" height="15" rx="1" fill="#60a5fa" />
                <rect x="135" y="250" width="10" height="35" rx="1" fill="#60a5fa" />
                <rect x="150" y="230" width="10" height="55" rx="1" fill="#60a5fa" />
              </g>
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold mb-4">Modern Test Management Platform</h2>
          <p className="text-lg mb-6">
            Streamline your testing process with our comprehensive test management solution. Create, organize, and execute test cases with ease.
          </p>
          <div className="space-y-4">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Intuitive test case management</span>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Collaborative workspace</span>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Comprehensive reporting</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Auth Forms */}
      <div className="flex-1 flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center mb-2">
                <div className="mr-3">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="40" height="40" rx="8" fill="#4f46e5" fillOpacity="0.1" />
                    <path d="M25 15H15C13.8954 15 13 15.8954 13 17V27C13 28.1046 13.8954 29 15 29H25C26.1046 29 27 28.1046 27 27V17C27 15.8954 26.1046 15 25 15Z" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M21 19H19V25H21V19Z" fill="#4f46e5" />
                    <path d="M25 19H23V22H25V19Z" fill="#4f46e5" />
                    <path d="M17 22H15V25H17V22Z" fill="#4f46e5" />
                    <path d="M20 10L23 13H17L20 10Z" fill="#4f46e5" />
                    <path d="M20 10V15" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">Welcome to RaptorTest</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your account
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs
                defaultValue="login"
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as "login" | "register")}
              >
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                
                {/* Login Form */}
                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Enter your password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "Logging in..." : "Login"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
                
                {/* Register Form */}
                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Choose a username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter your email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Choose a password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-gray-500">
                {activeTab === "login" 
                  ? "Don't have an account? " 
                  : "Already have an account? "}
                <button 
                  onClick={() => setActiveTab(activeTab === "login" ? "register" : "login")}
                  className="text-primary hover:underline"
                >
                  {activeTab === "login" ? "Register" : "Login"}
                </button>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
