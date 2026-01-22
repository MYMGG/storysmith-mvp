// components/ProjectSelector.js
// Dropdown project selector for header - ported from V5
// Uses IndexedDB-backed projectStore for persistence

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import * as projectStore from '../lib/projectStore.js';
import { BookOpen, ChevronDown, Plus, Book, Loader2 } from 'lucide-react';

/**
 * ProjectSelector - Dropdown to select/create projects in header.
 */
export default function ProjectSelector() {
	const router = useRouter();
	const [projects, setProjects] = useState([]);
	const [activeProjectId, setActiveProjectId] = useState(null);
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		loadProjects();

		const handleProjectChange = () => {
			const activeId = projectStore.getActiveProjectId();
			setActiveProjectId(activeId);
		};

		window.addEventListener('projectChanged', handleProjectChange);
		return () => window.removeEventListener('projectChanged', handleProjectChange);
	}, []);

	async function loadProjects() {
		try {
			const allProjects = await projectStore.getAllProjects();
			setProjects(allProjects);
			const activeId = projectStore.getActiveProjectId();
			setActiveProjectId(activeId);
		} catch (error) {
			console.error('Failed to load projects:', error);
		} finally {
			setIsLoading(false);
		}
	}

	function handleSelectProject(projectId) {
		projectStore.setActiveProjectId(projectId);
		setActiveProjectId(projectId);
		setIsOpen(false);
		window.dispatchEvent(new CustomEvent('projectChanged', { detail: { projectId } }));
		// Optionally refresh page or update state
	}

	const activeProject = projects.find((p) => p.id === activeProjectId);

	if (isLoading) {
		return (
			<div className="flex items-center gap-2 px-3 py-1.5 bg-parchment-deep/20 rounded-md border border-leather/10">
				<Loader2 className="w-4 h-4 text-leather/40 animate-spin" />
				<span className="text-xs font-medium text-leather/60">Loading...</span>
			</div>
		);
	}

	return (
		<div className="relative">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center gap-2 px-3 py-1.5 bg-parchment border border-leather/20 rounded-lg shadow-sm hover:border-gold hover:shadow-md transition-all group min-w-[150px] justify-between"
			>
				<div className="flex items-center gap-2">
					<BookOpen className="w-4 h-4 text-gold group-hover:text-gold/80 transition-colors" />
					<span className="text-sm font-bold text-ink font-heading truncate max-w-[100px]">
						{activeProject ? activeProject.title : 'Select'}
					</span>
				</div>
				<ChevronDown
					className={`w-3 h-3 text-leather/40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
				/>
			</button>

			{isOpen && (
				<>
					<div className="absolute right-0 mt-2 w-64 bg-parchment border border-leather/20 rounded-lg shadow-xl z-50 overflow-hidden">
						<div className="p-1">
							<button
								onClick={() => {
									setIsOpen(false);
									router.push('/projects');
								}}
								className="w-full text-left px-4 py-2 text-sm text-gold hover:bg-parchment-deep/50 font-bold font-heading transition-colors flex items-center gap-2 rounded-md"
							>
								<Plus className="w-4 h-4" />
								Manage Chronicles
							</button>

							<div className="h-px bg-leather/10 my-1 mx-2" />

							<div className="max-h-48 overflow-y-auto">
								{projects.length === 0 ? (
									<div className="px-4 py-2 text-sm text-leather/40 italic text-center">
										No chronicles yet.
									</div>
								) : (
									projects.map((project) => (
										<button
											key={project.id}
											onClick={() => handleSelectProject(project.id)}
											className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 rounded-md
                        ${project.id === activeProjectId
													? 'bg-parchment-deep text-ink font-bold border border-leather/10'
													: 'text-ink/70 hover:bg-parchment-deep/30 hover:text-ink'
												}`}
										>
											<Book className={`w-4 h-4 ${project.id === activeProjectId ? 'text-gold' : 'text-leather/30'}`} />
											<span className="truncate">{project.title}</span>
										</button>
									))
								)}
							</div>
						</div>
					</div>

					{/* Click outside to close */}
					<div
						className="fixed inset-0 z-40"
						onClick={() => setIsOpen(false)}
					/>
				</>
			)}
		</div>
	);
}
