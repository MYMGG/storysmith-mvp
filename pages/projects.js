// pages/projects.js
// Projects landing page - library of story chronicles
// Ported from storysmith-v5 (App Router -> Pages Router, TSX -> JSX)

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
	Plus, MoreVertical, Trash2, Edit2, Loader2,
	Book, Sword, Crown, Scroll, Feather, Mountain, Skull, Tent, Castle, Ship, Gem, Anchor, Gavel, Flame
} from 'lucide-react';
import * as projectStore from '../lib/projectStore.js';
import TranslucentHeader from '../components/TranslucentHeader';

// Visual Assets for book covers
const ICONS = [Book, Sword, Crown, Scroll, Feather, Mountain, Skull, Tent, Castle, Ship, Gem, Anchor, Gavel, Flame];
const SHAPES = ['circle', 'square', 'diamond', 'hexagon'];

export default function ProjectsPage() {
	const router = useRouter();
	const [projects, setProjects] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	// Create Mode
	const [isCreating, setIsCreating] = useState(false);

	// Actions & Menus
	const [menuOpenId, setMenuOpenId] = useState(null);
	const [editingId, setEditingId] = useState(null);
	const [editTitle, setEditTitle] = useState('');
	const [deleteConfirmId, setDeleteConfirmId] = useState(null);
	const [showNewModal, setShowNewModal] = useState(false);
	const [modalTitle, setModalTitle] = useState('');

	// Note: No ref needed - using data-attribute for menu detection

	useEffect(() => {
		loadProjects();

		const handleClickOutside = (event) => {
			if (!event.target.closest('[data-menu-root="true"]')) {
				setMenuOpenId(null);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	async function loadProjects() {
		try {
			const allProjects = await projectStore.getAllProjects();
			setProjects(allProjects.sort((a, b) => {
				const aTime = a.lastOpenedAt || a.updatedAt || a.createdAt;
				const bTime = b.lastOpenedAt || b.updatedAt || b.createdAt;
				return new Date(bTime).getTime() - new Date(aTime).getTime();
			}));
		} catch (error) {
			console.error('Failed to load projects:', error);
		} finally {
			setIsLoading(false);
		}
	}

	async function handleCreate() {
		const title = modalTitle.trim() || 'Untitled Chronicle';
		setIsCreating(true);
		try {
			const project = await projectStore.createProject(title);
			setModalTitle('');
			setShowNewModal(false);
			projectStore.setActiveProjectId(project.id);
			await projectStore.setProjectOpened(project.id);
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
		await projectStore.setProjectOpened(projectId);
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

	// Adaptive title sizing helper
	function titleClass(title) {
		const t = (title || '').trim();
		const len = t.length;
		const longestWord = Math.max(...t.split(/\s+/).map(w => w.length), 0);
		if (len > 36 || longestWord > 10) return 'text-base';
		if (len > 24) return 'text-lg';
		return 'text-2xl';
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
			<div className="min-h-screen flex flex-col text-white relative overflow-hidden">
				{/* Library Background */}
				<div className="absolute inset-0 z-0">
					<div
						className="absolute inset-0"
						style={{
							backgroundImage: "url('/background4-library.jpg')",
							backgroundSize: 'cover',
							backgroundPosition: 'center',
							backgroundAttachment: 'fixed',
						}}
					/>
				</div>
				<div className="absolute inset-0 z-1 bg-black/50" />

				<div className="relative z-10 flex flex-col min-h-screen">
					<TranslucentHeader
						rightSlot={
							<button
								onClick={() => setShowNewModal(true)}
								className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gold/80 text-ink font-heading hover:bg-gold transition"
							>
								<Plus className="w-4 h-4" />
								New Chronicle
							</button>
						}
						onHomeClick={() => {
							sessionStorage.setItem('ss_go_home_pending', '1');
							window.dispatchEvent(new Event('ss_go_home'));
							router.push('/');
						}}
					/>
					<div className="flex-1 px-6 py-12 max-w-7xl mx-auto w-full">
						<h1 className="text-4xl font-heading text-stone-100 mb-2 text-center" style={{ fontFamily: 'Cinzel, serif', textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>
							The Grand Library
						</h1>
						<p className="text-center text-stone-300 italic mb-12" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
							Select a chronicle to continue, or forge a new legend.
						</p>

						<div className="flex flex-wrap justify-center gap-x-12 gap-y-14">

							{/* Existing Project Books */}
							{projects.map((project) => {
								const { Icon, shape } = getVisuals(project.id);
								let shapeClass = "rounded-full";
								if (shape === 'square') shapeClass = "rounded-xl";
								if (shape === 'diamond') shapeClass = "rounded-xl rotate-45";
								if (shape === 'hexagon') shapeClass = "rounded-[2rem]";

								// Compute layout flags
								const tLen = (project.title || '').length;
								const tWords = (project.title || '').split(/\s+/);
								const longestWord = Math.max(...tWords.map(w => w.length), 0);
								const isShortTitle = tLen <= 12;
								const forceBreak = longestWord >= 16;

								return (
									<div key={project.id} className="relative group">
										{/* Book Cover Container - Floating Stack Layout */}
										<div
											onClick={() => handleOpenProject(project.id)}
											className="relative w-[200px] aspect-[2/3] rounded-r-xl rounded-l-sm shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden border-l-8 border-leather flex flex-col h-full"
											style={{
												background: 'linear-gradient(135deg, #3e2723 0%, #5d4037 100%)',
												boxShadow: 'inset 4px 0 10px rgba(0,0,0,0.5), 10px 10px 20px rgba(0,0,0,0.4)',
											}}
										>
											{/* Spine Highlight */}
											<div className="absolute left-0 top-0 bottom-0 w-4 bg-white/5 opacity-30 blur-sm pointer-events-none" />

											{/* Content Stack: Title + Graphic (Centered Float) */}
											<div className={`flex-1 w-full flex flex-col items-center justify-center p-6 gap-4 z-10 ${isShortTitle ? 'translate-y-2' : ''}`}>
												{/* Title */}
												<h3
													className={`${titleClass(project.title)} font-heading text-amber-100/90 uppercase tracking-widest leading-tight text-center whitespace-normal line-clamp-3 overflow-hidden shrink-0 ${forceBreak ? 'break-words hyphens-auto' : 'break-normal'}`}
													style={{ fontFamily: 'Cinzel, serif', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
												>
													{project.title}
												</h3>

												{/* Graphic */}
												<div className={`
                        w-3/4 aspect-square max-w-[150px] max-h-[150px]
                        border-4 border-double border-gold/30 
                        flex items-center justify-center relative 
                        opacity-70 group-hover:opacity-100 transition-opacity shrink-0
                        ${shapeClass}
                      `}>
													<div className={shape === 'diamond' ? '-rotate-45' : ''}>
														<Icon className="w-16 h-16 text-gold/40" />
													</div>
													<div className={`absolute inset-2 border border-gold/20 ${shapeClass}`} />
												</div>
											</div>
										</div>

										{/* Menu Trigger */}
										<div
											className={`absolute top-4 right-4 z-20 transition-opacity duration-200 ${menuOpenId === project.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
											data-menu-root="true"
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
															setEditTitle(project.title);
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


						</div>

						{deleteConfirmId && (
							<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onMouseDown={() => setDeleteConfirmId(null)}>
								<div className="bg-parchment rounded-lg p-6 max-w-md mx-4 shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
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

						{/* Rename Confirmation Modal */}
						{editingId && (
							<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onMouseDown={() => setEditingId(null)}>
								<div className="bg-parchment rounded-lg p-6 max-w-md mx-4 shadow-2xl w-full" onMouseDown={(e) => e.stopPropagation()}>
									<h2 className="text-xl font-heading text-ink mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
										Rename Chronicle
									</h2>
									<input
										type="text"
										value={editTitle}
										onChange={(e) => setEditTitle(e.target.value)}
										onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(editingId)}
										className="w-full px-4 py-3 rounded-lg border border-leather/20 bg-white/50 text-ink placeholder:text-leather/40 outline-none focus:border-gold mb-6"
										autoFocus
										onFocus={(e) => e.target.select()}
									/>
									<div className="flex gap-3 justify-end">
										<button
											onClick={() => setEditingId(null)}
											className="px-4 py-2 rounded-lg bg-parchment-deep text-ink hover:bg-leather/20 transition-colors"
										>
											Cancel
										</button>
										<button
											onClick={() => handleSaveRename(editingId)}
											disabled={!editTitle.trim()}
											className="px-4 py-2 rounded-lg bg-gold text-ink font-bold hover:bg-gold/80 transition-colors disabled:opacity-50"
										>
											Save
										</button>
									</div>
								</div>
							</div>
						)}

						{/* New Chronicle Modal */}
						{showNewModal && (
							<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onMouseDown={() => { setShowNewModal(false); setModalTitle(''); }}>
								<div className="bg-parchment rounded-lg p-6 max-w-md mx-4 shadow-2xl w-full" onMouseDown={(e) => e.stopPropagation()}>
									<h2 className="text-xl font-heading text-ink mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
										Begin a New Chronicle
									</h2>
									<input
										type="text"
										placeholder="Enter story title..."
										value={modalTitle}
										onChange={(e) => setModalTitle(e.target.value)}
										onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
										className="w-full px-4 py-3 rounded-lg border border-leather/20 bg-white/50 text-ink placeholder:text-leather/40 outline-none focus:border-gold mb-6"
										autoFocus
									/>
									<div className="flex gap-3 justify-end">
										<button
											onClick={() => { setShowNewModal(false); setModalTitle(''); }}
											className="px-4 py-2 rounded-lg bg-parchment-deep text-ink hover:bg-leather/20 transition-colors"
										>
											Cancel
										</button>
										<button
											onClick={handleCreate}
											disabled={isCreating}
											className="px-4 py-2 rounded-lg bg-gold text-ink font-bold hover:bg-gold/80 transition-colors disabled:opacity-50"
										>
											{isCreating ? 'Creating...' : 'Create Chronicle'}
										</button>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
