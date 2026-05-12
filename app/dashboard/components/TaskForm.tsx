'use client';

import { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority } from '@/interfaces/tasks';
import { createTask } from '@/actions/tasks/create-task';
import { updateTask } from '@/actions/tasks/update-task';
import { toast } from 'sonner';


import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';

import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";

import { Loader2 } from 'lucide-react';

import * as z from "zod";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FileInput } from '@/components/FileInput';


interface TaskFormProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task | null;
    onSuccess: () => void;
}

const taskSchema = z.object({
    title: z.string().min(1, 'El título es requerido'),
    description: z.string().optional(),
    status: z.enum(['todo', 'in-progress', 'review', 'done'] as const),
    priority: z.enum(['low', 'medium', 'high'] as const),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export function TaskForm({
    isOpen,
    onClose,
    task,
    onSuccess
}: TaskFormProps) {

    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [removeImage, setRemoveImage] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<TaskFormValues>({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            title: '',
            description: '',
            status: 'todo',
            priority: 'medium',
        },
    });

    useEffect(() => {
        if (task) {
            reset({
                title: task.title,
                description: task.description || '',
                status: task.status,
                priority: task.priority,
            });

            setSelectedFile(null);
            setRemoveImage(false);

        } else {
            reset({
                title: '',
                description: '',
                status: 'todo',
                priority: 'medium',
            });

            setSelectedFile(null);
            setRemoveImage(false);
        }
    }, [task, reset, isOpen]);

    const onSubmit = async (data: TaskFormValues) => {
        setLoading(true);

        try {
            const formData = new FormData();

            formData.append('title', data.title);
            formData.append('description', data.description || '');
            formData.append('status', data.status);
            formData.append('priority', data.priority);

            if (selectedFile) {
                formData.append('image', selectedFile);
            }

            if (task) {
                formData.append('existingImage', task.image || '');

                if (removeImage) {
                    formData.append('removeImage', 'true');
                }
                
                await updateTask(task.id, formData);
                toast.success('Tarea actualizada correctamente');
            } else {
                await createTask(formData);
                toast.success('Tarea creada correctamente');
            }

            onSuccess();
            onClose();

        } catch (error) {
            console.error('Error saving task:', error);

        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>

            <DialogContent className="lg:w-xl md:w-full w-full max-h-[90vh] overflow-y-auto">

                <DialogHeader>
                    <DialogTitle>
                        {task ? 'Editar Tarea' : 'Nueva Tarea'}
                    </DialogTitle>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4 py-4"
                >
                    <FieldGroup>

                        {/* ========= Title ========= */}
                        <Field>
                            <FieldLabel htmlFor="title">
                                Título
                            </FieldLabel>

                            <Input
                                id="title"
                                placeholder="Título de la tarea"
                                disabled={loading}
                                {...register("title")}
                            />

                            {errors.title && (
                                <FieldError>
                                    {errors.title.message}
                                </FieldError>
                            )}
                        </Field>

                        {/* ========= Description ========= */}
                        <Field>
                            <FieldLabel htmlFor="description">
                                Descripción
                            </FieldLabel>

                            <Textarea
                                id="description"
                                placeholder="Describe lo que hay que hacer..."
                                rows={3}
                                disabled={loading}
                                {...register("description")}
                            />

                            {errors.description && (
                                <FieldError>
                                    {errors.description.message}
                                </FieldError>
                            )}
                        </Field>

                        <div className="grid grid-cols-2 gap-4">

                            {/* ========= Status ========= */}
                            <Field>
                                <FieldLabel>
                                    Estado
                                </FieldLabel>

                                <Select
                                    value={watch("status")}
                                    onValueChange={(value) =>
                                        setValue(
                                            "status",
                                            value as TaskStatus
                                        )
                                    }
                                >
                                    <SelectTrigger disabled={loading}>
                                        <SelectValue />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="todo">
                                            Pendiente
                                        </SelectItem>

                                        <SelectItem value="in-progress">
                                            En curso
                                        </SelectItem>

                                        <SelectItem value="review">
                                            En revisión
                                        </SelectItem>

                                        <SelectItem value="done">
                                            Completado
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                {errors.status && (
                                    <FieldError>
                                        {errors.status.message}
                                    </FieldError>
                                )}
                            </Field>

                            {/* ========= Priority ========= */}
                            <Field>
                                <FieldLabel>
                                    Prioridad
                                </FieldLabel>

                                <Select
                                    value={watch("priority")}
                                    onValueChange={(value) =>
                                        setValue(
                                            "priority",
                                            value as TaskPriority
                                        )
                                    }
                                >
                                    <SelectTrigger disabled={loading}>
                                        <SelectValue />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="low">
                                            Baja
                                        </SelectItem>

                                        <SelectItem value="medium">
                                            Media
                                        </SelectItem>

                                        <SelectItem value="high">
                                            Alta
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                {errors.priority && (
                                    <FieldError>
                                        {errors.priority.message}
                                    </FieldError>
                                )}
                            </Field>

                        </div>

                        {/* ========= File Input ========= */}
                        <div className="space-y-2">

                            <FileInput
                                accept="image/jpeg, image/png, image/gif, image/webp"
                                multiple={false}
                                onFilesSelected={(files) => {

                                    if (files.length > 0) {
                                        setSelectedFile(files[0] as File);
                                        setRemoveImage(false);

                                    } else {
                                        setSelectedFile(null);

                                        if (task?.image) {
                                            setRemoveImage(true);
                                        }
                                    }
                                }}
                                initialImageUrl={task?.image || undefined}
                            />

                        </div>

                        <DialogFooter className="pt-4">

                            <div className="flex justify-end gap-3">

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    disabled={loading}
                                >
                                    Cancelar
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}

                                    {task
                                        ? 'Actualizar'
                                        : 'Crear'}
                                </Button>

                            </div>

                        </DialogFooter>

                    </FieldGroup>
                </form>

            </DialogContent>
        </Dialog>
    );
}