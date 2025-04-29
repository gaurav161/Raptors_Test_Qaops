import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FolderKanban, 
  ClipboardCheck, 
  PlayCircle, 
  Bug, 
  BrainCircuit, 
  BarChartBig, 
  Settings,
  Users,
  Key
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

type SidebarProps = {
  currentModule: string;
};

export default function Sidebar({ currentModule }: SidebarProps) {
  const { projectId, workspaceId } = useParams();
  
  const { data: projects } = useQuery<Project[]>({
    queryKey: workspaceId ? [`/api/workspaces/${workspaceId}/projects`] : ['/api/projects'],
    enabled: !!workspaceId,
  });
  
  const moduleLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, href: '/' },
  ];
  
  const projectLinks = projects?.map(project => ({
    id: `project-${project.id}`,
    label: project.name,
    icon: <FolderKanban className="h-5 w-5" />,
    href: `/project/${project.id}/test-cases`
  })) || [];
  
  const testManagementLinks = [
    { id: 'test-cases', label: 'Test Cases', icon: <ClipboardCheck className="h-5 w-5" />, href: projectId ? `/project/${projectId}/test-cases` : '#' },
    { id: 'test-execution', label: 'Test Execution', icon: <PlayCircle className="h-5 w-5" />, href: projectId ? `/project/${projectId}/test-execution` : '#' },
    { id: 'defects', label: 'Defects', icon: <Bug className="h-5 w-5" />, href: projectId ? `/project/${projectId}/defects` : '#' },
  ];
  
  const aiToolsLinks = [
    { id: 'ai-generation', label: 'AI Test Generation', icon: <BrainCircuit className="h-5 w-5" />, href: '#' },
    { id: 'risk-analysis', label: 'Risk Analysis', icon: <BarChartBig className="h-5 w-5" />, href: '#' },
  ];
  
  const reportLinks = [
    { id: 'reports', label: 'Reports', icon: <BarChartBig className="h-5 w-5" />, href: projectId ? `/project/${projectId}/reports` : '#' },
  ];
  
  const settingsLinks = [
    { id: 'members', label: 'Members & Roles', icon: <Users className="h-5 w-5" />, href: '#' },
    { id: 'workspace-settings', label: 'Workspace Settings', icon: <Settings className="h-5 w-5" />, href: '#' },
    { id: 'api-integration', label: 'API & Integrations', icon: <Key className="h-5 w-5" />, href: '#' },
  ];
  
  const renderNavLink = (link: { id: string, label: string, icon: React.ReactNode, href: string }) => {
    const isActive = currentModule === link.id;
    
    return (
      <Link key={link.id} href={link.href}>
        <a className={cn(
          "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors",
          isActive && "bg-primary/10 border-l-2 border-primary"
        )}>
          <span className={cn("mr-2 text-gray-500", isActive && "text-primary")}>{link.icon}</span>
          <span>{link.label}</span>
        </a>
      </Link>
    );
  };
  
  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:block overflow-y-auto">
      <nav className="px-4 py-4">
        <div className="space-y-1">
          {moduleLinks.map(renderNavLink)}
          
          {/* Projects section */}
          <div className="pt-2">
            <div className="flex items-center justify-between px-3 py-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Projects</h3>
              <Link href="/workspaces">
                <Button variant="ghost" size="icon" className="h-5 w-5 text-gray-500 hover:text-primary">
                  <span className="sr-only">Add Project</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </Button>
              </Link>
            </div>
            
            {projectLinks.length > 0 ? (
              projectLinks.map(renderNavLink)
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                No projects found
              </div>
            )}
          </div>
          
          {/* Test Cases section */}
          <Accordion type="single" collapsible defaultValue="test-management">
            <AccordionItem value="test-management" className="border-b-0">
              <AccordionTrigger className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:no-underline">
                Test Management
              </AccordionTrigger>
              <AccordionContent className="pt-1 pb-0">
                {testManagementLinks.map(renderNavLink)}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          {/* AI Tools section */}
          <Accordion type="single" collapsible defaultValue="ai-tools">
            <AccordionItem value="ai-tools" className="border-b-0">
              <AccordionTrigger className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:no-underline">
                AI Tools
              </AccordionTrigger>
              <AccordionContent className="pt-1 pb-0">
                {aiToolsLinks.map(renderNavLink)}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          {/* Reports section */}
          <Accordion type="single" collapsible defaultValue="analytics">
            <AccordionItem value="analytics" className="border-b-0">
              <AccordionTrigger className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:no-underline">
                Analytics
              </AccordionTrigger>
              <AccordionContent className="pt-1 pb-0">
                {reportLinks.map(renderNavLink)}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          {/* Settings section */}
          <Accordion type="single" collapsible defaultValue="settings">
            <AccordionItem value="settings" className="border-b-0">
              <AccordionTrigger className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:no-underline">
                Settings
              </AccordionTrigger>
              <AccordionContent className="pt-1 pb-0">
                {settingsLinks.map(renderNavLink)}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </nav>
    </aside>
  );
}
