// Estilos customizados para TODAS as tags de formatação de texto
export const tagsStyles = {
  // ====================
  // TEXTO BASE
  // ====================
  body: {
    whiteSpace: "normal" as const,
    color: "#1f2937", // gray-800
    fontSize: 16,
    lineHeight: 26, // Espaçamento entre linhas
    fontFamily: "System",
  },

  // ====================
  // PARÁGRAFOS
  // ====================
  p: {
    marginBottom: 16, // Espaçamento entre parágrafos
    marginTop: 0,
    color: "#374151", // gray-700
    fontSize: 16,
    lineHeight: 26, // Espaçamento entre linhas dentro do parágrafo
  },

  // ====================
  // CABEÇALHOS (H1-H6)
  // ====================
  h1: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: "#111827", // gray-900
    marginBottom: 20,
    marginTop: 32,
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#111827",
    marginBottom: 18,
    marginTop: 28,
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: "600" as const,
    color: "#1f2937",
    marginBottom: 16,
    marginTop: 24,
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: "#374151",
    marginBottom: 14,
    marginTop: 20,
    lineHeight: 28,
  },
  h5: {
    fontSize: 18,
    fontWeight: "500" as const,
    color: "#4b5563",
    marginBottom: 12,
    marginTop: 16,
    lineHeight: 26,
  },
  h6: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: "#6b7280",
    marginBottom: 10,
    marginTop: 14,
    lineHeight: 24,
  },

  // ====================
  // FORMATAÇÃO DE TEXTO
  // ====================

  // NEGRITO (Bold)
  strong: {
    fontWeight: "700" as const, // Peso da fonte (negrito)
    color: "#111827", // Cor mais escura para destacar
  },
  b: {
    fontWeight: "700" as const,
    color: "#111827",
  },

  // ITÁLICO (Italic)
  em: {
    fontStyle: "italic" as const,
    color: "#374151",
  },
  i: {
    fontStyle: "italic" as const,
    color: "#374151",
  },

  // SUBLINHADO (Underline)
  u: {
    textDecorationLine: "underline" as const,
    textDecorationColor: "#374151",
    color: "#374151",
  },

  // RISCADO / STRIKETHROUGH
  s: {
    textDecorationLine: "line-through" as const,
    textDecorationColor: "#9ca3af",
    color: "#9ca3af", // Texto mais claro quando riscado
  },
  del: {
    textDecorationLine: "line-through" as const,
    textDecorationColor: "#9ca3af",
    color: "#9ca3af",
  },
  strike: {
    textDecorationLine: "line-through" as const,
    textDecorationColor: "#9ca3af",
    color: "#9ca3af",
  },

  // SUBSCRITO e SOBRESCRITO
  sub: {
    fontSize: 12,
    lineHeight: 16,
  },
  sup: {
    fontSize: 12,
    lineHeight: 16,
  },

  // DESTAQUE (Highlight/Mark)
  mark: {
    backgroundColor: "#fef3c7", // yellow-100
    color: "#78350f", // yellow-900
    paddingHorizontal: 4,
    paddingVertical: 2,
  },

  // TEXTO PEQUENO
  small: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 22,
  },

  // ====================
  // LINKS
  // ====================
  a: {
    color: "#3b82f6", // blue-500
    textDecorationLine: "underline" as const,
    fontWeight: "600" as const,
  },

  // ====================
  // CITAÇÕES (Blockquote)
  // ====================
  blockquote: {
    backgroundColor: "#f0f9ff", // blue-50
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6", // blue-500
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginVertical: 20,
    marginLeft: 0,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    fontStyle: "italic" as const,
    color: "#1e40af", // blue-800
  },

  // ====================
  // LISTAS (UL e OL)
  // ====================
  ul: {
    paddingLeft: 0,
    marginBottom: 20,
    marginTop: 8,
  },
  ol: {
    paddingLeft: 0,
    marginBottom: 20,
    marginTop: 8,
  },
  li: {
    marginBottom: 10,
    marginLeft: 24,
    color: "#374151",
    fontSize: 16,
    lineHeight: 26, // Espaçamento entre linhas nos itens da lista
  },

  // ====================
  // CÓDIGO (Code)
  // ====================

  // Código inline
  code: {
    backgroundColor: "#f3f4f6", // gray-100
    color: "#dc2626", // red-600
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 14,
    fontFamily: "Courier" as const,
  },

  // Bloco de código
  pre: {
    backgroundColor: "#1f2937", // gray-800
    color: "#f9fafb", // gray-50
    padding: 16,
    borderRadius: 8,
    marginVertical: 20,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: "Courier" as const,
    overflow: "scroll" as const,
  },

  // ====================
  // OUTROS ELEMENTOS
  // ====================

  // Linha horizontal
  hr: {
    marginVertical: 28,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb", // gray-200
    height: 0,
  },

  // Divisão de seção
  div: {
    marginVertical: 0,
  },

  // Span (genérico)
  span: {
    color: "#374151",
  },

  // Imagens
  img: {
    marginVertical: 20,
  },

  // Tabelas (básico)
  table: {
    marginVertical: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  td: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  th: {
    padding: 8,
    fontWeight: "600" as const,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
};

// Configuração de estilos para classes CSS personalizadas
export const classesStyles = {
  // Alinhamento de texto
  "text-left": {
    textAlign: "left" as const,
  },
  "text-center": {
    textAlign: "center" as const,
  },
  "text-right": {
    textAlign: "right" as const,
  },
  "text-justify": {
    textAlign: "justify" as const,
  },

  // Espaçamentos customizados
  "spacing-tight": {
    lineHeight: 20,
  },
  "spacing-normal": {
    lineHeight: 26,
  },
  "spacing-relaxed": {
    lineHeight: 32,
  },
  "spacing-loose": {
    lineHeight: 40,
  },

  // Destaque especial
  highlight: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },

  // Avisos
  warning: {
    backgroundColor: "#fef2f2", // red-50
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444", // red-500
    padding: 16,
    borderRadius: 4,
    marginVertical: 16,
  },
  info: {
    backgroundColor: "#eff6ff", // blue-50
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6", // blue-500
    padding: 16,
    borderRadius: 4,
    marginVertical: 16,
  },
  success: {
    backgroundColor: "#f0fdf4", // green-50
    borderLeftWidth: 4,
    borderLeftColor: "#10b981", // green-500
    padding: 16,
    borderRadius: 4,
    marginVertical: 16,
  },
};
