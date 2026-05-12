'use server';

import { createClient } from '@/lib/supabase/server';
import { Task, TaskStatus, TaskPriority } from '@/interfaces/tasks';

export interface GetTasksParams {
    search?: string;
    status?: TaskStatus | 'all' | null;
    priority?: TaskPriority | 'all' | null;
    page?: number;
    limit?: number;
}

export async function getTasks({
    search = '',
    status = 'all',
    priority = 'all',
    page = 1,
    limit = 10,
}: GetTasksParams = {}) {
    const supabase = await createClient();

    let query = supabase
        .from('tasks')
        .select('*', { count: 'exact' });

    // Filtros
    if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (status && status !== 'all') {
        query = query.eq('status', status);
    }

    if (priority && priority !== 'all') {
        query = query.eq('priority', priority);
    }

    // Paginación
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('Error fetching tasks:', error);
        throw new Error('No se pudieron cargar las tareas');
    }

    return {
        tasks: data as Task[],
        total: count || 0,
        hasMore: (count || 0) > to + 1
    };
}
