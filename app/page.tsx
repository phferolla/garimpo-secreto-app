"use client"

import { supabase } from "../lib/supabase"
import { useEffect, useState } from "react"

export default function Home() {
  const [produtos, setProdutos] = useState<any[]>([])

  useEffect(() => {
    async function carregarProdutos() {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .eq("ativo", true)
        .order("cliques", { ascending: false })

      console.log("DATA:", data)
      console.log("ERROR:", error)

      setProdutos(data || [])
    }

    carregarProdutos()
  }, [])

  async function incrementarClique(produto: any) {
    await supabase
      .from("produtos")
      .update({ cliques: (produto.cliques || 0) + 1 })
      .eq("id", produto.id)

    window.open(produto.link_afiliado, "_blank")

    // Atualiza lista após clique
    const { data } = await supabase
      .from("produtos")
      .select("*")
      .eq("ativo", true)
      .order("cliques", { ascending: false })

    setProdutos(data || [])
  }

  return (
    <main className="min-h-screen bg-black text-white">

      {/* HERO */}
      <section className="text-center py-20 px-6 border-b border-gray-800">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
          🔥 GARIMPO SECRETO
        </h1>
        <p className="text-gray-400 mt-6 text-lg max-w-2xl mx-auto">
          Produtos que realmente compensam.
          Garimpados para você pagar menos.
        </p>
      </section>

      {/* GRID */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">

        {produtos.map((produto: any, index: number) => (
          <div
            key={produto.id}
            className="group bg-gradient-to-b from-gray-900 to-gray-800 rounded-3xl overflow-hidden shadow-xl hover:shadow-red-500/20 transition duration-500 hover:-translate-y-2"
          >

            {/* IMAGEM */}
            <div className="relative overflow-hidden">
              <img
                src={produto.imagem_url}
                alt={produto.nome}
                className="w-full h-72 object-cover group-hover:scale-110 transition duration-700"
              />

              {/* Badge de mais clicado */}
              {index === 0 && produto.cliques > 0 && (
                <span className="absolute top-4 left-4 bg-yellow-500 text-black text-xs px-4 py-1 rounded-full font-bold tracking-wide shadow-lg">
                  🔥 MAIS CLICADO
                </span>
              )}
            </div>

            {/* INFO */}
            <div className="p-6">

              <h2 className="text-xl font-semibold leading-tight group-hover:text-red-400 transition">
                {produto.nome}
              </h2>

              <div className="mt-4">
                <span className="text-3xl font-extrabold text-yellow-400">
                  R$ {produto.preco}
                </span>
              </div>

              {/* Contador de cliques */}
              <p className="text-gray-400 text-sm mt-2">
                👀 {produto.cliques || 0} cliques
              </p>

              <button
                onClick={() => incrementarClique(produto)}
                className="mt-6 w-full bg-red-600 hover:bg-red-700 transition py-3 rounded-2xl font-bold tracking-wide shadow-lg hover:shadow-red-500/40"
              >
                QUERO APROVEITAR
              </button>

            </div>
          </div>
        ))}

      </section>

    </main>
  )
}