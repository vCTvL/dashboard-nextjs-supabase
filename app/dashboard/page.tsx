'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AvatarBadge } from '@/components/AvatarBadge';
import { LayoutGrid, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { TaskFilters } from './components/TaskFilters';
import { TaskCard } from './components/TaskCard';
import { TaskForm } from './components/TaskForm';
import { getTasks } from '@/actions/tasks/get-tasks';
import { Task, TaskStatus, TaskPriority } from '@/interfaces/tasks';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
    const { user } = useAuth();
    
    // State for tasks and pagination
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    
    // State for filters
    const [filters, setFilters] = useState<{
        search: string;
        status: string | null;
        priority: string | null;
    }>({
        search: '',
        status: 'all',
        priority: 'all',
    });

    // State for TaskForm
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const observer = useRef<IntersectionObserver | null>(null);
    const lastTaskElementRef = useCallback((node: HTMLDivElement | null) => {
        if (loading || loadingMore) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        
        if (node) observer.current.observe(node);
    }, [loading, loadingMore, hasMore]);

    const loadTasks = useCallback(async (isInitial = false) => {
        if (isInitial) {
            setLoading(true);
            setPage(1);
        } else {
            setLoadingMore(true);
        }

        try {
            const currentPage = isInitial ? 1 : page;
            const result = await getTasks({
                search: filters.search,
                status: filters.status as TaskStatus | 'all',
                priority: filters.priority as TaskPriority | 'all',
                page: currentPage,
                limit: 10
            });

            if (isInitial) {
                setTasks(result.tasks);
            } else {
                setTasks(prev => [...prev, ...result.tasks]);
            }
            setHasMore(result.hasMore);
        } catch (error) {
            console.error('Error loading tasks:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [filters, page]);

    // Initial load and when filters change
    useEffect(() => {
        loadTasks(true);
    }, [filters.search, filters.status, filters.priority]);

    // Load more when page changes
    useEffect(() => {
        if (page > 1) {
            loadTasks(false);
        }
    }, [page]);

    const handleSearchChange = (value: string) => {
        setFilters(prev => ({ ...prev, search: value }));
    };

    const handleStatusChange = (value: string | null) => {
        setFilters(prev => ({ ...prev, status: value }));
    };

    const handlePriorityChange = (value: string | null) => {
        setFilters(prev => ({ ...prev, priority: value }));
    };

    const handleEdit = (task: Task) => {
        setEditingTask(task);
        setIsFormOpen(true);
    };

    const handleDelete = (deletedTask: Task) => {
        setTasks(prev => prev.filter(t => t.id !== deletedTask.id));
    };

    const handleCreateClick = () => {
        setEditingTask(null);
        setIsFormOpen(true);
    };

    const handleFormSuccess = () => {
        loadTasks(true);
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header / Nav */}
            <nav className="flex justify-between items-center px-6 py-4 border-b border-border/50 backdrop-blur-md sticky top-0 z-10 bg-background/80">
                <div className="text-xl font-extrabold tracking-tight flex items-center gap-3">
                    <div className="bg-primary p-2 rounded-lg text-primary-foreground">
                        <LayoutGrid size={24} />
                    </div>
                    <span className="hidden sm:inline">Gestor de Tareas</span>
                </div>
                
                <div className="flex items-center gap-4">
                    {user && (
                        <Link href="/profiles">
                            <AvatarBadge
                                name={user?.name}
                                avatar_url={user?.avatar_url}
                            />
                        </Link>
                    )}
                    
                    <Button 
                        onClick={async () => {
                            await fetch('/api/auth/signout', { method: 'POST' });
                            window.location.href = '/';
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                    >
                        Cerrar Sesión
                    </Button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Mis Tareas</h1>
                        <p className="text-muted-foreground mt-1">Gestiona y organiza tus actividades diarias.</p>
                    </div>
                    
                    <Button onClick={handleCreateClick} className="gap-2 shadow-lg shadow-primary/20">
                        <Plus size={20} />
                        Nueva Tarea
                    </Button>
                </div>

                {/* Filters */}
                <TaskFilters
                    currentFilters={filters}
                    onSearchChange={handleSearchChange}
                    onStatusChange={handleStatusChange}
                    onPriorityChange={handlePriorityChange}
                />

                {/* Task Grid */}
                {loading && page === 1 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
                        <p className="text-muted-foreground mt-4 animate-pulse">Cargando tareas...</p>
                    </div>
                ) : tasks.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {tasks.map((task, index) => {
                            if (tasks.length === index + 1) {
                                return (
                                    <div ref={lastTaskElementRef} key={task.id}>
                                        <TaskCard 
                                            task={task} 
                                            onEdit={handleEdit} 
                                            onDelete={handleDelete} 
                                        />
                                    </div>
                                );
                            } else {
                                return (
                                    <TaskCard 
                                        key={task.id} 
                                        task={task} 
                                        onEdit={handleEdit} 
                                        onDelete={handleDelete} 
                                    />
                                );
                            }
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-card/30 rounded-3xl border border-dashed border-border/50">
                        <div className="bg-muted p-4 rounded-full mb-4">
                            <LayoutGrid size={40} className="text-muted-foreground opacity-50" />
                        </div>
                        <h3 className="text-lg font-semibold">No se encontraron tareas</h3>
                        <p className="text-muted-foreground text-center max-w-xs mt-2">
                            {filters.search || filters.status !== 'all' || filters.priority !== 'all' 
                                ? 'Prueba ajustando los filtros de búsqueda.'
                                : 'Comienza creando tu primera tarea para organizar tu trabajo.'}
                        </p>
                    </div>
                )}

                {/* Loading more indicator */}
                {loadingMore && (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                )}
                
                {/* End of list message */}
                {!hasMore && tasks.length > 0 && (
                    <p className="text-center text-muted-foreground text-sm py-12 opacity-50">
                        Has llegado al final de la lista.
                    </p>
                )}
            </main>

            {/* Task Form Dialog */}
            <TaskForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                task={editingTask}
                onSuccess={handleFormSuccess}
            />
        </div>
    );
}
