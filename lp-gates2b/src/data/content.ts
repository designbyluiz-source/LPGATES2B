/**
 * GATES2B — Conteúdo da landing page
 * Todo o copy da LP vive aqui. Editar este arquivo altera a página inteira.
 */

export const site = {
  name: 'Gates2B',
  title: 'Gates2B — Infraestrutura de Monetização Global',
  description:
    'Conectando pagamentos, liquidação e operações internacionais através de uma única infraestrutura. Segurança para operar. Liberdade para crescer.',
  url: 'https://gates2b.com',
  locale: 'pt_BR',
};

export const nav = {
  links: [
    { label: 'Produto', href: '#produto' },
    { label: 'Como funciona', href: '#como-funciona' },
    { label: 'Infraestrutura', href: '#infraestrutura' },
    { label: 'Desenvolvedores', href: '#api-first' },
    { label: 'Segurança', href: '#seguranca' },
  ],
  cta: { label: 'Solicitar demonstração', href: '#contato' },
  ctaSecondary: { label: 'Documentação', href: '#documentacao' },
};

export const hero = {
  eyebrow: 'Pagamentos · Liquidação · Operação global',
  title: ['Infraestrutura de', 'monetização global.'],
  subtitle:
    'Conectando pagamentos, liquidação e operações internacionais através de uma única infraestrutura.',
  paragraphs: [
    'A Gates2B foi desenvolvida para empresas que precisam receber, processar, conciliar e movimentar recursos com previsibilidade operacional.',
    'Uma arquitetura preparada para integrar diferentes meios de pagamento, moedas e fluxos financeiros em uma única operação.',
  ],
  primaryCta: { label: 'Solicitar demonstração', href: '#contato' },
  secondaryCta: { label: 'Falar com especialista', href: '#contato' },
  ticker: [
    'Pagamentos Conectados',
    'Liquidação Internacional',
    'APIs Modernas',
    'Governança Operacional',
  ],
};

export const visibilidade = {
  eyebrow: 'Visibilidade operacional',
  title: 'Cada evento. Cada liquidação. Cada movimento.',
  description:
    'Acompanhe a operação em tempo real através de uma infraestrutura construída para oferecer clareza, rastreabilidade e controle.',
  modules: [
    { label: 'Saldo Consolidado', metric: 'R$ 48.219.740,22', delta: '+2,4%' },
    { label: 'Liquidações', metric: '12.884', delta: 'hoje' },
    { label: 'Eventos', metric: '1,2M', delta: '24h' },
    { label: 'Webhooks', metric: '99,99%', delta: 'entrega' },
    { label: 'Conciliação', metric: '100%', delta: 'automática' },
    { label: 'Transferências', metric: '3.401', delta: 'em fila' },
    { label: 'Pagamentos', metric: '87.552', delta: 'processados' },
    { label: 'Relatórios', metric: '24/7', delta: 'disponíveis' },
  ],
  stream: [
    { type: 'payment.captured', value: 'R$ 12.480,00', country: 'BR' },
    { type: 'settlement.created', value: 'USD 84.200,00', country: 'US' },
    { type: 'payout.completed', value: 'EUR 21.905,50', country: 'PT' },
    { type: 'webhook.delivered', value: '204 OK', country: '—' },
    { type: 'reconciliation.matched', value: '1.284 itens', country: 'BR' },
    { type: 'transfer.approved', value: 'MXN 402.118,00', country: 'MX' },
    { type: 'payment.authorized', value: 'GBP 9.740,00', country: 'UK' },
    { type: 'settlement.released', value: 'R$ 1.204.880,00', country: 'BR' },
  ],
};

export const produto = {
  eyebrow: 'O produto',
  title: 'A base operacional por trás de negócios em crescimento.',
  paragraphs: [
    'À medida que uma operação evolui, pagamentos deixam de ser apenas recebimentos.',
    'Passam a envolver liquidação, conciliação, repasses, múltiplos mercados, diferentes moedas e exigências regulatórias.',
    'A Gates2B organiza essa complexidade em uma infraestrutura única, preparada para acompanhar a evolução da sua operação.',
  ],
  features: [
    {
      title: 'Pagamentos Conectados',
      description:
        'Centralize diferentes meios de pagamento em uma única estrutura operacional.',
      icon: 'connect',
    },
    {
      title: 'Liquidação Unificada',
      description:
        'Acompanhe entradas, saídas e movimentações financeiras com maior previsibilidade.',
      icon: 'settle',
    },
    {
      title: 'Operação Multi-Mercado',
      description: 'Infraestrutura preparada para atender operações locais e internacionais.',
      icon: 'globe',
    },
    {
      title: 'APIs para Escala',
      description:
        'Arquitetura desenvolvida para integração, automação e crescimento contínuo.',
      icon: 'code',
    },
  ],
};

