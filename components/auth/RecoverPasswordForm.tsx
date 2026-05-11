"use client"

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
import { AuthFormProps } from "./AuthForm";
import { sendRecoveryEmail } from "@/actions/auth/auth";


const RecoverPasswordForm = ({ setTypeSelected }: AuthFormProps) => {

    const [isLoading, setisLoading] = useState<boolean>(false)

    // ============ Form ============
    const formSchema = z.object({
        email: z.email('Por favor ingresa un correo válido. Ejemplo: user@mail.com').min(1, {
            message: 'Este campo es requerido'
        }),
    })

    const { handleSubmit, formState, register } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: ''
        }
    })

    const { errors } = formState;


    // ============ Password Recovery ===========
    const onSubmit = async (user: z.infer<typeof formSchema>) => {
        setisLoading(true);

        try {

            const res = await sendRecoveryEmail(user);

            if (res.success) {
                toast.success(res.message || "Correo de recuperación enviado exitosamente", { duration: 2500 });
                setTypeSelected("sign-in");
            } else {
                toast.error(res.error || "Ocurrió un error", { duration: 2500 });
            }


        } catch (error: any) {
            toast.error(error.message, { duration: 2500 });
        } finally {
            setisLoading(false);
        }
    }

    return (
        <div>
            <div className="w-full backdrop-blur-xl py-6 rounded-4xl">
                <div className="rounded-xl px-6">
                    <div className="text-center">
                        <h1 className="lg:text-5xl md:text-4xl text-3xl font-semibold text-center my-4">
                            Recuperar Contraseña
                        </h1>
                        <p className="text-sm text-muted-foreground mb-8">
                            Te enviaremos un correo para recuperar tu contraseña
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <FieldGroup>

                            {/* ========== Email ========= */}
                            <Field data-invalid={!!errors.email}>
                                <FieldLabel>
                                    <FieldTitle>Correo</FieldTitle>
                                </FieldLabel>
                                <Input
                                    {...register("email")}
                                    id="email"
                                    placeholder="name@example.com"
                                    type="email"
                                    autoComplete="email"
                                    disabled={isLoading}
                                />
                                <FieldError errors={[errors.email]} />
                            </Field>

                            {/* ========== Submit ========= */}
                            <Button className="my-4" type="submit" disabled={isLoading}>
                                {isLoading && (
                                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Recuperar
                            </Button>

                        </FieldGroup>
                    </form>

                    {/* ========== Volver ========= */}
                    <p className="text-center text-sm text-white mt-3">
                        <span
                            onClick={() => setTypeSelected('sign-in')}
                            className="underline underline-offset-4 hover:text-primary cursor-pointer"
                        >{"Volver"}</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default RecoverPasswordForm;