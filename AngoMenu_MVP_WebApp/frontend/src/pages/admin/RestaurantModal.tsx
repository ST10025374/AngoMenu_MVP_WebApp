import { useEffect } from "react";

export default function RestaurantModal({
    title,
    isOpen,
    children,
    onClose,
}: {
    title: string;
    isOpen: boolean;
    children: React.ReactNode;
    onClose: () => void;
    }) {
    useEffect(() => {
        if (!isOpen) return undefined;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4" role="dialog" aria-modal="true">
            <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <h2 className="text-xl font-black text-brand-dark">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg px-2 py-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Fechar modal"
                    >
                        ×
                    </button>
                </div>
                <div className="min-h-0 flex-1 px-6 py-5">{children}</div>
            </div>
        </div>
    );
}