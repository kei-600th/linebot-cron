/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ルートにPOSTが来ているログなので、ここで受ける（/webhookにしているならpathを合わせる）
    if (request.method === "POST" && url.pathname === "/") {
      // ★ 生ボディ文字列を取得（署名検証もこれと同じ文字列で計算する）
      const raw = await request.text();

      // 署名検証（本番では必須）
      const ok = await verifyLineSignature(raw, request.headers.get("x-line-signature"), env.LINE_CHANNEL_SECRET);
      if (!ok) {
        console.warn("Invalid signature");
        return new Response("Forbidden", { status: 403 });
      }

      // JSON化してログ表示
      try {
        const json = JSON.parse(raw);
        console.log("Webhook JSON:", JSON.stringify(json, null, 2));

        // groupId / roomId / userId の抽出例（最初のイベント）
        const ev = json?.events?.[0];
        const src = ev?.source;
        if (src?.type === "group") {
          console.log(">> groupId:", src.groupId);
        } else if (src?.type === "room") {
          console.log(">> roomId:", src.roomId);
        } else if (src?.type === "user") {
          console.log(">> userId:", src.userId);
        }
      } catch (e) {
        console.error("JSON parse error:", e);
      }

      return new Response("OK", { status: 200 });
    }

    return new Response("Not Found", { status: 404 });
  },

  async scheduled(event, env, ctx) {
    // 定期実行時刻を設定（0:00 JST）
    const SCHEDULED_HOUR = 0;
    const SCHEDULED_MINUTE = 0;
    
    // 現在時刻（JST）を取得
    const now = new Date();
    const jstOffset = 9 * 60; // JST = UTC+9
    const jstTime = new Date(now.getTime() + jstOffset * 60 * 1000);
    
    const currentHour = jstTime.getUTCHours();
    const currentMinute = jstTime.getUTCMinutes();
    
    console.log(`Scheduled event triggered. Current JST time: ${jstTime.toISOString()}`);
    
    // 設定された時刻かチェック
    if (currentHour === SCHEDULED_HOUR && currentMinute === SCHEDULED_MINUTE) {
      console.log("Sending scheduled LINE message...");
      
      try {
        await sendLineMessage(env.LINE_CHANNEL_ACCESS_TOKEN, env.LINE_TO_ID, "お薬はちゃんと飲みましたか？");
        console.log("Scheduled message sent successfully");
      } catch (error) {
        console.error("Failed to send scheduled message:", error);
      }
    } else {
      console.log(`Not the scheduled time. Target: ${SCHEDULED_HOUR}:${String(SCHEDULED_MINUTE).padStart(2, '0')}, Current: ${currentHour}:${String(currentMinute).padStart(2, '0')}`);
    }
  }
};

async function verifyLineSignature(rawBody, signatureBase64, channelSecret) {
  if (!signatureBase64 || !channelSecret) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(channelSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  const calcBase64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return calcBase64 === signatureBase64;
}

async function sendLineMessage(accessToken, toId, message) {
  const response = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: toId,
      messages: [
        {
          type: "text",
          text: message
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LINE API error: ${response.status} ${errorText}`);
  }

  return response;
}

