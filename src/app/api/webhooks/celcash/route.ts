import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Endpoint preparado para receber os Webhooks do Cel_cash (antigo Galax Pay)
export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // Verificação de segurança: Cel_cash envia no Header ou no corpo algumas chaves,
    // Mas por enquanto vamos logar o payload e verificar o evento
    console.log("[CEL_CASH_WEBHOOK] Evento recebido:", payload.event);
    
    // O payload do Cel_cash varia dependendo da ação, exemplos:
    // event: 'charge.statusVetoed' | 'charge.statusSucessful' | 'subscription.created'
    const eventType = payload.event;
    
    if (!eventType) {
      return NextResponse.json({ error: "No event type provided" }, { status: 400 });
    }

    switch (eventType) {
      case "charge.statusSucessful":
        // Exemplo: Atualizar se o pagamento passou -> Limpa Inadimplência
        await handleSuccessfulPayment(payload);
        break;

      case "charge.statusVetoed":
        // Se a cobrança falhou -> Cliente Inadimplente
        await handleFailedPayment(payload);
        break;

      case "subscription.created":
      case "subscription.canceled":
        // Atualizar status do dono (owner) ou cliente no banco de dados
        await handleSubscriptionUpdate(payload);
        break;

      default:
        console.log("[CEL_CASH_WEBHOOK] Evento não mapeado, apenas logado:", eventType);
    }

    // Retorna 200 pro Cel_cash parar de mandar o mesmo webhook
    return NextResponse.json({ success: true, received: true });

  } catch (error) {
    console.error("[CEL_CASH_WEBHOOK] Erro ao processar webhook:", error);
    // Mesmo com erro interno, retornar 500 faz o Cel_cash tentar novamente depois
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function handleSuccessfulPayment(payload: any) {
  const { Charge } = payload;
  if (!Charge) return;

  console.log(`[CEL_CASH_WEBHOOK] Pagamento recebido com sucesso. ID: ${Charge.galaxPayId}`);
  
  // Se você tiver o `customerId` vinculado ao CPF ou email do Client:
  if (Charge.Customer && Charge.Customer.document) {
    const cpf = Charge.Customer.document;
    try {
      await prisma.client.updateMany({
        where: { cpf },
        data: { isDefaulter: false }
      });
      console.log(`[CEL_CASH_WEBHOOK] Cliente CPF ${cpf} não está mais inadimplente.`);
    } catch (e) {
      console.error("[CEL_CASH_WEBHOOK] Erro ao atualizar status de inadimplência:", e);
    }
  }
}

async function handleFailedPayment(payload: any) {
  const { Charge } = payload;
  if (!Charge) return;

  console.log(`[CEL_CASH_WEBHOOK] Pagamento RECUSADO. ID: ${Charge.galaxPayId}`);

  // Atualizar cliente para INADIMPLENTE
  if (Charge.Customer && Charge.Customer.document) {
    const cpf = Charge.Customer.document;
    try {
      await prisma.client.updateMany({
        where: { cpf },
        data: { isDefaulter: true }
      });
      console.log(`[CEL_CASH_WEBHOOK] Cliente CPF ${cpf} agora está INADIMPLENTE.`);
    } catch (e) {
      console.error("[CEL_CASH_WEBHOOK] Erro ao marcar cliente como inadimplente:", e);
    }
  }
}

async function handleSubscriptionUpdate(payload: any) {
  const { Subscription } = payload;
  if (!Subscription) return;

  const status = payload.event === 'subscription.canceled' ? 'CANCELLED' : 'ACTIVE';
  console.log(`[CEL_CASH_WEBHOOK] Atualização de assinatura ID: ${Subscription.galaxPayId} - Novo Status: ${status}`);

  // Exemplo (pseudocódigo):
  // await prisma.clientSubscription.updateMany({
  //   where: { externalSubscriptionId: Subscription.galaxPayId },
  //   data: { status: status === 'ACTIVE' ? "ACTIVE" : "CANCELLED" }
  // });
}
