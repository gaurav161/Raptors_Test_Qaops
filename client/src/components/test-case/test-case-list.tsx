import { useState } from "react";
import { TestCase } from "@shared/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import TestCaseForm from "./test-case-form";
import { formatDistanceToNow } from "date-fns";

interface TestCaseListProps {
  testCases: TestCase[];
}

export default function TestCaseList({ testCases }: TestCaseListProps) {
  const [selectedTestCases, setSelectedTestCases] = useState<number[]>([]);
  const [viewingTestCase, setViewingTestCase] = useState<TestCase | null>(null);
  
  const handleToggleSelect = (testCaseId: number) => {
    setSelectedTestCases(prev => 
      prev.includes(testCaseId)
        ? prev.filter(id => id !== testCaseId)
        : [...prev, testCaseId]
    );
  };
  
  const handleToggleSelectAll = () => {
    if (selectedTestCases.length === testCases.length) {
      setSelectedTestCases([]);
    } else {
      setSelectedTestCases(testCases.map(tc => tc.id));
    }
  };
  
  const handleViewTestCase = (testCase: TestCase) => {
    setViewingTestCase(testCase);
  };
  
  const getPriorityBadge = (priority: string) => {
    const classes = {
      "High": "bg-red-100 text-red-800",
      "Medium": "bg-yellow-100 text-yellow-800",
      "Low": "bg-green-100 text-green-800",
    };
    
    return (
      <Badge className={classes[priority as keyof typeof classes] || classes["Medium"]}>
        {priority}
      </Badge>
    );
  };
  
  const getStatusBadge = (status: string) => {
    const classes = {
      "Passed": "bg-green-100 text-green-800",
      "Failed": "bg-red-100 text-red-800",
      "Blocked": "bg-yellow-100 text-yellow-800",
      "Not Run": "bg-gray-100 text-gray-800",
      "Draft": "bg-blue-100 text-blue-800",
    };
    
    return (
      <Badge className={classes[status as keyof typeof classes] || classes["Not Run"]}>
        {status}
      </Badge>
    );
  };

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedTestCases.length === testCases.length && testCases.length > 0} 
                  onCheckedChange={handleToggleSelectAll}
                />
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {testCases.length > 0 ? (
              testCases.map((testCase) => (
                <TableRow key={testCase.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleViewTestCase(testCase)}>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox 
                      checked={selectedTestCases.includes(testCase.id)} 
                      onCheckedChange={() => handleToggleSelect(testCase.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{testCase.test_id}</TableCell>
                  <TableCell className="max-w-md">
                    <div className="truncate font-medium">{testCase.name}</div>
                  </TableCell>
                  <TableCell>{getPriorityBadge(testCase.priority)}</TableCell>
                  <TableCell>{getStatusBadge(testCase.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${testCase.created_by}`} />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">User {testCase.created_by}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(testCase.updated_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No test cases found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination (Simplified for this implementation) */}
      <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div className="flex-1 flex justify-between sm:hidden">
          <Button variant="outline" size="sm" disabled={testCases.length === 0}>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled={testCases.length === 0}>
            Next
          </Button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing
              <span className="font-medium mx-1">1</span>
              to
              <span className="font-medium mx-1">{testCases.length}</span>
              of
              <span className="font-medium mx-1">{testCases.length}</span>
              results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <Button variant="outline" size="icon" className="rounded-l-md" disabled={testCases.length === 0}>
                <span className="sr-only">Previous</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="bg-primary text-white" disabled={testCases.length === 0}>
                1
              </Button>
              <Button variant="outline" size="icon" className="rounded-r-md" disabled={testCases.length === 0}>
                <span className="sr-only">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </nav>
          </div>
        </div>
      </div>
      
      {/* View/Edit Test Case Dialog */}
      <Dialog open={!!viewingTestCase} onOpenChange={(open) => !open && setViewingTestCase(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {viewingTestCase?.test_id}: {viewingTestCase?.name}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            {viewingTestCase && (
              <TestCaseForm 
                projectId={viewingTestCase.project_id}
                initialData={viewingTestCase}
                isReadOnly
                onSuccess={() => setViewingTestCase(null)}
              />
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Add missing imports
import { ChevronLeft, ChevronRight } from "lucide-react";
