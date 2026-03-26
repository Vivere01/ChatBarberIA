import { getStoreBySlug } from "@/app/actions/booking-actions";
import { redirect, notFound } from "next/navigation";

export default async function MiniSitePage({ params }: { params: { slug: string } }) {
    const store = await getStoreBySlug(params.slug);

    if (!store) {
        notFound();
    }

    // Redirect to the new booking login flow
    redirect(`/booking/${store.id}/login`);
}
