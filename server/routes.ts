import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertWorkspaceSchema, 
  insertProjectSchema, 
  insertFolderSchema,
  insertTestCaseSchema,
  insertTestExecutionSchema,
  insertTestExecutionItemSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Workspaces API
  app.get("/api/workspaces", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const workspaces = await storage.getWorkspacesByUserId(req.user.id);
      res.json(workspaces);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch workspaces" });
    }
  });

  app.post("/api/workspaces", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validated = insertWorkspaceSchema.parse({
        ...req.body,
        created_by: req.user.id,
      });
      
      const workspace = await storage.createWorkspace(validated);
      
      // Add creator as admin
      await storage.addWorkspaceMember({
        workspace_id: workspace.id,
        user_id: req.user.id,
        role: "admin"
      });
      
      res.status(201).json(workspace);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ errors: err.errors });
      }
      res.status(500).json({ message: "Failed to create workspace" });
    }
  });

  app.get("/api/workspaces/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const workspace = await storage.getWorkspace(parseInt(req.params.id));
      if (!workspace) {
        return res.status(404).json({ message: "Workspace not found" });
      }
      
      // Check if user is a member of this workspace
      const isMember = await storage.isWorkspaceMember(workspace.id, req.user.id);
      if (!isMember) {
        return res.status(403).json({ message: "Not authorized to access this workspace" });
      }
      
      res.json(workspace);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch workspace" });
    }
  });

  // Projects API
  app.get("/api/workspaces/:workspaceId/projects", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const workspaceId = parseInt(req.params.workspaceId);
      
      // Check if user is a member of this workspace
      const isMember = await storage.isWorkspaceMember(workspaceId, req.user.id);
      if (!isMember) {
        return res.status(403).json({ message: "Not authorized to access this workspace" });
      }
      
      const projects = await storage.getProjectsByWorkspaceId(workspaceId);
      res.json(projects);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post("/api/workspaces/:workspaceId/projects", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const workspaceId = parseInt(req.params.workspaceId);
      
      // Check if user is a member of this workspace
      const isMember = await storage.isWorkspaceMember(workspaceId, req.user.id);
      if (!isMember) {
        return res.status(403).json({ message: "Not authorized to access this workspace" });
      }
      
      const validated = insertProjectSchema.parse({
        ...req.body,
        workspace_id: workspaceId,
        created_by: req.user.id,
      });
      
      const project = await storage.createProject(validated);
      res.status(201).json(project);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ errors: err.errors });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const project = await storage.getProject(parseInt(req.params.id));
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if user is a member of the workspace that owns this project
      const isMember = await storage.isWorkspaceMember(project.workspace_id, req.user.id);
      if (!isMember) {
        return res.status(403).json({ message: "Not authorized to access this project" });
      }
      
      res.json(project);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  // Folders API
  app.get("/api/projects/:projectId/folders", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if user is a member of the workspace that owns this project
      const isMember = await storage.isWorkspaceMember(project.workspace_id, req.user.id);
      if (!isMember) {
        return res.status(403).json({ message: "Not authorized to access this project" });
      }
      
      const folders = await storage.getFoldersByProjectId(projectId);
      res.json(folders);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch folders" });
    }
  });

  app.post("/api/projects/:projectId/folders", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if user is a member of the workspace that owns this project
      const isMember = await storage.isWorkspaceMember(project.workspace_id, req.user.id);
      if (!isMember) {
        return res.status(403).json({ message: "Not authorized to access this project" });
      }
      
      const validated = insertFolderSchema.parse({
        ...req.body,
        project_id: projectId,
        created_by: req.user.id,
      });
      
      const folder = await storage.createFolder(validated);
      res.status(201).json(folder);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ errors: err.errors });
      }
      res.status(500).json({ message: "Failed to create folder" });
    }
  });

  // Test Cases API
  app.get("/api/projects/:projectId/test-cases", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if user is a member of the workspace that owns this project
      const isMember = await storage.isWorkspaceMember(project.workspace_id, req.user.id);
      if (!isMember) {
        return res.status(403).json({ message: "Not authorized to access this project" });
      }
      
      const testCases = await storage.getTestCasesByProjectId(projectId);
      res.json(testCases);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch test cases" });
    }
  });

  app.get("/api/folders/:folderId/test-cases", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const folderId = parseInt(req.params.folderId);
      const folder = await storage.getFolder(folderId);
      
      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }
      
      const project = await storage.getProject(folder.project_id);
      
      // Check if user is a member of the workspace that owns this project
      const isMember = await storage.isWorkspaceMember(project.workspace_id, req.user.id);
      if (!isMember) {
        return res.status(403).json({ message: "Not authorized to access this folder" });
      }
      
      const testCases = await storage.getTestCasesByFolderId(folderId);
      res.json(testCases);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch test cases" });
    }
  });

  app.post("/api/projects/:projectId/test-cases", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if user is a member of the workspace that owns this project
      const isMember = await storage.isWorkspaceMember(project.workspace_id, req.user.id);
      if (!isMember) {
        return res.status(403).json({ message: "Not authorized to access this project" });
      }
      
      // Generate test ID
      const count = await storage.getTestCaseCount(projectId);
      const testId = `TC-${(count + 1).toString().padStart(4, '0')}`;
      
      const validated = insertTestCaseSchema.parse({
        ...req.body,
        project_id: projectId,
        created_by: req.user.id,
        test_id: testId,
      });
      
      const testCase = await storage.createTestCase(validated);
      res.status(201).json(testCase);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ errors: err.errors });
      }
      res.status(500).json({ message: "Failed to create test case" });
    }
  });

  app.get("/api/test-cases/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const testCase = await storage.getTestCase(parseInt(req.params.id));
      
      if (!testCase) {
        return res.status(404).json({ message: "Test case not found" });
      }
      
      const project = await storage.getProject(testCase.project_id);
      
      // Check if user is a member of the workspace that owns this project
      const isMember = await storage.isWorkspaceMember(project.workspace_id, req.user.id);
      if (!isMember) {
        return res.status(403).json({ message: "Not authorized to access this test case" });
      }
      
      res.json(testCase);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch test case" });
    }
  });

  // Test Executions API
  app.get("/api/projects/:projectId/test-executions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if user is a member of the workspace that owns this project
      const isMember = await storage.isWorkspaceMember(project.workspace_id, req.user.id);
      if (!isMember) {
        return res.status(403).json({ message: "Not authorized to access this project" });
      }
      
      const testExecutions = await storage.getTestExecutionsByProjectId(projectId);
      res.json(testExecutions);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch test executions" });
    }
  });

  app.post("/api/projects/:projectId/test-executions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if user is a member of the workspace that owns this project
      const isMember = await storage.isWorkspaceMember(project.workspace_id, req.user.id);
      if (!isMember) {
        return res.status(403).json({ message: "Not authorized to access this project" });
      }
      
      const validated = insertTestExecutionSchema.parse({
        ...req.body,
        project_id: projectId,
        created_by: req.user.id,
      });
      
      const testExecution = await storage.createTestExecution(validated);
      
      // Add test cases to execution if they are provided
      if (req.body.test_case_ids && Array.isArray(req.body.test_case_ids)) {
        for (const testCaseId of req.body.test_case_ids) {
          await storage.addTestExecutionItem({
            execution_id: testExecution.id,
            test_case_id: testCaseId,
            status: "Not Run",
          });
        }
      }
      
      res.status(201).json(testExecution);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ errors: err.errors });
      }
      res.status(500).json({ message: "Failed to create test execution" });
    }
  });

  app.get("/api/test-executions/:id/items", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const executionId = parseInt(req.params.id);
      const execution = await storage.getTestExecution(executionId);
      
      if (!execution) {
        return res.status(404).json({ message: "Test execution not found" });
      }
      
      const project = await storage.getProject(execution.project_id);
      
      // Check if user is a member of the workspace that owns this project
      const isMember = await storage.isWorkspaceMember(project.workspace_id, req.user.id);
      if (!isMember) {
        return res.status(403).json({ message: "Not authorized to access this test execution" });
      }
      
      const items = await storage.getTestExecutionItems(executionId);
      res.json(items);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch test execution items" });
    }
  });

  app.patch("/api/test-execution-items/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const itemId = parseInt(req.params.id);
      const item = await storage.getTestExecutionItem(itemId);
      
      if (!item) {
        return res.status(404).json({ message: "Test execution item not found" });
      }
      
      const execution = await storage.getTestExecution(item.execution_id);
      const project = await storage.getProject(execution.project_id);
      
      // Check if user is a member of the workspace that owns this project
      const isMember = await storage.isWorkspaceMember(project.workspace_id, req.user.id);
      if (!isMember) {
        return res.status(403).json({ message: "Not authorized to update this test execution item" });
      }
      
      const updatedItem = await storage.updateTestExecutionItem(itemId, {
        ...req.body,
        executed_by: req.user.id,
        executed_at: new Date(),
      });
      
      res.json(updatedItem);
    } catch (err) {
      res.status(500).json({ message: "Failed to update test execution item" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
