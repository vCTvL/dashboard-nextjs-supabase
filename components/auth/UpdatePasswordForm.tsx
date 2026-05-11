"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldTitle,
} from "@/components/ui/field";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { updatePassword } from "@/actions/auth/auth";
import { useRouter } from "next/navigation";

import Link from "next/link";

const formSchema = z
    .object({
        password: z
            .string()
            .min(6, "La contraseña debe tener al menos 6 caracteres"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
    });

const UpdatePasswordForm = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsLoading(true);

        try {
            const res = await updatePassword(data);

            if (res.success) {
                toast.success(res.message || "Contraseña actualizada exitosamente", { duration: 2500 });
                router.push("/profiles");

            } else {
                toast.error(res.error || "Ocurrió un error", { duration: 2500 });
            }
        } catch (error: any) {
            toast.error(error.message, { duration: 2500 });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md backdrop-blur-xl bg-background py-6 rounded-4xl lg:border lg:border-white/50">
            <div className="rounded-xl px-6">
                <div className="text-center">
                    <h1 className="text-3xl font-semibold text-center my-4">
                        Nueva Contraseña
                    </h1>

                    <p className="text-sm text-muted-foreground mb-8">
                        Ingresa tu nueva contraseña
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <FieldGroup>
                        {/* ========= Password ========= */}
                        <Field className="mb-3">
                            <FieldLabel htmlFor="password">
                                Nueva Contraseña
                            </FieldLabel>

                            <Input
                                id="password"
                                type="password"
                                autoComplete="new-password"
                                disabled={isLoading}
                                {...register("password")}
                            />

                            {errors.password && (
                                <FieldError>
                                    {errors.password.message}
                                </FieldError>
                            )}
                        </Field>

                        {/* ========= Confirm Password ========= */}
                        <Field className="mb-3">
                            <FieldLabel htmlFor="confirmPassword">
                                Confirmar Contraseña
                            </FieldLabel>

                            <Input
                                id="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                disabled={isLoading}
                                {...register("confirmPassword")}
                            />

                            {errors.confirmPassword && (
                                <FieldError>
                                    {errors.confirmPassword.message}
                                </FieldError>
                            )}
                        </Field>

                        {/* ========= Submit ========= */}
                        <Button
                            className="mt-6"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading && (
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            )}

                            Actualizar Contraseña
                        </Button>

                        {/* ========= Volver ========= */}
                        <Link
                            href="/profile"
                            className="text-center text-sm text-white mt-3 underline underline-offset-4 hover:text-primary cursor-pointer"
                        >
                            Volver
                        </Link>
                    </FieldGroup>
                </form>
            </div>
        </div>
    );
};

export default UpdatePasswordForm;