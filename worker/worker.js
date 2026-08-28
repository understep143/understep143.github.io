// Cloudflare Worker: прячет токен Telegram-бота и пересылает итог квеста.
//
// Секреты (задаются в Cloudflare, НЕ в этом файле):
//   BOT_TOKEN     — токен бота от BotFather
//   CHAT_ID       — твой chat_id в Telegram (куда слать уведомление)
//   QUEST_SECRET  — произвольная строка, тот же секрет прописан в script.js на сайте
//
// Как задеплоить — см. README.md в корне проекта.

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders() });
    }

    let data;
    try {
      data = await request.json();
    } catch (err) {
      return new Response('Bad request', { status: 400, headers: corsHeaders() });
    }

    if (!env.QUEST_SECRET || data.secret !== env.QUEST_SECRET) {
      return new Response('Forbidden', { status: 403, headers: corsHeaders() });
    }

    const text = buildMessage(data);

    const tgResp = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.CHAT_ID,
        text,
        parse_mode: 'HTML'
      })
    });

    if (!tgResp.ok) {
      return new Response('Telegram error', { status: 502, headers: corsHeaders() });
    }

    return new Response('ok', { headers: corsHeaders() });
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildMessage(d) {
  const lines = [];
  lines.push('🎮 <b>Квест пройден до конца!</b>');
  lines.push('');

  if (d.greeting) lines.push(`👋 Как поздороваться: ${esc(d.greeting)}`);

  if (Array.isArray(d.likedTopics) && d.likedTopics.length) {
    lines.push('');
    lines.push('💬 Понравившиеся темы:');
    d.likedTopics.forEach((t) => lines.push(`  • ${esc(t)}`));
  }

  if (Array.isArray(d.destinations) && d.destinations.length) {
    lines.push('');
    lines.push('📍 Куда хочет пойти:');
    d.destinations.forEach((t) => lines.push(`  • ${esc(t)}`));
  }

  if (d.dayPhase) {
    lines.push('');
    lines.push(`🕐 До какого часа гулять: ${esc(d.dayPhase)}`);
  }

  lines.push('');
  lines.push('Увидимся 31 августа 🐾');
  return lines.join('\n');
}