export const numeros = {
  eyebrow: 'Números',
  items: [
    { value: 3.5, prefix: '+ R$ ', suffix: ' BI', decimals: 1, label: 'Processados' },
    { value: 99.99, prefix: '', suffix: '%', decimals: 2, label: 'Disponibilidade' },
    { value: 24, prefix: '', suffix: '/7', decimals: 0, label: 'Monitoramento' },
    { value: null, text: 'Multi-país', label: 'Operação global' },
  ],
};

export const comoFunciona = {
  eyebrow: 'Como funciona',
  title: 'Uma única infraestrutura para diferentes fluxos financeiros.',
  steps: [
    {
      n: '01',
      title: 'Integração',
      description: 'Conecte sua plataforma através das APIs Gates2B.',
      detail: 'Credenciais, ambiente de homologação e SDKs disponíveis desde o primeiro dia.',
    },
    {
      n: '02',
      title: 'Processamento',
      description: 'Receba pagamentos através de diferentes meios e mercados.',
      detail: 'Múltiplos métodos e moedas em uma mesma estrutura de captura.',
    },
    {
      n: '03',
      title: 'Liquidação',
      description: 'Gerencie movimentações financeiras com rastreabilidade e controle.',
      detail: 'Eventos, conciliação e repasses organizados em um histórico auditável.',
    },
    {
      n: '04',
      title: 'Escala',
      description: 'Expanda sua operação utilizando a mesma infraestrutura.',
      detail: 'Novos mercados e volumes sem reconstruir a base operacional.',
    },
  ],
};

export const infraestrutura = {
  eyebrow: 'Infraestrutura',
  title: 'Projetada para operações que exigem previsibilidade.',
  paragraphs: [
    'A Gates2B ocupa o ponto de convergência entre pagamentos, liquidação financeira, gestão operacional e expansão internacional.',
    'Nossa infraestrutura foi construída para transformar processos complexos em operações organizadas, rastreáveis e escaláveis.',
  ],
  items: [
    {
      title: 'Governança Operacional',
      description: 'Processos estruturados para operações que exigem controle.',
    },
    {
      title: 'Conciliação Financeira',
      description: 'Maior clareza sobre eventos, liquidações e movimentações.',
    },
    { title: 'Observabilidade', description: 'Visibilidade contínua sobre a operação.' },
    {
      title: 'Arquitetura Escalável',
      description: 'Preparada para acompanhar o crescimento do negócio.',
    },
  ],
};

export const global = {
  eyebrow: 'Operação global',
  title: 'Uma infraestrutura preparada para acompanhar novos mercados.',
  paragraphs: [
    'Expansão internacional exige mais do que novos meios de pagamento.',
    'Exige uma base operacional capaz de conectar moedas, liquidações e fluxos financeiros de forma consistente.',
    'A Gates2B foi desenvolvida para sustentar esse crescimento.',
  ],
  items: [
    { title: 'Múltiplas Moedas', description: 'Operações preparadas para diferentes mercados.' },
    {
      title: 'Liquidação Internacional',
      description: 'Fluxos financeiros organizados em uma única estrutura.',
    },
    { title: 'Gestão Centralizada', description: 'Menos fragmentação operacional.' },
    {
      title: 'Escalabilidade',
      description: 'Uma infraestrutura preparada para novos volumes e novas geografias.',
    },
  ],
  currencies: ['BRL', 'USD', 'EUR', 'GBP', 'MXN', 'CLP', 'COP', 'ARS', 'PEN', 'USDC'],
};

