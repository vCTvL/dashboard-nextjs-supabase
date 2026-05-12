'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateTask(id: string, formData: FormData) {
    const supabase = await createClient();

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const status = formData.get('status') as string;
    const priority = formData.get('priority') as string;
    const imageFile = formData.get('image') as File | null;
    const removeImage = formData.get('removeImage') === 'true';
    const existingImage = formData.get('existingImage') as string | null;

    // Obtener el usuario actual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        throw new Error('No autorizado');
    }

    let imageUrl = existingImage;

    // Gestionar imagen
    if (removeImage && existingImage) {
        // Extraer el path del bucket de la URL pública
        // URL format: .../storage/v1/object/public/task-images/user_id/filename.ext
        const path = existingImage.split('task-images/').pop();
        if (path) {
            await supabase.storage.from('task-images').remove([path]);
        }
        imageUrl = null;
    }

    if (imageFile && imageFile.size > 0) {
        // Si había una imagen anterior y no se marcó para remover, la borramos antes de subir la nueva
        if (existingImage) {
            const oldPath = existingImage.split('task-images/').pop();
            if (oldPath) {
                await supabase.storage.from('task-images').remove([oldPath]);
            }
        }

        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
            .from('task-images')
            .upload(fileName, imageFile);

        if (uploadError) {
            throw new Error('Error al subir la nueva imagen');
        }

        const { data: { publicUrl } } = supabase.storage
            .from('task-images')
            .getPublicUrl(fileName);
            
        imageUrl = publicUrl;
    }

    const { error } = await supabase
        .from('tasks')
        .update({
            title,
            description,
            status,
            priority,
            image: imageUrl,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id); // Seguridad extra

    if (error) {
        console.error('Error updating task:', error);
        throw new Error('No se pudo actualizar la tarea');
    }

    revalidatePath('/dashboard');
    return { success: true };
}
