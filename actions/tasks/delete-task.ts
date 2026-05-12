'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deleteTask(id: string, imageUrl?: string | null) {
    const supabase = await createClient();

    // Obtener el usuario actual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        throw new Error('No autorizado');
    }

    // Si tiene imagen, borrarla del storage
    if (imageUrl) {
        const path = imageUrl.split('task-images/').pop();
        if (path) {
            await supabase.storage.from('task-images').remove([path]);
        }
    }

    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        console.error('Error deleting task:', error);
        throw new Error('No se pudo eliminar la tarea');
    }

    revalidatePath('/dashboard');
    return { success: true };
}
