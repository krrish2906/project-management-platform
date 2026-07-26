"use client";

import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/features/auth/hooks/useAuth";

function ProfilePage() {
    const { user, isLoading, logout } = useAuth(true);

    const joinedDate = user ? new Date(user.createdAt) : null;

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-gray-50 p-6 md:p-8">
                <div className="mx-auto flex h-full max-w-3xl flex-col justify-center gap-6 py-4">

                    {(!user || isLoading) && (
                        <div className="flex flex-1 items-center justify-center text-sm text-gray-500">
                            {isLoading ? "Loading profile..." : "Unable to load profile."}
                        </div>
                    )}

                    {user && !isLoading && (
                        <>
                            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-3xl font-semibold text-white md:h-20 md:w-20">
                                        {(user.name && user.name.charAt(0).toUpperCase()) ||
                                            (user.email && user.email.charAt(0).toUpperCase()) ||
                                            "U"}
                                    </div>
                                    <div className="space-y-1">
                                        <h1 className="text-2xl font-semibold text-gray-900">
                                            {user.name}
                                        </h1>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                            {user.role && (
                                                <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 font-medium text-indigo-700">
                                                    {user.role}
                                                </span>
                                            )}
                                            {joinedDate && (
                                                <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1">
                                                    Member since{" "}
                                                    {joinedDate.toLocaleDateString(undefined, {
                                                        year: "numeric",
                                                        month: "short",
                                                    })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
                                <h2 className="text-sm font-semibold text-gray-900">
                                    Account details
                                </h2>
                                <p className="mt-1 text-xs text-gray-500">
                                    Basic information associated with your account.
                                </p>

                                <dl className="mt-4 space-y-3 text-sm">
                                    <div className="flex items-center justify-between gap-4">
                                        <dt className="text-gray-500">Full name</dt>
                                        <dd className="font-medium text-gray-900">{user.name}</dd>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <dt className="text-gray-500">Email</dt>
                                        <dd className="font-medium text-gray-900">{user.email}</dd>
                                    </div>
                                    {joinedDate && (
                                        <div className="flex items-center justify-between gap-4">
                                            <dt className="text-gray-500">Joined</dt>
                                            <dd className="font-medium text-gray-900">
                                                {joinedDate.toLocaleDateString(undefined, {
                                                    day: "2-digit",
                                                    month: "long",
                                                    year: "numeric",
                                                })}
                                            </dd>
                                        </div>
                                    )}
                                </dl>

                                <div className="mt-6 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={logout}
                                        className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 cursor-pointer"
                                    >
                                        Log out
                                    </button>
                                </div>
                            </section>
                        </>
                    )}

                </div>
            </main>
        </div>
    );
}

export default ProfilePage;
