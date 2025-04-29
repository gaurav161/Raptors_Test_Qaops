import { Project } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ClipboardList, PlayCircle, ChartBar } from "lucide-react";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{project.name}</CardTitle>
        <CardDescription>
          Created on {new Date(project.created_at).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500">
          {project.description || "No description provided"}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col space-y-3">
        <div className="grid grid-cols-3 gap-2 w-full">
          <Link href={`/project/${project.id}/test-cases`}>
            <Button variant="outline" size="sm" className="w-full">
              <ClipboardList className="mr-1 h-4 w-4" />
              Test Cases
            </Button>
          </Link>
          <Link href={`/project/${project.id}/test-execution`}>
            <Button variant="outline" size="sm" className="w-full">
              <PlayCircle className="mr-1 h-4 w-4" />
              Execution
            </Button>
          </Link>
          <Link href={`/project/${project.id}/reports`}>
            <Button variant="outline" size="sm" className="w-full">
              <ChartBar className="mr-1 h-4 w-4" />
              Reports
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