export const devIA = {
  eyebrow: 'Desenvolvimento contemporâneo',
  title: 'Documentação preparada para equipes modernas.',
  paragraphs: [
    'A Gates2B disponibiliza recursos estruturados para desenvolvimento assistido por inteligência artificial.',
    'Além da documentação tradicional, disponibilizamos um arquivo de contexto dedicado para modelos de linguagem, permitindo que assistentes de código interpretem recursos, fluxos e endpoints da plataforma durante a implementação.',
  ],
  tools: [
    { name: 'Claude', description: 'Compreensão contextual da documentação e dos fluxos da plataforma.' },
    { name: 'Cursor', description: 'Apoio na implementação de integrações diretamente no ambiente de desenvolvimento.' },
    { name: 'ChatGPT', description: 'Consulta de recursos, endpoints e exemplos de utilização.' },
    { name: 'Copilot', description: 'Assistência na construção e manutenção de integrações.' },
  ],
  callout: {
    title: 'Arquivo de Contexto para IA',
    description:
      'Um recurso adicional desenvolvido para tornar a documentação mais acessível ao ecossistema moderno de desenvolvimento.',
    cta: { label: 'Acessar documentação', href: '#documentacao' },
  },
  terminalLines: [
    { prompt: true, text: 'curl https://docs.gates2b.com/llms.txt' },
    { text: '# Gates2B — Infraestrutura de Monetização Global' },
    { text: '## Recursos' },
    { text: '- /v1/payments        captura e autorização' },
    { text: '- /v1/settlements     liquidação e repasses' },
    { text: '- /v1/transfers       movimentação financeira' },
    { text: '- /v1/webhooks        eventos em tempo real' },
    { text: '## Ambientes' },
    { text: '- sandbox  homologação' },
    { text: '- live     produção' },
    { ok: true, text: '✓ contexto carregado — 100% dos endpoints mapeados' },
  ],
};

export const apiFirst = {
  eyebrow: 'API-first',
  title: 'Desenvolvida para integrar com clareza.',
  description:
    'Uma arquitetura criada para facilitar implementações, automações e evolução contínua.',
  items: [
    {
      title: 'REST APIs',
      description: 'Endpoints organizados para pagamentos, liquidação e gestão financeira.',
    },
    { title: 'Webhooks', description: 'Eventos em tempo real para sincronização de sistemas.' },
    {
      title: 'Ambientes Segregados',
      description: 'Produção e homologação organizadas para maior segurança operacional.',
    },
    {
      title: 'Documentação Estruturada',
      description: 'Referências técnicas desenvolvidas para equipes e ferramentas modernas.',
    },
  ],
  tabs: [
    {
      id: 'pagamento',
      label: 'Criar pagamento',
      lines: [
        { t: 'k', v: 'const' },
        { t: 'p', v: ' payment ' },
        { t: 'o', v: '= ' },
        { t: 'k', v: 'await' },
        { t: 'p', v: ' gates2b' },
        { t: 'o', v: '.' },
        { t: 'f', v: 'payments' },
        { t: 'o', v: '.' },
        { t: 'f', v: 'create' },
        { t: 'o', v: '({' },
      ],
    },
  ],
  code: {
    request: [
      'POST /v1/payments',
      'Authorization: Bearer sk_live_•••••••••••',
      'Content-Type: application/json',
      '',
      '{',
      '  "amount": 148000,',
      '  "currency": "BRL",',
      '  "method": "pix",',
      '  "reference": "ord_9f2c81",',
      '  "settlement": {',
      '    "schedule": "d+1",',
      '    "account": "acc_2b10"',
      '  }',
      '}',
    ],
    response: [
      '201 Created',
      '',
      '{',
      '  "id": "pay_3kd82hf0",',
      '  "status": "authorized",',
      '  "amount": 148000,',
      '  "currency": "BRL",',
      '  "settlement": {',
      '    "id": "stl_77ab21",',
      '    "expected_at": "2026-08-13T03:00:00Z"',
      '  },',
      '  "traceable": true',
      '}',
    ],
  },
  events: [
    'payment.authorized',
    'payment.captured',
    'settlement.created',
    'settlement.released',
    'transfer.completed',
    'reconciliation.matched',
  ],
};

