"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function Admin() {
  const [user, setUser] = useState<any>(null)
  const [loadingAuth, setLoadingAuth] = useState(true)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [produtos, setProdutos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    preco: "",
    preco_antigo: "",
    imagem_url: "",
    categoria: "",
    link_afiliado: "",
    destaque: false,
    ativo: true,
  })

  useEffect(() => {
    verificarUsuario()
  }, [])

  async function verificarUsuario() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    setUser(session?.user ?? null)
    setLoadingAuth(false)

    if (session?.user) carregarProdutos()
  }

  async function login() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert("Erro no login")
      return
    }

    verificarUsuario()
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

    if (data) setProdutos(data)
  }

  async function salvarProduto() {
    if (!form.nome || !form.preco) {
      alert("Preencha nome e preço")
      return
    }

    setLoading(true)

    await supabase.from("produtos").insert([form])

    setForm({
      nome: "",
      descricao: "",
      preco: "",
      preco_antigo: "",
      imagem_url: "",
      categoria: "",
      link_afiliado: "",
      destaque: false,
      ativo: true,
    })

    await carregarProdutos()
    setLoading(false)
  }

  async function excluirProduto(id: string) {
    await supabase.from("produtos").delete().eq("id", id)
    carregarProdutos()
  }

  async function toggleCampo(
    id: string,
    campo: "ativo" | "destaque",
    valor: boolean
  ) {
    await supabase
      .from("produtos")
      .update({ [campo]: !valor })
      .eq("id", id)

    carregarProdutos()
  }

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-black">
        Carregando...
      </div>
    )
  }

  // LOGIN
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">

        <div className="bg-white border border-gray-200 shadow-xl rounded-2xl p-10 w-[420px]">

          <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
            Login Admin
          </h1>

          <input
            type="email"
            placeholder="Email"
            className="border border-gray-300 p-3 rounded-xl w-full mb-4 text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Senha"
            className="border border-gray-300 p-3 rounded-xl w-full mb-6 text-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={login}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition"
          >
            Entrar
          </button>

        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-10">

      {/* TOPO */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold">
          Painel Administrativo
        </h1>

        <button
          onClick={logout}
          className="text-red-600 font-semibold"
        >
          Sair
        </button>
      </div>

      {/* FORM */}
      <div className="bg-white border border-gray-200 shadow-lg rounded-2xl p-8 mb-14">

        <h2 className="text-2xl font-semibold mb-6">
          Adicionar Produto
        </h2>

        <div className="grid md:grid-cols-2 gap-4">

          <input
            placeholder="Nome"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="border p-3 rounded-xl"
          />

          <input
            placeholder="Categoria"
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            className="border p-3 rounded-xl"
          />

          <input
            placeholder="Preço Atual"
            value={form.preco}
            onChange={(e) => setForm({ ...form, preco: e.target.value })}
            className="border p-3 rounded-xl"
          />

          <input
            placeholder="Preço Antigo"
            value={form.preco_antigo}
            onChange={(e) =>
              setForm({ ...form, preco_antigo: e.target.value })
            }
            className="border p-3 rounded-xl"
          />

          <input
            placeholder="Imagem URL"
            value={form.imagem_url}
            onChange={(e) =>
              setForm({ ...form, imagem_url: e.target.value })
            }
            className="border p-3 rounded-xl"
          />

          <input
            placeholder="Link Afiliado"
            value={form.link_afiliado}
            onChange={(e) =>
              setForm({ ...form, link_afiliado: e.target.value })
            }
            className="border p-3 rounded-xl"
          />
        </div>

        <textarea
          placeholder="Descrição"
          value={form.descricao}
          onChange={(e) =>
            setForm({ ...form, descricao: e.target.value })
          }
          className="border p-3 rounded-xl w-full mt-4"
        />

        <div className="flex gap-8 mt-6">

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.destaque}
              onChange={(e) =>
                setForm({ ...form, destaque: e.target.checked })
              }
            />
            Destaque
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.ativo}
              onChange={(e) =>
                setForm({ ...form, ativo: e.target.checked })
              }
            />
            Ativo
          </label>

        </div>

        <button
          onClick={salvarProduto}
          disabled={loading}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition"
        >
          {loading ? "Salvando..." : "Salvar Produto"}
        </button>
      </div>

      {/* LISTA */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {produtos.map((produto) => (
          <div
            key={produto.id}
            className="bg-white border border-gray-200 rounded-2xl p-5 shadow"
          >
            <img
              src={produto.imagem_url}
              className="w-full h-40 object-cover rounded-xl mb-4"
            />

            <h3 className="font-semibold text-lg mb-1">
              {produto.nome}
            </h3>

            <p className="text-blue-600 font-bold mb-3">
              R$ {produto.preco}
            </p>

            <div className="flex gap-3 flex-wrap text-sm">

              <button
                onClick={() =>
                  toggleCampo(produto.id, "ativo", produto.ativo)
                }
                className={`px-3 py-1 rounded-full ${
                  produto.ativo
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {produto.ativo ? "Ativo" : "Inativo"}
              </button>

              <button
                onClick={() =>
                  toggleCampo(produto.id, "destaque", produto.destaque)
                }
                className={`px-3 py-1 rounded-full ${
                  produto.destaque
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {produto.destaque ? "⭐ Destaque" : "Destacar"}
              </button>

              <button
                onClick={() => excluirProduto(produto.id)}
                className="px-3 py-1 rounded-full bg-red-100 text-red-700"
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