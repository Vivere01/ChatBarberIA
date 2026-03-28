import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Endpoint PERSONALIZADO para cada Owner para evitar mistura de dados entre barbearias
export async function POST(
  req: Request,
  { params }: { params: { ownerId: string } }
) {
  try {
    const ownerId = params.ownerId;
    if (!ownerId) {
       return NextResponse.json({ error: "Owner ID is required" }, { status: 400 });
    }

    const payload = await req.json();
    const eventType = payload.event;
    
    console.log(`[CEL_CASH_WEBHOOK] Evento ${eventType} para Owner ${ownerId}`);

    if (!eventType) {
      return NextResponse.json({ error: "No event type provided" }, { status: 400 });
    }

    // Buscar as configurações do Owner para checar se ele tem Celcash ativado (Opcional, mas seguro)
    const ownerSettings = await prisma.owner.findUnique({
        where: { id: ownerId },
        select: { celcashToken: true, celcashPublicToken: true }
    });

    if (!ownerSettings?.celcashToken) {
        console.warn(`[CEL_CASH_WEBHOOK] Owner ${ownerId} não configurou os Tokens.`);
    }

    switch (eventType) {
      case "charge.statusSucessful":
        await handleSuccessfulPayment(payload, ownerId);
        break;

      case "charge.statusVetoed":
        await handleFailedPayment(payload, ownerId);
        break;

      case "subscription.created":
      case "subscription.canceled":
        await handleSubscriptionUpdate(payload, ownerId);
        break;

      default:
        console.log("[CEL_CASH_WEBHOOK] Evento não mapeado:", eventType);
    }

    return NextResponse.json({ success: true, received: true });

  } catch (error) {
    console.error("[CEL_CASH_WEBHOOK] Erro:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function handleSuccessfulPayment(payload: any, ownerId: string) {
  const { Charge } = payload;
  if (!Charge?.Customer?.document) return;

  const cpf = Charge.Customer.document;
  try {
    // Só atualiza os clientes desse OWNER específico para evitar conflito entre barbearias
    await prisma.client.updateMany({
      where: { 
          cpf,
          ownerId: ownerId 
      },
      data: { isDefaulter: false }
    });
    console.log(`[CEL_CASH_WEBHOOK] Sucesso: Cliente CPF ${cpf} (Barbearia ${ownerId}) pago.`);
  } catch (e) {
    console.error("[CEL_CASH_WEBHOOK] Erro ao atualizar inadimplência:", e);
  }
}

async function handleFailedPayment(payload: any, ownerId: string) {
  const { Charge } = payload;
  if (!Charge?.Customer?.document) return;

  const cpf = Charge.Customer.document;
  try {
    await prisma.client.updateMany({
      where: { 
          cpf,
          ownerId: ownerId 
      },
      data: { isDefaulter: true }
    });
    console.log(`[CEL_CASH_WEBHOOK] Recusa: Cliente CPF ${cpf} (Barbearia ${ownerId}) inadimplente.`);
  } catch (e) {
    console.error("[CEL_CASH_WEBHOOK] Erro ao marcar inadimplência:", e);
  }
}

async function handleSubscriptionUpdate(payload: any, ownerId: string) {
  const { Subscription } = payload;
  if (!Subscription) return;

  const status = payload.event === 'subscription.canceled' ? 'CANCELLED' : 'ACTIVE';
  console.log(`[CEL_CASH_WEBHOOK] Assinatura ${Subscription.galaxPayId} do Owner ${ownerId} agora é ${status}`);
  
  // Aqui você pode atualizar o status no banco caso já tenha criado a tabela de assinaturas
}
