'use server'

import { createClient } from "@/lib/supabase/server";
import { User } from "@/interfaces/user";


export async function getUser(): Promise<User | null> {

    try {

        const supabase = await createClient()

        const { data: { user: session } } = await supabase.auth.getUser()

        if (!session) {
            return null
        }

        const userId = session.id;

        const { data: userData, error: userError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single()

        if (userError) {
            console.error("Error al obtener los datos del usuario: ", userError.message)
            return null
        }

        return userData

    } catch (error) {
        console.error("Error al obtener los datos del usuario: ", error)
        return null
    }

}