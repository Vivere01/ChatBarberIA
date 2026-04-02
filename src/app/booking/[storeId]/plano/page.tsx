import { redirect } from "next/navigation";

// Since Plano and Clube essentially show the same subscription plans from the client portal,
// we just redirect the 'plano' page to 'clube' where all the logic is correctly implemented.
export default function PlanoPage({ params }: { params: { storeId: string } }) {
    redirect(`/booking/${params.storeId}/clube`);
}
