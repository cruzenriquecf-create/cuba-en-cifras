
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
      const { data, error } = await supabase.rpc(
            "get_public_verified_exchange_rates"
                );

                    if (error) {
                          console.error("Error al consultar las tasas:", error.message);

                                return NextResponse.json(
                                        {
                                                  success: false,
                                                            message: "No se pudieron consultar las tasas verificadas.",
                                                                    },
                                                                            { status: 500 }
                                                                                  );
                                                                                      }

                                                                                          return NextResponse.json({
                                                                                                success: true,
                                                                                                      message: "Consulta de tasas completada correctamente.",
                                                                                                            recordsFound: data?.length ?? 0,
                                                                                                                  data: data ?? [],
                                                                                                                      });
                                                                                                                        } catch (error) {
                                                                                                                            console.error("Error inesperado:", error);

                                                                                                                                return NextResponse.json(
                                                                                                                                      {
                                                                                                                                              success: false,
                                                                                                                                                      message: "No se pudo completar la consulta.",
                                                                                                                                                            },
                                                                                                                                                                  { status: 500 }
                                                                                                                                                                      );
                                                                                                                                                                        }
                                                                                                                                                                        }
                                                                                                                                                                        