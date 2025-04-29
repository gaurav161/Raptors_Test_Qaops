import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Download, Upload, Plus, Search, Filter, TableIcon, ListIcon } from "lucide-react";
import { Project, Folder, TestCase } from "@shared/schema";
import FolderTree from "@/components/test-case/folder-tree";
import TestCaseList from "@/components/test-case/test-case-list";
import TestCaseForm from "@/components/test-case/test-case-form";

export default function TestCasesPage() {
  const { projectId } = useParams();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeFolder, setActiveFolder] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !!projectId,
  });
  
  const { data: folders } = useQuery<Folder[]>({
    queryKey: [`/api/projects/${projectId}/folders`],
    enabled: !!projectId,
  });
  
  const { data: testCases } = useQuery<TestCase[]>({
    queryKey: [
      activeFolder 
        ? `/api/folders/${activeFolder}/test-cases` 
        : `/api/projects/${projectId}/test-cases`
    ],
    enabled: !!projectId,
  });
  
  const handleFolderSelect = (folderId: number | null) => {
    setActiveFolder(folderId);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const filteredTestCases = testCases?.filter(testCase => 
    searchQuery 
      ? testCase.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        testCase.test_id.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentModule="test-cases" />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
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
            <span className="text-gray-800">Test Cases</span>
          </div>
          
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Test Case Repository</h1>
              <p className="mt-1 text-sm text-gray-500">Manage and organize your test cases</p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <a href="/api/test-cases/sample-template" download="test-cases-template.csv" className="absolute inset-0" aria-hidden="true" />
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Sample File
                </Button>
              </div>
              <Button variant="outline" onClick={() => document.getElementById('csv-file-upload')?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Import
                <input
                  id="csv-file-upload"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    // Handle CSV upload logic
                    const file = e.target.files?.[0];
                    if (file) {
                      // Reset the input value so the same file can be selected again
                      e.target.value = '';
                      // TODO: Implement actual CSV import logic
                      alert('CSV import functionality will be implemented in a future update.');
                    }
                  }}
                />
              </Button>
              <a 
                href={projectId ? `/api/projects/${projectId}/test-cases/export` : '#'} 
                download={`test-cases-project-${projectId}.csv`}
                className={!projectId ? 'pointer-events-none opacity-50' : ''}
              >
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </a>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Test Case
              </Button>
            </div>
          </div>
          
          {/* Content layout: Two panels */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Folder tree panel */}
            <div className="w-full lg:w-1/4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <FolderTree 
                folders={folders || []} 
                onSelectFolder={handleFolderSelect} 
                selectedFolderId={activeFolder}
                projectId={parseInt(projectId!)}
              />
            </div>
            
            {/* Test cases panel */}
            <div className="w-full lg:w-3/4 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Input 
                        type="text" 
                        placeholder="Search test cases..." 
                        className="pl-9" 
                        value={searchQuery}
                        onChange={handleSearchChange}
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">View:</span>
                      <Button variant="ghost" size="icon" className="p-1.5 text-primary bg-gray-100">
                        <TableIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="p-1.5 text-gray-500 hover:text-primary">
                        <ListIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Button variant="outline" size="sm">
                      <Filter className="mr-1 h-4 w-4" />
                      Filter
                    </Button>
                  </div>
                </div>
              </div>
              
              <TestCaseList testCases={filteredTestCases || []} />
            </div>
          </div>
        </main>
      </div>
      
      {/* Test Case Creation Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Create New Test Case</DialogTitle>
          </DialogHeader>
          <TestCaseForm 
            projectId={parseInt(projectId!)} 
            folders={folders || []} 
            onSuccess={() => {
              setIsCreateModalOpen(false);
            }}
            initialFolderId={activeFolder}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
