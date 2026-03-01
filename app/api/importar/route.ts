import { NextResponse } from "next/server"

function extrair(html: string, regex: RegExp) {
  const match = html.match(regex)
  return match ? match[1] : null
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json()

    if (!url || !url.includes("shopee")) {
      return NextResponse.json(
        { error: "Link inválido. Use link da Shopee." },
        { status: 400 }
      )
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    })

    const html = await response.text()

    const nome =
      extrair(html, /<title>(.*?)<\/title>/) ||
      "Produto Shopee"

    const imagem_url =
      extrair(html, /property="og:image" content="(.*?)"/) ||
      ""

    const precoAtual =
      extrair(html, /"price":"(.*?)"/) ||
      ""

    const precoAntigo =
      extrair(html, /"price_before_discount":"(.*?)"/) ||
      ""

    let categoria = "Casa"

    const nomeLower = nome.toLowerCase()

    if (
      nomeLower.includes("fone") ||
      nomeLower.includes("celular") ||
      nomeLower.includes("tv") ||
      nomeLower.includes("notebook") ||
      nomeLower.includes("monitor")
    ) {
      categoria = "Eletronicos"
    }

    if (
      nomeLower.includes("whey") ||
      nomeLower.includes("suplemento") ||
      nomeLower.includes("halter") ||
      nomeLower.includes("academia") ||
      nomeLower.includes("treino")
    ) {
      categoria = "Fitness"
    }

    let desconto = null

    if (precoAtual && precoAntigo) {
      const atual = parseFloat(precoAtual)
      const antigo = parseFloat(precoAntigo)

      if (antigo > atual) {
        desconto = Math.round(((antigo - atual) / antigo) * 100)
      }
    }

    let badge = null

    if (desconto && desconto >= 50) {
      badge = "🔥 SUPER OFERTA"
    } else if (desconto && desconto >= 30) {
      badge = "⚡ OFERTA RELÂMPAGO"
    } else if (desconto && desconto >= 10) {
      badge = "💰 BOA OFERTA"
    }

    return NextResponse.json({
      nome,
      imagem_url,
      preco: precoAtual,
      preco_antigo: precoAntigo,
      categoria,
      desconto,
      badge
    })

  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao importar produto" },
      { status: 500 }
    )
  }
}