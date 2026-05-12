'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createTask(formData: FormData) {
    const supabase = await createClient();

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const status = formData.get('status') as string;
    const priority = formData.get('priority') as string;
    const imageFile = formData.get('image') as File | null;

    // Obtener el usuario actual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        throw new Error('No autorizado');
    }

    let imageUrl = null;

    // Subir imagen si existe
    if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
            .from('task-images')
            .upload(fileName, imageFile);

        if (uploadError) {
            console.error('Error uploading image:', uploadError);
            throw new Error('Error al subir la imagen');
        }

        const { data: { publicUrl } } = supabase.storage
            .from('task-images')
            .getPublicUrl(fileName);
            
        imageUrl = publicUrl;
    }

    const { error } = await supabase
        .from('tasks')
        .insert({
            title,
            description,
            status,
            priority,
            user_id: user.id,
            image: imageUrl,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });

    if (error) {
        console.error('Error creating task:', error);
        throw new Error('No se pudo crear la tarea');
    }

    revalidatePath('/dashboard');
    return { success: true };
}