export const seguranca = {
  eyebrow: 'Segurança e governança',
  title: 'Confiança construída através de processos.',
  paragraphs: [
    'Operações financeiras exigem estabilidade, transparência e responsabilidade.',
    'Por isso, a infraestrutura Gates2B foi desenvolvida com foco em rastreabilidade, governança e previsibilidade operacional.',
  ],
  items: [
    { title: 'Compliance', description: 'Processos alinhados às exigências regulatórias.', icon: 'shield' },
    { title: 'Transparência', description: 'Eventos e movimentações com histórico rastreável.', icon: 'trace' },
    { title: 'Segurança', description: 'Proteção aplicada em todas as etapas da operação.', icon: 'lock' },
    {
      title: 'Monitoramento Contínuo',
      description: 'Observabilidade e acompanhamento permanente da infraestrutura.',
      icon: 'pulse',
    },
  ],
};

export const paraQuem = {
  eyebrow: 'Para quem é',
  title: 'Desenvolvida para operações que precisam crescer com consistência.',
  items: [
    { title: 'Fintechs', description: 'Infraestrutura para produtos financeiros digitais.' },
    { title: 'Gateways', description: 'Conectividade para múltiplos fluxos de pagamento.' },
    { title: 'Marketplaces', description: 'Gestão financeira e operacional centralizada.' },
    { title: 'Plataformas SaaS', description: 'Pagamentos integrados à experiência do produto.' },
    {
      title: 'Operações Internacionais',
      description: 'Liquidação e movimentação financeira entre mercados.',
    },
  ],
};

export const depoimentos = {
  eyebrow: 'Depoimentos',
  items: [
    {
      quote: 'A Gates2B trouxe previsibilidade para uma operação que crescia rapidamente.',
      role: 'Diretor Financeiro',
      image: '/img/pessoa-1',
    },
    {
      quote:
        'A integração ocorreu de forma organizada e a documentação facilitou todo o processo.',
      role: 'Head de Tecnologia',
      image: '/img/pessoa-2',
    },
    {
      quote: 'Hoje temos uma visão muito mais clara da operação financeira.',
      role: 'COO',
      image: '/img/pessoa-4',
    },
  ],
};

export const documentacao = {
  eyebrow: 'Documentação',
  title: 'Desenvolvida para quem constrói.',
  bullets: [
    'APIs claras.',
    'Fluxos organizados.',
    'Referências técnicas completas.',
    'Recursos preparados para desenvolvimento assistido por IA.',
  ],
  closing:
    'Tudo estruturado para facilitar a implementação e a evolução contínua da operação.',
  cta: { label: 'Explorar documentação', href: '#documentacao' },
};

export const ctaFinal = {
  eyebrow: 'CTA final',
  title: 'Escale além das fronteiras.',
  description:
    'Pagamentos, liquidação e operações internacionais organizados em uma única infraestrutura.',
  claim: ['Segurança para operar.', 'Liberdade para crescer.'],
  primaryCta: { label: 'Solicitar demonstração', href: '#contato' },
  secondaryCta: { label: 'Falar com especialista', href: '#contato' },
};

export const footer = {
  claim: ['Segurança para operar.', 'Liberdade para crescer.'],
  columns: [
    {
      title: 'Plataforma',
      links: [
        { label: 'Produto', href: '#produto' },
        { label: 'Como funciona', href: '#como-funciona' },
        { label: 'Infraestrutura', href: '#infraestrutura' },
        { label: 'Operação global', href: '#global' },
      ],
    },
    {
      title: 'Desenvolvedores',
      links: [
        { label: 'API-first', href: '#api-first' },
        { label: 'Documentação', href: '#documentacao' },
        { label: 'Webhooks', href: '#api-first' },
        { label: 'Arquivo de contexto para IA', href: '#dev-ia' },
      ],
    },
    {
      title: 'Confiança',
      links: [
        { label: 'Segurança', href: '#seguranca' },
        { label: 'Governança', href: '#seguranca' },
        { label: 'Compliance', href: '#seguranca' },
        { label: 'Monitoramento', href: '#seguranca' },
      ],
    },
    {
      title: 'Contato',
      links: [
        { label: 'Solicitar demonstração', href: '#contato' },
        { label: 'Falar com especialista', href: '#contato' },
        { label: 'contato@gates2b.com', href: 'mailto:contato@gates2b.com' },
      ],
    },
  ],
  legal: `© ${new Date().getFullYear()} Gates2B. Todos os direitos reservados.`,
  legalLinks: [
    { label: 'Termos de uso', href: '#' },
    { label: 'Política de privacidade', href: '#' },
  ],
};
