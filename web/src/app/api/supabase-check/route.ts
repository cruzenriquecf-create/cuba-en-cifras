
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
      const { data, error } = await supabase
            .from("currencies")
                  .select("*")
                        .limit(1);

                            if (error) {
                                  console.error("Error de Supabase:", error.message);

                                        return NextResponse.json(
                                                {
                                                          success: false,
                                                                    message: "Supabase respondió, pero la consulta no pudo completarse.",
                                                                            },
                                                                                    { status: 500 }
                                                                                          );
                                                                                              }

                                                                                                  return NextResponse.json({
                                                                                                        success: true,
                                                                                                              message: "Conexión con Supabase establecida correctamente.",
                                                                                                                    recordsFound: data.length,
                                                                                                                        });
                                                                                                                          } catch (error) {
                                                                                                                              console.error("Error de conexión:", error);

                                                                                                                                  return NextResponse.json(
                                                                                                                                        {
                                                                                                                                                success: false,
                                                                                                                                                        message: "No se pudo completar la prueba de conexión.",
                                                                                                                                                              },
                                                                                                                                                                    { status: 500 }
                                                                                                                                                                        );
                                                                                                                                                                          }
                                                                                                                                                                          }
                                                                                                                                                                          