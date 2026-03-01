"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"

const LIMIT = 12

function normalizarTexto(texto: string) {
  return texto
    ?.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

export default function Home() {
  const [produtos, setProdutos] = useState<any[]>([])
  const [pagina, setPagina] = useState(0)
  const [temMais, setTemMais] = useState(true)
  const [carregando, setCarregando] = useState(false)

  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todos")
  const [busca, setBusca] = useState("")
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false)

  const loaderRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    carregarProdutos()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && temMais && !carregando) {
          carregarProdutos()
        }
      },
      { threshold: 1 }
    )

    if (loaderRef.current) observer.observe(loaderRef.current)

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current)
    }
  }, [temMais, carregando])

  async function carregarProdutos() {
    if (carregando || !temMais) return

    setCarregando(true)

    const from = pagina * LIMIT
    const to = from + LIMIT - 1

    const { data } = await supabase
      .from("produtos")
      .select("*")
      .eq("ativo", true)
      .order("destaque", { ascending: false })
      .order("criado_em", { ascending: false })
      .range(from, to)

    if (data && data.length > 0) {
      setProdutos((prev) => {
        const ids = new Set(prev.map((p) => p.id))
        const novos = data.filter((p) => !ids.has(p.id))
        return [...prev, ...novos]
      })

      if (data.length < LIMIT) setTemMais(false)
      setPagina((prev) => prev + 1)
    } else {
      setTemMais(false)
    }

    setCarregando(false)
  }

  const categorias = useMemo(() => {
    return [
      "Todos",
      ...Array.from(new Set(produtos.map((p) => p.categoria)))
    ]
  }, [produtos])

  const produtosFiltrados = useMemo(() => {
    return produtos.filter((produto) => {
      const categoriaOk =
        categoriaSelecionada === "Todos" ||
        produto.categoria === categoriaSelecionada

      const textoBusca = normalizarTexto(busca)
      const nome = normalizarTexto(produto.nome || "")
      const descricao = normalizarTexto(produto.descricao || "")

      const buscaOk =
        nome.includes(textoBusca) ||
        descricao.includes(textoBusca)

      return categoriaOk && buscaOk
    })
  }, [produtos, busca, categoriaSelecionada])

  const sugestoes = useMemo(() => {
    if (!busca) return []
    return produtos
      .filter((p) =>
        normalizarTexto(p.nome).includes(normalizarTexto(busca))
      )
      .slice(0, 5)
  }, [busca, produtos])

  return (
    <main className="min-h-screen bg-white text-slate-800">

      {/* HERO */}
      <section className="pt-24 pb-12 px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-extrabold"
        >
          <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
            Descubra ofertas
          </span>
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            com inteligência
          </span>
        </motion.h1>

        {/* BUSCA INTELIGENTE */}
        <div className="mt-6 max-w-xl mx-auto relative">
          <input
            type="text"
            placeholder="🔎 Buscar produto..."
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value)
              setMostrarSugestoes(true)
            }}
            onBlur={() =>
              setTimeout(() => setMostrarSugestoes(false), 200)
            }
            className="w-full px-5 py-3 rounded-xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {mostrarSugestoes && sugestoes.length > 0 && (
            <div className="absolute bg-white w-full shadow-lg rounded-xl mt-2 border border-slate-200 z-50">
              {sugestoes.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setBusca(item.nome)
                    setMostrarSugestoes(false)
                  }}
                  className="px-4 py-2 hover:bg-slate-100 cursor-pointer text-sm"
                >
                  {item.nome}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FILTRO + GRID */}
      <section className="flex flex-col md:flex-row px-6 pb-12 gap-8">

        <aside className="md:w-60">
          <h3 className="font-semibold text-lg mb-4">Categorias</h3>
          <div className="space-y-2">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaSelecionada(cat)}
                className={`block w-full text-left px-4 py-2 rounded-lg text-sm transition ${
                  categoriaSelecionada === cat
                    ? "bg-blue-600 text-white"
                    : "hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </aside>

        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">

          {produtosFiltrados.map((produto) => {

            const precoAtual = parseFloat(
              produto.preco?.replace(",", ".") || "0"
            )
            const precoAntigo = parseFloat(
              produto.preco_antigo?.replace(",", ".") || "0"
            )

            const desconto =
              precoAntigo > 0 && precoAtual > 0
                ? Math.round(((precoAntigo - precoAtual) / precoAntigo) * 100)
                : null

            const economia =
              precoAntigo > 0 && precoAtual > 0
                ? (precoAntigo - precoAtual).toFixed(2).replace(".", ",")
                : null

            return (
              <motion.div
                key={produto.id}
                whileHover={{ y: -6 }}
                className="bg-white rounded-xl shadow-sm hover:shadow-xl transition p-4 relative border border-slate-100"
              >

                {produto.destaque && (
                  <div className="absolute top-2 right-2 bg-yellow-400 text-xs px-2 py-1 rounded-full font-bold shadow">
                    ⭐ Destaque
                  </div>
                )}

                {desconto && desconto > 0 && (
                  <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] px-2 py-1 rounded-full font-bold">
                    {desconto}% OFF
                  </div>
                )}

                <img
                  src={produto.imagem_url}
                  alt={produto.nome}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />

                <h4 className="font-semibold text-sm line-clamp-2 min-h-[40px]">
                  {produto.nome}
                </h4>

                {produto.preco_antigo && (
                  <p className="text-xs text-slate-400 line-through">
                    R$ {produto.preco_antigo}
                  </p>
                )}

                <p className="text-lg font-bold text-blue-600">
                  R$ {produto.preco}
                </p>

                {economia && (
                  <p className="text-[11px] text-green-600 font-medium">
                    Economize R$ {economia}
                  </p>
                )}

                <a
                  href={produto.link_afiliado}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 block text-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2 rounded-lg text-sm hover:opacity-90 transition"
                >
                  Ver oferta
                </a>

              </motion.div>
            )
          })}

        </div>
      </section>

      {/* LOADER */}
      <div ref={loaderRef} className="h-16 flex justify-center items-center">
        {carregando && (
          <div className="text-sm text-slate-500">
            Carregando mais ofertas...
          </div>
        )}
      </div>

      {/* BLOCO CONFIANÇA COMPLETO */}
      <section className="bg-slate-50 border-t py-16 px-6 text-center">
        <h3 className="text-2xl font-bold mb-6">
          Por que confiar no Garimpo Secreto?
        </h3>

        <p className="text-slate-600 text-sm max-w-3xl mx-auto mb-10">
          Monitoramos preços diariamente, mostramos apenas ofertas reais,
          destacamos oportunidades exclusivas e mantemos total transparência.
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">

          <div>
            <h4 className="font-semibold mb-2">🔎 Curadoria Inteligente</h4>
            <p className="text-sm text-slate-600">
              Selecionamos apenas ofertas realmente vantajosas.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">🛡 Transparência Total</h4>
            <p className="text-sm text-slate-600">
              Indicamos descontos reais e atualizados.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">⚡ Atualização Constante</h4>
            <p className="text-sm text-slate-600">
              Ofertas revisadas diariamente para você não perder nada.
            </p>
          </div>

        </div>
      </section>

    </main>
  )
}