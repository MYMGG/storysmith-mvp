// pages/projects.js
// Projects landing page - library of story chronicles
// Ported from storysmith-v5 (App Router -> Pages Router, TSX -> JSX)

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
	Plus, MoreVertical, Trash2, Edit2, Loader2,
	Book, Sword, Crown, Scroll, Feather, Mountain, Skull, Tent, Castle, Ship, Gem, Anchor, Gavel, Flame
} from 'lucide-react';
import * as projectStore from '../lib/projectStore.js';
import TranslucentHeader from '../components/TranslucentHeader';
import ProjectSelector from '../components/ProjectSelector';

// Visual Assets for book covers
const ICONS = [Book, Sword, Crown, Scroll, Feather, Mountain, Skull, Tent, Castle, Ship, Gem, Anchor, Gavel, Flame];
const SHAPES = ['circle', 'square', 'diamond', 'hexagon'];

export default function ProjectsPage() {
	const router = useRouter();
	const [projects, setProjects] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	// Create Mode
	const [isCreating, setIsCreating] = useState(false);
	const [newProjectTitle, setNewProjectTitle] = useState('');

	// Actions & Menus
	const [menuOpenId, setMenuOpenId] = useState(null);
	const [editingId, setEditingId] = useState(null);
	const [editTitle, setEditTitle] = useState('');
	const [deleteConfirmId, setDeleteConfirmId] = useState(null);

	// Refs for outside click detection
	const menuRef = useRef(null);

	useEffect(() => {
		loadProjects();

		const handleClickOutside = (event) => {
			if (menuRef.current && !menuRef.current.contains(event.target)) {
				setMenuOpenId(null);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	async function loadProjects() {
		try {
			const allProjects = await projectStore.getAllProjects();
			setProjects(allProjects.sort((a, b) =>
				new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
			));
		} catch (error) {
			console.error('Failed to load projects:', error);
		} finally {
			setIsLoading(false);
		}
	}

	async function handleCreate() {
		if (!newProjectTitle.trim()) return;
		setIsCreating(true);
		try {
			const project = await projectStore.createProject(newProjectTitle.trim());
			setNewProjectTitle('');
			projectStore.setActiveProjectId(project.id);
			window.dispatchEvent(new CustomEvent('projectChanged', { detail: { projectId: project.id } }));
			router.push('/'); // Go to main app with the new project
		} catch (error) {
			console.error(error);
		} finally {
			setIsCreating(false);
		}
	}

	async function handleOpenProject(projectId) {
		if (editingId === projectId || menuOpenId === projectId) return;
		projectStore.setActiveProjectId(projectId);
		router.push('/'); // Go to main app
	}

	async function handleSaveRename(id) {
		if (!editTitle.trim()) { setEditingId(null); return; }
		try {
			await projectStore.updateProject(id, { title: editTitle });
			await loadProjects();
		} catch (error) {
			console.error(error);
		} finally {
			setEditingId(null);
			setMenuOpenId(null);
		}
	}

	async function confirmDelete() {
		if (!deleteConfirmId) return;
		try {
			await projectStore.deleteProject(deleteConfirmId);
			await loadProjects();
		} catch (error) {
			console.error(error);
		} finally {
			setDeleteConfirmId(null);
		}
	}

	// Deterministic Randomizer Helper
	function getVisuals(id) {
		const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
		const Icon = ICONS[hash % ICONS.length];
		const shape = SHAPES[hash % SHAPES.length];
		return { Icon, shape };
	}

	if (isLoading) {
		return (
			<div className="min-h-screen bg-parchment flex items-center justify-center">
				<Loader2 className="w-8 h-8 text-leather/40 animate-spin" />
			</div>
		);
	}

	return (
		<>
			<Head>
				<title>StorySmith - Your Chronicles</title>
			</Head>
			<div className="min-h-screen bg-parchment flex flex-col">
				<TranslucentHeader
					rightSlot={<ProjectSelector />}
					onHomeClick={() => router.push('/projects')}
				/>
				<div className="flex-1 px-6 py-12 max-w-7xl mx-auto w-full">
					<h1 className="text-4xl font-heading text-ink mb-2 text-center" style={{ fontFamily: 'Cinzel, serif' }}>
						The Grand Library
					</h1>
					<p className="text-center text-leather/60 italic mb-12">
						Select a chronicle to continue, or forge a new legend.
					</p>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">

						{/* Existing Project Books */}
						{projects.map((project) => {
							const { Icon, shape } = getVisuals(project.id);
							let shapeClass = "rounded-full";
							if (shape === 'square') shapeClass = "rounded-xl";
							if (shape === 'diamond') shapeClass = "rounded-xl rotate-45";
							if (shape === 'hexagon') shapeClass = "rounded-[2rem]";

							return (
								<div key={project.id} className="relative group">
									{/* Book Cover Container */}
									<div
										onClick={() => handleOpenProject(project.id)}
										className="relative aspect-[2/3] rounded-r-xl rounded-l-sm shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden border-l-8 border-leather flex flex-col items-center"
										style={{
											background: 'linear-gradient(135deg, #3e2723 0%, #5d4037 100%)',
											boxShadow: 'inset 4px 0 10px rgba(0,0,0,0.5), 10px 10px 20px rgba(0,0,0,0.4)',
										}}
									>
										{/* Spine Highlight */}
										<div className="absolute left-0 top-0 bottom-0 w-4 bg-white/5 opacity-30 blur-sm pointer-events-none" />

										{/* Title Area */}
										<div className="mt-20 px-8 text-center w-full z-10">
											{editingId === project.id ? (
												<input
													type="text"
													value={editTitle}
													onChange={(e) => setEditTitle(e.target.value)}
													onClick={(e) => e.stopPropagation()}
													onKeyDown={(e) => {
														e.stopPropagation();
														if (e.key === 'Enter') handleSaveRename(project.id);
													}}
													className="w-full bg-black/20 text-amber-100 font-heading text-2xl text-center border-b border-gold/50 outline-none p-1"
													autoFocus
												/>
											) : (
												<h3
													className="font-heading text-2xl sm:text-3xl text-amber-100/90 uppercase tracking-widest line-clamp-4 leading-relaxed"
													style={{ fontFamily: 'Cinzel, serif', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
												>
													{project.title}
												</h3>
											)}
										</div>

										{/* Center Decoration */}
										<div className={`
                      mt-auto mb-16 w-3/4 aspect-square 
                      border-4 border-double border-gold/30 
                      flex items-center justify-center relative 
                      opacity-70 group-hover:opacity-100 transition-opacity
                      ${shapeClass}
                    `}>
											<div className={shape === 'diamond' ? '-rotate-45' : ''}>
												<Icon className="w-16 h-16 text-gold/40" />
											</div>
											<div className={`absolute inset-2 border border-gold/20 ${shapeClass}`} />
										</div>
									</div>

									{/* Menu Trigger */}
									<div
										className={`absolute top-4 right-4 z-20 transition-opacity duration-200 ${menuOpenId === project.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
										ref={menuRef}
									>
										<button
											onClick={(e) => {
												e.stopPropagation();
												setEditTitle(project.title);
												setMenuOpenId(menuOpenId === project.id ? null : project.id);
											}}
											className="p-2 rounded-full hover:bg-black/20 text-white/50 hover:text-white transition-colors"
										>
											<MoreVertical className="w-5 h-5" />
										</button>

										{/* Dropdown Menu */}
										{menuOpenId === project.id && (
											<div className="absolute right-0 mt-2 w-48 bg-parchment rounded-lg shadow-xl border border-leather/20 overflow-hidden z-50">
												<button
													onClick={(e) => {
														e.stopPropagation();
														setEditingId(project.id);
														setMenuOpenId(null);
													}}
													className="w-full text-left px-4 py-3 text-sm text-ink hover:bg-parchment-deep flex items-center gap-2"
												>
													<Edit2 className="w-4 h-4" /> Rename
												</button>
												<button
													onClick={(e) => {
														e.stopPropagation();
														setDeleteConfirmId(project.id);
														setMenuOpenId(null);
													}}
													className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
												>
													<Trash2 className="w-4 h-4" /> Delete
												</button>
											</div>
										)}
									</div>
								</div>
							);
						})}

						{/* New Project Placeholder */}
						<div
							className="group relative aspect-[2/3] rounded-r-xl rounded-l-md border-4 border-dashed border-leather/20 hover:border-gold/60 transition-all bg-parchment/30 hover:bg-parchment flex flex-col items-center justify-center p-6 cursor-pointer"
							onClick={(e) => {
								const input = document.getElementById('new-project-input');
								if (input) input.focus();
							}}
						>
							<div className="w-16 h-16 rounded-full bg-leather/10 group-hover:bg-gold/20 flex items-center justify-center mb-4 transition-colors">
								<Plus className="w-8 h-8 text-leather/40 group-hover:text-gold" />
							</div>

							<div className="w-full text-center" onClick={e => e.stopPropagation()}>
								<input
									id="new-project-input"
									type="text"
									placeholder="New Story Title..."
									value={newProjectTitle}
									onChange={(e) => setNewProjectTitle(e.target.value)}
									onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
									className="w-full bg-transparent border-b border-leather/20 focus:border-gold text-center font-heading text-xl text-ink placeholder:text-leather/30 outline-none pb-2 transition-colors"
									style={{ fontFamily: 'Cinzel, serif' }}
								/>
								<button
									onClick={handleCreate}
									disabled={!newProjectTitle.trim() || isCreating}
									className={`mt-4 w-full py-2 rounded-lg font-bold text-sm transition-all ${newProjectTitle.trim()
										? 'bg-gold text-parchment hover:bg-gold/80 shadow-md'
										: 'bg-leather/10 text-leather/30 cursor-not-allowed'
										}`}
								>
									{isCreating ? 'Forging...' : 'Begin Chronicle'}
								</button>
							</div>
						</div>

					</div>

					{/* Delete Confirmation Modal */}
					{deleteConfirmId && (
						<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
							<div className="bg-parchment rounded-lg p-6 max-w-md mx-4 shadow-2xl">
								<h2 className="text-xl font-heading text-ink mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
									Burn this Chronicle?
								</h2>
								<p className="text-leather/70 mb-6">
									Once lost to the flames, a story cannot be retold. Are you certain?
								</p>
								<div className="flex gap-3 justify-end">
									<button
										onClick={() => setDeleteConfirmId(null)}
										className="px-4 py-2 rounded-lg bg-parchment-deep text-ink hover:bg-leather/20 transition-colors"
									>
										Spare It
									</button>
									<button
										onClick={confirmDelete}
										className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
									>
										Burn It
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</>
	);
}
