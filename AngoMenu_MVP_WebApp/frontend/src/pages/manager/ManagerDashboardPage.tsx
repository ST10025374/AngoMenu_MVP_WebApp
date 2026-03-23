import { Link } from "react-router-dom";

export default function ManagerDashboardPage() {
    return (
        <section className="space-y-6">
            <h1 className="text-3xl font-black text-brand-dark">Painel do Gestor</h1>
            <p className="text-sm text-slate-600">Gerir apenas o restaurante associado à sua conta.</p>

            <div className="grid gap-4 md:grid-cols-3">
                <Link to="/manager/restaurant" className="app-card block p-5 hover:border-brand-red">
                    <h2 className="text-lg font-bold text-brand-dark">Meu Restaurante</h2>
                    <p className="mt-2 text-sm text-slate-600">Ver e atualizar os dados do restaurante.</p>
                </Link>
                <Link to="/manager/menu" className="app-card block p-5 hover:border-brand-red">
                    <h2 className="text-lg font-bold text-brand-dark">Gerir Menu</h2>
                    <p className="mt-2 text-sm text-slate-600">Adicionar, editar e remover pratos.</p>
                </Link>
                <Link to="/manager/reservations" className="app-card block p-5 hover:border-brand-red">
                    <h2 className="text-lg font-bold text-brand-dark">Reservas</h2>
                    <p className="mt-2 text-sm text-slate-600">Consultar e atualizar estado das reservas.</p>
                </Link>
            </div>
        </section>
    );
}