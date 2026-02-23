"use client"

import { supabase } from "../../lib/supabase"
import { useEffect, useState } from "react"

export default function Admin() {
  const [user, setUser] = useState<any>(null)
  const [produtos, setProdutos] = useState<any[]>([])
  const [form, setForm] = useState({
    nome: "",
    preco: "",
    imagem_url: "",
    link_afiliado: "",
    categoria: ""
  })

  useEffect(() => {
    verificarSessao()
  }, [])

  async function verificarSessao() {
    const { data } = await supabase.auth.getSession()
    setUser(data.session?.user || null)

    if (data.session?.user) {
      carregarProdutos()
    }
  }

  async function login(email: string, password: string) {
    await supabase.auth.signInWithPassword({ email, password })
    verificarSessao()
  }

  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
  }

  async function carregarProdutos() {
    const { data } = await supabase
      .from("produtos")
      .select("*")
      .order("criado_em", { ascending: false })

    setProdutos(data || [])
  }

  async function criarProduto() {
    await supabase.from("produtos").insert([
      {
        ...form,
        ativo: true,
        destaque: false,
        cliques: 0
      }
    ])

    setForm({
      nome: "",
      preco: "",
      imagem_url: "",
      link_afiliado: "",
      categoria: ""
    })

    carregarProdutos()
  }

  async function deletarProduto(id: string) {
    await supabase.from("produtos").delete().eq("id", id)
    carregarProdutos()
  }

  async function toggleAtivo(produto: any) {
    await supabase
      .from("produtos")
      .update({ ativo: !produto.ativo })
      .eq("id", produto.id)

    carregarProdutos()
  }

  async function toggleDestaque(produto: any) {
    await supabase
      .from("produtos")
      .update({ destaque: !produto.destaque })
      .eq("id", produto.id)

    carregarProdutos()
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="bg-gray-900 p-8 rounded-2xl w-96 space-y-4">
          <h1 className="text-2xl font-bold text-center">🔐 Login Admin</h1>

          <input
            placeholder="Email"
            onBlur={(e) => (window as any).adminEmail = e.target.value}
            className="w-full p-3 rounded bg-gray-800"
          />

          <input
            type="password"
            placeholder="Senha"
            onBlur={(e) => (window as any).adminPassword = e.target.value}
            className="w-full p-3 rounded bg-gray-800"
          />

          <button
            onClick={() =>
              login(
                (window as any).adminEmail,
                (window as any).adminPassword
              )
            }
            className="w-full bg-red-600 py-3 rounded-xl font-bold hover:bg-red-700 transition"
          >
            ENTRAR
          </button>
        </div>
      </main>
    )
  }

  const totalCliques = produtos.reduce(
    (acc, p) => acc + (p.cliques || 0),
    0
  )

  return (
    <main className="min-h-screen bg-black text-white p-10">

      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold">🔧 PAINEL ADMIN</h1>
        <button onClick={logout} className="bg-red-600 px-5 py-2 rounded-lg">
          Sair
        </button>
      </div>

      {/* DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gray-900 p-6 rounded-2xl">
          <p className="text-gray-400">Total de Produtos</p>
          <h2 className="text-3xl font-bold">{produtos.length}</h2>
        </div>

        <div className="bg-gray-900 p-6 rounded-2xl">
          <p className="text-gray-400">Total de Cliques</p>
          <h2 className="text-3xl font-bold text-yellow-400">
            {totalCliques}
          </h2>
        </div>

        <div className="bg-gray-900 p-6 rounded-2xl">
          <p className="text-gray-400">Produtos Ativos</p>
          <h2 className="text-3xl font-bold text-green-400">
            {produtos.filter((p) => p.ativo).length}
          </h2>
        </div>
      </div>

      {/* FORM */}
      <div className="bg-gray-900 p-6 rounded-2xl mb-10 space-y-4">
        <h2 className="text-xl font-bold">Adicionar Produto</h2>

        {Object.keys(form).map((key) => (
          <input
            key={key}
            placeholder={key}
            value={(form as any)[key]}
            onChange={(e) =>
              setForm({ ...form, [key]: e.target.value })
            }
            className="w-full p-3 rounded bg-gray-800"
          />
        ))}

        <button
          onClick={criarProduto}
          className="w-full bg-green-600 py-3 rounded-xl font-bold hover:bg-green-700 transition"
        >
          ADICIONAR
        </button>
      </div>

      {/* LISTA */}
      <div className="space-y-4">
        {produtos.map((produto) => (
          <div
            key={produto.id}
            className="bg-gray-900 p-5 rounded-2xl flex justify-between items-center"
          >
            <div>
              <h2 className="font-bold text-lg">{produto.nome}</h2>
              <p className="text-gray-400">
                R$ {produto.preco} • {produto.cliques} cliques
              </p>
              <p className="text-sm">
                {produto.ativo ? "🟢 Ativo" : "🔴 Inativo"} •{" "}
                {produto.destaque ? "⭐ Destaque" : "Sem destaque"}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => toggleAtivo(produto)}
                className="bg-yellow-600 px-4 py-2 rounded-lg"
              >
                Ativar
              </button>

              <button
                onClick={() => toggleDestaque(produto)}
                className="bg-blue-600 px-4 py-2 rounded-lg"
              >
                Destaque
              </button>

              <button
                onClick={() => deletarProduto(produto.id)}
                className="bg-red-600 px-4 py-2 rounded-lg"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

    </main>
  )
}