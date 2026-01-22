// lib/projectStore.js
// Project store - CRUD operations and active project management
// Uses IndexedDB for projects/storyStates, localStorage for activeProjectId
// Ported from storysmith-v5 (TypeScript -> JavaScript)

import * as db from './indexedDb.js';
import { createEmptyStoryState } from './storyState.js';

const ACTIVE_PROJECT_KEY = 'storysmith_mvp_active_project_id';

/**
 * Generate a simple UUID v4.
 * @returns {string}
 */
function generateUUID() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

/**
 * Get all projects.
 * @returns {Promise<Array<{id: string, title: string, createdAt: string, updatedAt: string}>>}
 */
export async function getAllProjects() {
	return db.getAll('projects');
}

/**
 * Get a single project by ID.
 * @param {string} id 
 * @returns {Promise<Object|null>}
 */
export async function getProject(id) {
	return db.get('projects', id);
}

/**
 * Create a new project with initial StoryState.
 * @param {string} title 
 * @returns {Promise<{id: string, title: string, createdAt: string, updatedAt: string}>}
 */
export async function createProject(title) {
	const now = new Date().toISOString();
	const project = {
		id: generateUUID(),
		title,
		createdAt: now,
		updatedAt: now,
	};

	// Create project
	await db.put('projects', project);

	// Create initial StoryState
	const storyState = createEmptyStoryState({
		story_data: { visual_style: '3D animated Film' },
	});
	await db.put('storyStates', {
		projectId: project.id,
		storyState,
	});

	return project;
}

/**
 * Update a project (title, updatedAt).
 * @param {string} id 
 * @param {{title?: string}} updates 
 * @returns {Promise<void>}
 */
export async function updateProject(id, updates) {
	const project = await getProject(id);
	if (!project) {
		throw new Error(`Project not found: ${id}`);
	}

	const updatedProject = {
		...project,
		...updates,
		updatedAt: new Date().toISOString(),
	};

	await db.put('projects', updatedProject);
}

/**
 * Delete a project and its StoryState.
 * @param {string} id 
 * @returns {Promise<void>}
 */
export async function deleteProject(id) {
	await db.deleteRecord('projects', id);
	await db.deleteRecord('storyStates', id);

	// Clear active project if it was the deleted one
	const activeId = getActiveProjectId();
	if (activeId === id) {
		clearActiveProjectId();
	}
}

/**
 * Get StoryState for a project.
 * @param {string} projectId 
 * @returns {Promise<Object|null>}
 */
export async function getStoryState(projectId) {
	const record = await db.get('storyStates', projectId);
	if (!record) return null;
	return record.storyState;
}

/**
 * Save StoryState for a project.
 * @param {string} projectId 
 * @param {Object} storyState 
 * @returns {Promise<void>}
 */
export async function saveStoryState(projectId, storyState) {
	const updatedState = {
		...storyState,
		last_updated: new Date().toISOString(),
	};

	await db.put('storyStates', {
		projectId,
		storyState: updatedState,
	});

	// Update project's updatedAt
	const project = await getProject(projectId);
	if (project) {
		await updateProject(projectId, { title: project.title });
	}
}

/**
 * Get active project ID from localStorage.
 * @returns {string|null}
 */
export function getActiveProjectId() {
	if (typeof window === 'undefined') return null;
	return localStorage.getItem(ACTIVE_PROJECT_KEY);
}

/**
 * Set active project ID in localStorage.
 * @param {string} id 
 */
export function setActiveProjectId(id) {
	if (typeof window === 'undefined') return;
	localStorage.setItem(ACTIVE_PROJECT_KEY, id);
}

/**
 * Clear active project ID from localStorage.
 */
export function clearActiveProjectId() {
	if (typeof window === 'undefined') return;
	localStorage.removeItem(ACTIVE_PROJECT_KEY);
}
