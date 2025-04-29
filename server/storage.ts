import { 
  users, type User, type InsertUser,
  workspaces, type Workspace, type InsertWorkspace,
  workspaceMembers, type WorkspaceMember, type InsertWorkspaceMember,
  projects, type Project, type InsertProject,
  folders, type Folder, type InsertFolder,
  testCases, type TestCase, type InsertTestCase,
  testExecutions, type TestExecution, type InsertTestExecution,
  testExecutionItems, type TestExecutionItem, type InsertTestExecutionItem
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Workspace methods
  getWorkspace(id: number): Promise<Workspace | undefined>;
  getWorkspacesByUserId(userId: number): Promise<Workspace[]>;
  createWorkspace(workspace: InsertWorkspace): Promise<Workspace>;
  
  // Workspace members methods
  addWorkspaceMember(member: InsertWorkspaceMember): Promise<WorkspaceMember>;
  getWorkspaceMembers(workspaceId: number): Promise<WorkspaceMember[]>;
  isWorkspaceMember(workspaceId: number, userId: number): Promise<boolean>;
  
  // Project methods
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByWorkspaceId(workspaceId: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  
  // Folder methods
  getFolder(id: number): Promise<Folder | undefined>;
  getFoldersByProjectId(projectId: number): Promise<Folder[]>;
  createFolder(folder: InsertFolder): Promise<Folder>;
  
  // Test case methods
  getTestCase(id: number): Promise<TestCase | undefined>;
  getTestCasesByProjectId(projectId: number): Promise<TestCase[]>;
  getTestCasesByFolderId(folderId: number): Promise<TestCase[]>;
  createTestCase(testCase: InsertTestCase): Promise<TestCase>;
  getTestCaseCount(projectId: number): Promise<number>;
  
  // Test execution methods
  getTestExecution(id: number): Promise<TestExecution | undefined>;
  getTestExecutionsByProjectId(projectId: number): Promise<TestExecution[]>;
  createTestExecution(execution: InsertTestExecution): Promise<TestExecution>;
  
  // Test execution item methods
  getTestExecutionItem(id: number): Promise<TestExecutionItem | undefined>;
  getTestExecutionItems(executionId: number): Promise<TestExecutionItem[]>;
  addTestExecutionItem(item: InsertTestExecutionItem): Promise<TestExecutionItem>;
  updateTestExecutionItem(id: number, data: Partial<TestExecutionItem>): Promise<TestExecutionItem>;
  
  // Session store
  sessionStore: any;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private workspaces: Map<number, Workspace>;
  private workspaceMembers: Map<number, WorkspaceMember>;
  private projects: Map<number, Project>;
  private folders: Map<number, Folder>;
  private testCases: Map<number, TestCase>;
  private testExecutions: Map<number, TestExecution>;
  private testExecutionItems: Map<number, TestExecutionItem>;
  
  sessionStore: any;
  
  private currentUserId: number;
  private currentWorkspaceId: number;
  private currentWorkspaceMemberId: number;
  private currentProjectId: number;
  private currentFolderId: number;
  private currentTestCaseId: number;
  private currentTestExecutionId: number;
  private currentTestExecutionItemId: number;

  constructor() {
    this.users = new Map();
    this.workspaces = new Map();
    this.workspaceMembers = new Map();
    this.projects = new Map();
    this.folders = new Map();
    this.testCases = new Map();
    this.testExecutions = new Map();
    this.testExecutionItems = new Map();
    
    this.currentUserId = 1;
    this.currentWorkspaceId = 1;
    this.currentWorkspaceMemberId = 1;
    this.currentProjectId = 1;
    this.currentFolderId = 1;
    this.currentTestCaseId = 1;
    this.currentTestExecutionId = 1;
    this.currentTestExecutionItemId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...userData, 
      id,
      created_at: new Date()
    };
    this.users.set(id, user);
    return user;
  }
  
  // Workspace methods
  async getWorkspace(id: number): Promise<Workspace | undefined> {
    return this.workspaces.get(id);
  }
  
  async getWorkspacesByUserId(userId: number): Promise<Workspace[]> {
    // Find all workspace memberships for the user
    const memberships = Array.from(this.workspaceMembers.values())
      .filter(member => member.user_id === userId);
    
    // Get all workspaces for these memberships
    const workspaces = memberships.map(
      membership => this.workspaces.get(membership.workspace_id)
    ).filter(workspace => workspace !== undefined) as Workspace[];
    
    return workspaces;
  }
  
  async createWorkspace(workspaceData: InsertWorkspace): Promise<Workspace> {
    const id = this.currentWorkspaceId++;
    const workspace: Workspace = {
      ...workspaceData,
      id,
      created_at: new Date()
    };
    this.workspaces.set(id, workspace);
    return workspace;
  }
  
  // Workspace members methods
  async addWorkspaceMember(memberData: InsertWorkspaceMember): Promise<WorkspaceMember> {
    const id = this.currentWorkspaceMemberId++;
    const member: WorkspaceMember = {
      ...memberData,
      id
    };
    this.workspaceMembers.set(id, member);
    return member;
  }
  
  async getWorkspaceMembers(workspaceId: number): Promise<WorkspaceMember[]> {
    return Array.from(this.workspaceMembers.values())
      .filter(member => member.workspace_id === workspaceId);
  }
  
  async isWorkspaceMember(workspaceId: number, userId: number): Promise<boolean> {
    return Array.from(this.workspaceMembers.values())
      .some(member => member.workspace_id === workspaceId && member.user_id === userId);
  }
  
  // Project methods
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }
  
  async getProjectsByWorkspaceId(workspaceId: number): Promise<Project[]> {
    return Array.from(this.projects.values())
      .filter(project => project.workspace_id === workspaceId);
  }
  
  async createProject(projectData: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const project: Project = {
      ...projectData,
      id,
      created_at: new Date()
    };
    this.projects.set(id, project);
    return project;
  }
  
  // Folder methods
  async getFolder(id: number): Promise<Folder | undefined> {
    return this.folders.get(id);
  }
  
  async getFoldersByProjectId(projectId: number): Promise<Folder[]> {
    return Array.from(this.folders.values())
      .filter(folder => folder.project_id === projectId);
  }
  
  async createFolder(folderData: InsertFolder): Promise<Folder> {
    const id = this.currentFolderId++;
    const folder: Folder = {
      ...folderData,
      id,
      created_at: new Date()
    };
    this.folders.set(id, folder);
    return folder;
  }
  
  // Test case methods
  async getTestCase(id: number): Promise<TestCase | undefined> {
    return this.testCases.get(id);
  }
  
  async getTestCasesByProjectId(projectId: number): Promise<TestCase[]> {
    return Array.from(this.testCases.values())
      .filter(testCase => testCase.project_id === projectId);
  }
  
  async getTestCasesByFolderId(folderId: number): Promise<TestCase[]> {
    return Array.from(this.testCases.values())
      .filter(testCase => testCase.folder_id === folderId);
  }
  
  async createTestCase(testCaseData: InsertTestCase): Promise<TestCase> {
    const id = this.currentTestCaseId++;
    const now = new Date();
    const testCase: TestCase = {
      ...testCaseData,
      id,
      created_at: now,
      updated_at: now
    };
    this.testCases.set(id, testCase);
    return testCase;
  }
  
  async getTestCaseCount(projectId: number): Promise<number> {
    return Array.from(this.testCases.values())
      .filter(testCase => testCase.project_id === projectId)
      .length;
  }
  
  // Test execution methods
  async getTestExecution(id: number): Promise<TestExecution | undefined> {
    return this.testExecutions.get(id);
  }
  
  async getTestExecutionsByProjectId(projectId: number): Promise<TestExecution[]> {
    return Array.from(this.testExecutions.values())
      .filter(execution => execution.project_id === projectId);
  }
  
  async createTestExecution(executionData: InsertTestExecution): Promise<TestExecution> {
    const id = this.currentTestExecutionId++;
    const execution: TestExecution = {
      ...executionData,
      id,
      created_at: new Date()
    };
    this.testExecutions.set(id, execution);
    return execution;
  }
  
  // Test execution item methods
  async getTestExecutionItem(id: number): Promise<TestExecutionItem | undefined> {
    return this.testExecutionItems.get(id);
  }
  
  async getTestExecutionItems(executionId: number): Promise<TestExecutionItem[]> {
    return Array.from(this.testExecutionItems.values())
      .filter(item => item.execution_id === executionId);
  }
  
  async addTestExecutionItem(itemData: InsertTestExecutionItem): Promise<TestExecutionItem> {
    const id = this.currentTestExecutionItemId++;
    const item: TestExecutionItem = {
      ...itemData,
      id,
      result: null,
      comments: null,
      executed_by: null,
      executed_at: null
    };
    this.testExecutionItems.set(id, item);
    return item;
  }
  
  async updateTestExecutionItem(id: number, data: Partial<TestExecutionItem>): Promise<TestExecutionItem> {
    const item = this.testExecutionItems.get(id);
    if (!item) {
      throw new Error("Test execution item not found");
    }
    
    const updatedItem = {
      ...item,
      ...data
    };
    this.testExecutionItems.set(id, updatedItem);
    return updatedItem;
  }
}

export const storage = new MemStorage();
